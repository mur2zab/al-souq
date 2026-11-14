import { dbStore } from '@/server/db/store';
import { FeedPost, StoryItem } from '@/types';

export class FeedRepository {
  async getFeedPosts(filter: {
    cityId?: string;
    mohallaName?: string;
    category?: string;
  }): Promise<FeedPost[]> {
    let posts = [...dbStore.posts];

    if (filter.cityId && filter.cityId !== 'all') {
      posts = posts.filter((p) => p.cityId === filter.cityId);
    }

    if (filter.mohallaName && filter.mohallaName !== 'All Localities') {
      const cleanLocality = filter.mohallaName.split('(')[0].trim().toLowerCase();
      posts = posts.filter((p) => p.mohallaName.toLowerCase().includes(cleanLocality));
    }

    if (filter.category && filter.category !== 'ALL') {
      posts = posts.filter((p) => p.category === filter.category);
    }

    // Sort by created_at DESC (matching Prisma index)
    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getStories(cityId?: string): Promise<StoryItem[]> {
    if (cityId && cityId !== 'all') {
      return dbStore.stories.filter((s) => s.cityId === cityId);
    }
    return dbStore.stories;
  }

  async createPost(
    postData: Omit<FeedPost, 'id' | 'createdAt' | 'likesCount' | 'whatsappClicksCount'>
  ): Promise<FeedPost> {
    const newPost: FeedPost = {
      ...postData,
      id: `post-${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      whatsappClicksCount: 0,
    };
    dbStore.posts.unshift(newPost);
    dbStore.persistToDisk();
    return newPost;
  }

  async incrementWhatsAppClicks(postId: string): Promise<void> {
    const post = dbStore.posts.find((p) => p.id === postId);
    if (post) {
      post.whatsappClicksCount += 1;
      dbStore.persistToDisk();
    }
  }
}

export const feedRepository = new FeedRepository();
