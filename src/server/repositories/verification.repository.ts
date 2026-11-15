import { dbStore } from '@/server/db/store';
import { ITSVerificationRequest } from '@/types';

export class VerificationRepository {
  async getAll(): Promise<ITSVerificationRequest[]> {
    dbStore.reloadFromDisk();
    return dbStore.verifications;
  }

  async getPending(): Promise<ITSVerificationRequest[]> {
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
