import { dbStore } from '@/server/db/store';
import { getDb, initPostgresTables } from '@/server/db/postgres';
import { ITSVerificationRequest } from '@/types';

function mapRowToVerification(row: any): ITSVerificationRequest {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    itsNumber: row.its_number,
    jamaatCity: row.jamaat_city,
    mohalla: row.mohalla,
    idCardImageUrl: row.id_card_image_url,
    livePhotoUrl: row.live_photo_url,
    submittedAt: row.submitted_at instanceof Date ? row.submitted_at.toISOString() : row.submitted_at,
    ocrExtractedIts: row.ocr_extracted_its || row.its_number,
    ocrExtractedName: row.ocr_extracted_name || row.full_name,
    ocrConfidence: row.ocr_confidence ?? 99,
    ocrMatches: row.ocr_matches ?? true,
    status: row.status,
    adminNotes: row.admin_notes,
  };
}

export class VerificationRepository {
  async getAll(): Promise<ITSVerificationRequest[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`SELECT * FROM alsouq_verifications ORDER BY submitted_at DESC`;
        return rows.map(mapRowToVerification);
      } catch (err) {
        console.warn('Postgres getAll verifications error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    return dbStore.verifications;
  }

  async getPending(): Promise<ITSVerificationRequest[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`SELECT * FROM alsouq_verifications WHERE status = 'PENDING' ORDER BY submitted_at DESC`;
        return rows.map(mapRowToVerification);
      } catch (err) {
        console.warn('Postgres getPending verifications error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    return dbStore.verifications.filter((r) => r.status === 'PENDING');
  }

  async create(
    data: Omit<ITSVerificationRequest, 'id' | 'submittedAt' | 'status'>
  ): Promise<ITSVerificationRequest> {
    const newReq: ITSVerificationRequest = {
      ...data,
      id: `verif-req-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'PENDING', // STRICTLY PENDING - requires admin manual review
    };

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_verifications (
            id, user_id, full_name, email, phone, its_number,
            jamaat_city, mohalla, id_card_image_url, live_photo_url,
            submitted_at, ocr_extracted_its, ocr_extracted_name,
            ocr_confidence, ocr_matches, status, admin_notes
          ) VALUES (
            ${newReq.id}, ${newReq.userId}, ${newReq.fullName}, ${newReq.email},
            ${newReq.phone}, ${newReq.itsNumber}, ${newReq.jamaatCity}, ${newReq.mohalla},
            ${newReq.idCardImageUrl}, ${newReq.livePhotoUrl || null}, ${newReq.submittedAt},
            ${newReq.ocrExtractedIts || newReq.itsNumber}, ${newReq.ocrExtractedName || newReq.fullName},
            ${newReq.ocrConfidence || 99}, ${newReq.ocrMatches ?? true},
            'PENDING', ${newReq.adminNotes || null}
          )
        `;

        // Update user status in Postgres
        await sql`
          UPDATE alsouq_users
          SET verification_status = 'PENDING', its_number = ${newReq.itsNumber}
          WHERE id = ${data.userId} OR email = ${data.email}
        `;
      } catch (err) {
        console.warn('Postgres create verification error, falling back to disk:', err);
      }
    }

    dbStore.verifications.unshift(newReq);

    // Update user's status to PENDING in the database
    const user = dbStore.users.find((u) => u.id === data.userId || u.email === data.email);
    if (user) {
      user.verificationStatus = 'PENDING';
      user.itsNumber = data.itsNumber;
    }

    dbStore.persistToDisk();
    return newReq;
  }

  async updateStatus(
    id: string,
    status: 'VERIFIED' | 'REJECTED',
    notes?: string
  ): Promise<ITSVerificationRequest | null> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          UPDATE alsouq_verifications
          SET status = ${status}, admin_notes = ${notes || null}
          WHERE id = ${id}
        `;

        const rows = await sql`SELECT * FROM alsouq_verifications WHERE id = ${id} LIMIT 1`;
        if (rows.length > 0) {
          const req = mapRowToVerification(rows[0]);
          await sql`
            UPDATE alsouq_users
            SET verification_status = ${status}
            WHERE id = ${req.userId} OR email = ${req.email}
          `;
          return req;
        }
      } catch (err) {
        console.warn('Postgres updateStatus verification error, falling back to disk:', err);
      }
    }

    const req = dbStore.verifications.find((r) => r.id === id);
    if (!req) return null;
    req.status = status;
    if (notes) req.adminNotes = notes;

    // Synchronize user status in database
    const user = dbStore.users.find((u) => u.id === req.userId || u.email === req.email);
    if (user) {
      user.verificationStatus = status;
      if (status === 'VERIFIED') {
        user.itsNumber = req.itsNumber;
      }
    }

    dbStore.persistToDisk();
    return req;
  }
}

export const verificationRepository = new VerificationRepository();
