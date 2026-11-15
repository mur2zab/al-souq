import { dbStore } from '@/server/db/store';
import { getDb, initPostgresTables } from '@/server/db/postgres';
import { ClassifiedCategory, ClassifiedListing } from '@/types';

function mapRowToClassified(row: any): ClassifiedListing {
  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: row.seller_name,
    sellerAvatar: row.seller_avatar,
    sellerItsVerified: Boolean(row.seller_its_verified),
    sellerVerifiedYear: Number(row.seller_verified_year) || 2025,
    sellerPhone: row.seller_phone,
    cityId: row.city_id,
    cityName: row.city_name,
    mohallaName: row.mohalla_name,
    category: row.category,
    title: row.title,
    description: row.description,
    price: Number(row.price) || 0,
    isNegotiable: Boolean(row.is_negotiable),
    condition: row.condition,
    realEstateMeta:
      typeof row.real_estate_meta === 'string'
        ? JSON.parse(row.real_estate_meta)
        : row.real_estate_meta || undefined,
    jobMeta:
      typeof row.job_meta === 'string'
        ? JSON.parse(row.job_meta)
        : row.job_meta || undefined,
    mediaUrls: Array.isArray(row.media_urls)
      ? row.media_urls
      : typeof row.media_urls === 'string'
      ? JSON.parse(row.media_urls)
      : [],
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    whatsappClicksCount: Number(row.whatsapp_clicks_count) || 0,
  };
}

export class ClassifiedsRepository {
  async getClassifieds(filter: {
    cityId?: string;
    mohallaName?: string;
    category?: ClassifiedCategory | 'ALL';
  }): Promise<ClassifiedListing[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`
          SELECT * FROM alsouq_classifieds
          ORDER BY created_at DESC
        `;
        let listings = rows.map(mapRowToClassified);

        if (filter.cityId && filter.cityId !== 'all') {
          listings = listings.filter((c) => c.cityId === filter.cityId);
        }

        if (filter.mohallaName && filter.mohallaName !== 'All Localities') {
          const cleanLocality = filter.mohallaName.split('(')[0].trim().toLowerCase();
          listings = listings.filter((c) => c.mohallaName.toLowerCase().includes(cleanLocality));
        }

        if (filter.category && filter.category !== 'ALL') {
          listings = listings.filter((c) => c.category === filter.category);
        }

        return listings;
      } catch (err) {
        console.warn('Postgres getClassifieds error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
    let listings = [...dbStore.classifieds];

    if (filter.cityId && filter.cityId !== 'all') {
      listings = listings.filter((c) => c.cityId === filter.cityId);
    }

    if (filter.mohallaName && filter.mohallaName !== 'All Localities') {
      const cleanLocality = filter.mohallaName.split('(')[0].trim().toLowerCase();
      listings = listings.filter((c) => c.mohallaName.toLowerCase().includes(cleanLocality));
    }

    if (filter.category && filter.category !== 'ALL') {
      listings = listings.filter((c) => c.category === filter.category);
    }

    return listings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createClassified(
    data: Omit<ClassifiedListing, 'id' | 'createdAt' | 'whatsappClicksCount'>
  ): Promise<ClassifiedListing> {
    const listing: ClassifiedListing = {
      ...data,
      id: `listing-${Date.now()}`,
      createdAt: new Date().toISOString(),
      whatsappClicksCount: 0,
    };

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_classifieds (
            id, seller_id, seller_name, seller_avatar, seller_its_verified, seller_verified_year,
            seller_phone, city_id, city_name, mohalla_name, category, title, description,
            price, is_negotiable, condition, real_estate_meta, job_meta, media_urls, status,
            created_at, whatsapp_clicks_count
          ) VALUES (
            ${listing.id}, ${listing.sellerId}, ${listing.sellerName}, ${listing.sellerAvatar},
            ${listing.sellerItsVerified}, ${listing.sellerVerifiedYear}, ${listing.sellerPhone},
            ${listing.cityId}, ${listing.cityName}, ${listing.mohallaName}, ${listing.category},
            ${listing.title}, ${listing.description}, ${listing.price}, ${listing.isNegotiable},
            ${listing.condition},
            ${listing.realEstateMeta ? JSON.stringify(listing.realEstateMeta) : null},
            ${listing.jobMeta ? JSON.stringify(listing.jobMeta) : null},
            ${JSON.stringify(listing.mediaUrls)},
            ${listing.status}, ${listing.createdAt}, 0
          )
        `;
      } catch (err) {
        console.warn('Postgres createClassified error, falling back to disk:', err);
      }
    }

    dbStore.classifieds.unshift(listing);
    dbStore.persistToDisk();
    return listing;
  }

  async incrementWhatsAppClicks(listingId: string): Promise<void> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          UPDATE alsouq_classifieds
          SET whatsapp_clicks_count = whatsapp_clicks_count + 1
          WHERE id = ${listingId}
        `;
      } catch (err) {
        console.warn('Postgres incrementWhatsAppClicks error:', err);
      }
    }

    const item = dbStore.classifieds.find((c) => c.id === listingId);
    if (item) {
      item.whatsappClicksCount += 1;
      dbStore.persistToDisk();
    }
  }
}

export const classifiedsRepository = new ClassifiedsRepository();