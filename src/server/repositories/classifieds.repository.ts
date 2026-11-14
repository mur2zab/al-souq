import { dbStore } from '@/server/db/store';
import { ClassifiedCategory, ClassifiedListing } from '@/types';

export class ClassifiedsRepository {
  async getClassifieds(filter: {
    cityId?: string;
    mohallaName?: string;
    category?: ClassifiedCategory | 'ALL';
  }): Promise<ClassifiedListing[]> {
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

    // Sort by created_at DESC (matching Prisma index)
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
    dbStore.classifieds.unshift(listing);
    dbStore.persistToDisk();
    return listing;
  }

  async incrementWhatsAppClicks(listingId: string): Promise<void> {
    const item = dbStore.classifieds.find((c) => c.id === listingId);
    if (item) {
      item.whatsappClicksCount += 1;
      dbStore.persistToDisk();
    }
  }
}

export const classifiedsRepository = new ClassifiedsRepository();
