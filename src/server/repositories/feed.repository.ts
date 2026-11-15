import { dbStore } from '@/server/db/store';
import { getDb, initPostgresTables } from '@/server/db/postgres';
import { FeedPost, StoryItem } from '@/types';

function mapRowToPost(row: any): FeedPost {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: row.business_name,
    businessAvatar: row.business_avatar,
    hasRazaBadge: Boolean(row.has_raza_badge),
    authorId: row.author_id,
    postType: row.post_type,
    mediaUrls: Array.isArray(row.media_urls)
      ? row.media_urls
      : typeof row.media_urls === 'string'
      ? JSON.parse(row.media_urls)
      : [],
    caption: row.caption,
    priceInr: row.price_inr ? Number(row.price_inr) : undefined,
    isAvailableToday: Boolean(row.is_available_today),
    todayDropDeadline: row.today_drop_deadline || undefined,
    cityId: row.city_id,
    cityName: row.city_name,
    mohallaName: row.mohalla_name,
    likesCount: Number(row.likes_count) || 0,
    whatsappClicksCount: Number(row.whatsapp_clicks_count) || 0,
    whatsappNumber: row.whatsapp_number,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : row.expires_at || undefined,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    category: row.category,
    tags: Array.isArray(row.tags)
      ? row.tags
      : typeof row.tags === 'string'
      ? JSON.parse(row.tags)
      : [],
  };
}

function mapRowToStory(row: any): StoryItem {
  return {
    id: row.id,
    businessId: row.business_id,
    businessName: row.business_name,
    businessAvatar: row.business_avatar,
    mediaUrl: row.media_url,
    caption: row.caption,
    priceInr: row.price_inr ? Number(row.price_inr) : undefined,
    orderDeadline: row.order_deadline,
    cityId: row.city_id,
    cityName: row.city_name,
    mohallaName: row.mohalla_name,
    isAvailableToday: Boolean(row.is_available_today),
    whatsappNumber: row.whatsapp_number,
    expiresInHours: Number(row.expires_in_hours) || 24,
  };
}

export class FeedRepository {
  async getFeedPosts(filter: {
    cityId?: string;
    mohallaName?: string;
    category?: string;
  }): Promise<FeedPost[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`
          SELECT * FROM alsouq_posts
          ORDER BY created_at DESC
        `;
        let posts = rows.map(mapRowToPost);

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

        return posts;
      } catch (err) {
        console.warn('Postgres getFeedPosts error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
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

    return posts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getStories(cityId?: string): Promise<StoryItem[]> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        const rows = await sql`
          SELECT * FROM alsouq_stories
          ORDER BY created_at DESC
        `;
        let stories = rows.map(mapRowToStory);

        if (cityId && cityId !== 'all') {
          stories = stories.filter((s) => s.cityId === cityId);
        }

        return stories;
      } catch (err) {
        console.warn('Postgres getStories error, falling back to disk:', err);
      }
    }

    dbStore.reloadFromDisk();
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

    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          INSERT INTO alsouq_posts (
            id, business_id, business_name, business_avatar, has_raza_badge, author_id,
            post_type, media_urls, caption, price_inr, is_available_today, today_drop_deadline,
            city_id, city_name, mohalla_name, likes_count, whatsapp_clicks_count, whatsapp_number,
            expires_at, created_at, category, tags
          ) VALUES (
            ${newPost.id}, ${newPost.businessId}, ${newPost.businessName}, ${newPost.businessAvatar},
            ${newPost.hasRazaBadge}, ${newPost.authorId}, ${newPost.postType},
            ${JSON.stringify(newPost.mediaUrls)}, ${newPost.caption}, ${newPost.priceInr || null},
            ${newPost.isAvailableToday}, ${newPost.todayDropDeadline || null},
            ${newPost.cityId}, ${newPost.cityName}, ${newPost.mohallaName}, 0, 0,
            ${newPost.whatsappNumber}, ${newPost.expiresAt || null}, ${newPost.createdAt},
            ${newPost.category}, ${JSON.stringify(newPost.tags)}
          )
        `;
      } catch (err) {
        console.warn('Postgres createPost error, falling back to disk:', err);
      }
    }

    dbStore.posts.unshift(newPost);
    dbStore.persistToDisk();
    return newPost;
  }

  async incrementWhatsAppClicks(postId: string): Promise<void> {
    const sql = getDb();
    if (sql) {
      try {
        await initPostgresTables();
        await sql`
          UPDATE alsouq_posts
          SET whatsapp_clicks_count = whatsapp_clicks_count + 1
          WHERE id = ${postId}
        `;
      } catch (err) {
        console.warn('Postgres incrementWhatsAppClicks for post error:', err);
      }
    }

    const post = dbStore.posts.find((p) => p.id === postId);
    if (post) {
      post.whatsappClicksCount += 1;
      dbStore.persistToDisk();
    }
  }
}

export const feedRepository = new FeedRepository();