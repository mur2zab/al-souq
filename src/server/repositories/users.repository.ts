import { dbStore, UserWithAuth } from '@/server/db/store';
import { User } from '@/types';
import { hashPassword } from '@/server/auth/auth';

export class UsersRepository {
  async findById(id: string): Promise<User | null> {
    const user = dbStore.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async findByEmailOrPhone(identifier: string): Promise<UserWithAuth | null> {
    const clean = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/[^0-9]/g, '');

    return (
      dbStore.users.find(
        (u) =>
          u.email.toLowerCase() === clean ||
          (cleanPhone.length >= 8 && u.phone.replace(/[^0-9]/g, '').includes(cleanPhone))
      ) || null
    );
  }

  async findByItsNumber(its: string): Promise<User | null> {
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
    const user = dbStore.users.find((u) => u.id === userId);
    if (!user) return null;
    user.verificationStatus = status;
    if (itsNumber) user.itsNumber = itsNumber;
    dbStore.persistToDisk();
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const usersRepository = new UsersRepository();
