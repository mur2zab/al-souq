import { dbStore } from '@/server/db/store';
import { LeadEvent } from '@/types';

export class LeadsRepository {
  async recordLead(data: Omit<LeadEvent, 'id' | 'timestamp'>): Promise<LeadEvent> {
    const newLead: LeadEvent = {
      ...data,
      id: `lead-${Date.now()}`,
      timestamp: 'Just now',
    };
    dbStore.leads.unshift(newLead);
    dbStore.persistToDisk();
    return newLead;
  }

  async getLeadsBySeller(sellerId?: string): Promise<LeadEvent[]> {
    if (sellerId) {
      return dbStore.leads.filter((l) => l.sellerId === sellerId);
    }
    return dbStore.leads;
  }
}

export const leadsRepository = new LeadsRepository();
