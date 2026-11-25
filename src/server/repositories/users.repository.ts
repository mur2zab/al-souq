import { dbStore, UserWithAuth } from '@/server/db/store';
import { getDb, initPostgresTables } from '@/server/db/postgres';
import { User } from '@/types';
import { hashPassword } from '@/server/auth/auth';

function mapRowToUser(row: any): UserWithAuth {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    itsNumber: row.its_number,
    itsCardProofUrl: row.its_card_proof_url,
    livePhotoUrl: row.live_photo_url,
    verificationStatus: row.verification_status,
    cityId: row.city_id,
    cityName: row.city_name,
    mohallaName: row.mohalla_name,
    role: row.role,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    passwordHash: row.password_hash,
  };
}

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`SELECT * FROM alsouq_users WHERE id = ${id} LIMIT 1`;
        if (rows.length > 0) {
          const { passwordHash, ...safeUser } = mapRowToUser(rows[0]);
          return safeUser;
        }
      } catch (err) {
        console.warn('Postgres findById error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    const user = dbStore.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findByEmailOrPhone(identifier: string): Promise<UserWithAuth | null> {
    const sql = getDb();
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`
          SELECT * FROM alsouq_users
          WHERE LOWER(email) = ${clean}
             OR (${cleanPhone.length >= 8} AND phone LIKE ${`%${cleanPhone}%`})
          LIMIT 1
        `;
        if (rows.length > 0) {
          return mapRowToUser(rows[0]);
        }
      } catch (err) {
        console.warn('Postgres findByEmailOrPhone error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    return (
      dbStore.users.find(
        (u) =>
          u.email.toLowerCase() === clean ||
          (cleanPhone.length >= 8 && u.phone.replace(/[^0-9]/g, '').includes(cleanPhone))
      ) || null
    );
  }

  async findByItsNumber(its: string): Promise<User | null> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`SELECT * FROM alsouq_users WHERE its_number = ${its.trim()} LIMIT 1`;
        if (rows.length > 0) {
          const { passwordHash, ...safeUser } = mapRowToUser(rows[0]);
          return safeUser;
        }
      } catch (err) {
        console.warn('Postgres findByItsNumber error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    const user = dbStore.users.find((u) => u.itsNumber === its.trim());
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async create(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    cityId: string;
    cityName: string;
    mohallaName: string;
    itsNumber?: string;
    itsCardProofUrl?: string;
    livePhotoUrl?: string;
  }): Promise<User> {
    const newUser: UserWithAuth = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.trim(),
      fullName: data.fullName.trim(),
      avatarUrl: data.livePhotoUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80`,
      itsNumber: data.itsNumber ? data.itsNumber.trim() : undefined,
      itsCardProofUrl: data.itsCardProofUrl,
      livePhotoUrl: data.livePhotoUrl,
      verificationStatus: 'PENDING',
      cityId: data.cityId,
      cityName: data.cityName,
      mohallaName: data.mohallaName,
      role: 'MEMBER',
      createdAt: new Date().toISOString(),
      passwordHash: hashPassword(data.password),
    };

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_users (
            id, email, phone, full_name, avatar_url, its_number,
            its_card_proof_url, live_photo_url, verification_status,
            city_id, city_name, mohalla_name, role, created_at, password_hash
          ) VALUES (
            ${newUser.id}, ${newUser.email}, ${newUser.phone}, ${newUser.fullName},
            ${newUser.avatarUrl}, ${newUser.itsNumber || null}, ${newUser.itsCardProofUrl || null},
            ${newUser.livePhotoUrl || null}, 'PENDING', ${newUser.cityId},
            ${newUser.cityName}, ${newUser.mohallaName}, 'MEMBER',
            ${newUser.createdAt}, ${newUser.passwordHash}
          )
        `;
      } catch (err) {
        console.warn('Postgres create user error, falling back to disk:', err);
      }
    }

    dbStore.users.unshift(newUser);
    dbStore.persistToDisk();

    const { passwordHash, ...safeUser } = newUser;
    return safeUser;
  }

  async updateVerification(
    userId: string,
    status: 'VERIFIED' | 'PENDING' | 'REJECTED',
    itsNumber?: string
  ): Promise<User | null> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          UPDATE alsouq_users
          SET verification_status = ${status},
              its_number = COALESCE(${itsNumber || null}, its_number)
          WHERE id = ${userId}
        `;
      } catch (err) {
        console.warn('Postgres updateVerification error, falling back to disk:', err);
      }
    }

    const user = dbStore.users.find((u) => u.id === userId);
    if (!user) return null;
    user.verificationStatus = status;
    if (itsNumber) user.itsNumber = itsNumber;
    dbStore.persistToDisk();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    const newHash = hashPassword(newPassword);
    let updated = false;

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          UPDATE alsouq_users
          SET password_hash = ${newHash}
          WHERE id = ${userId}
        `;
        updated = true;
      } catch (err) {
        console.warn('Postgres updatePassword error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    const user = dbStore.users.find((u) => u.id === userId);
    if (user) {
      user.passwordHash = newHash;
      dbStore.persistToDisk();
      updated = true;
    }

    return updated;
  }
}

export const usersRepository = new UsersRepository();
