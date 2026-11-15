import { dbStore } from '@/server/db/store';
import { getDb, initPostgresTables } from '@/server/db/postgres';
import { LeadEvent } from '@/types';

function mapRowToLead(row: any): LeadEvent {
  return {
    id: row.id,
    itemId: row.item_id,
    itemType: row.item_type,
    itemTitle: row.item_title,
    sellerId: row.seller_id,
    buyerName: row.buyer_name || undefined,
    buyerIts: row.buyer_its || undefined,
    buyerMohalla: row.buyer_mohalla || undefined,
    timestamp: row.timestamp || 'Just now',
  };
}

export class LeadsRepository {
  async recordLead(data: Omit<LeadEvent, 'id' | 'timestamp'>): Promise<LeadEvent> {
    const newLead: LeadEvent = {
      ...data,
      id: `lead-${Date.now()}`,
      timestamp: 'Just now',
    };

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_leads (
            id, item_id, item_type, item_title, seller_id, buyer_name,
            buyer_its, buyer_mohalla, timestamp, created_at
          ) VALUES (
            ${newLead.id}, ${newLead.itemId}, ${newLead.itemType}, ${newLead.itemTitle},
            ${newLead.sellerId}, ${newLead.buyerName || null}, ${newLead.buyerIts || null},
            ${newLead.buyerMohalla || null}, ${newLead.timestamp}, NOW()
          )
        `;
      } catch (err) {
        console.warn('Postgres recordLead error, falling back to disk:', err);
      }
    }

    dbStore.leads.unshift(newLead);
    dbStore.persistToDisk();
    return newLead;
  }

  async getLeadsBySeller(sellerId?: string): Promise<LeadEvent[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = sellerId
          ? await sql`SELECT * FROM alsouq_leads WHERE seller_id = ${sellerId} ORDER BY created_at DESC`
          : await sql`SELECT * FROM alsouq_leads ORDER BY created_at DESC`;
        return rows.map(mapRowToLead);
      } catch (err) {
        console.warn('Postgres getLeadsBySeller error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    if (sellerId) {
      return dbStore.leads.filter((l) => l.sellerId === sellerId);
    }
    return dbStore.leads;
  }
}

export const leadsRepository = new LeadsRepository();