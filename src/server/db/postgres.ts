import { neon } from '@neondatabase/serverless';
import {
  SEED_BUSINESSES,
  SEED_CLASSIFIEDS,
  SEED_POSTS,
  SEED_STORIES,
  SEED_USERS,
} from '@/data/seedData';
import { hashPassword } from '@/server/auth/auth';

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

let initPromise: Promise<boolean> | null = null;

export async function initPostgresTables() {
  const sql = getDb();
  if (!sql) return false;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 1. Users Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          phone TEXT,
          full_name TEXT NOT NULL,
          avatar_url TEXT,
          its_number TEXT,
          its_card_proof_url TEXT,
          live_photo_url TEXT,
          verification_status TEXT DEFAULT 'PENDING',
          city_id TEXT,
          city_name TEXT,
          mohalla_name TEXT,
          role TEXT DEFAULT 'MEMBER',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          password_hash TEXT
        );
      `;

      // 2. Verifications Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_verifications (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          full_name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          its_number TEXT,
          jamaat_city TEXT,
          mohalla TEXT,
          id_card_image_url TEXT,
          live_photo_url TEXT,
          submitted_at TIMESTAMPTZ DEFAULT NOW(),
          ocr_extracted_its TEXT,
          ocr_extracted_name TEXT,
          ocr_confidence INT DEFAULT 99,
          ocr_matches BOOLEAN DEFAULT TRUE,
          status TEXT DEFAULT 'PENDING',
          admin_notes TEXT
        );
      `;

      // 3. Tijarat Businesses Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_businesses (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          business_name TEXT NOT NULL,
          slug TEXT,
          tagline TEXT,
          description TEXT,
          category TEXT,
          city_id TEXT,
          city_name TEXT,
          mohalla_name TEXT,
          ships_globally BOOLEAN DEFAULT TRUE,
          has_raza_badge BOOLEAN DEFAULT TRUE,
          subscription_tier TEXT DEFAULT 'FREE',
          whatsapp_number TEXT,
          instagram_handle TEXT,
          catalog_pdf_url TEXT,
          rating NUMERIC DEFAULT 4.9,
          verified_since TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 4. Classified Listings Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_classifieds (
          id TEXT PRIMARY KEY,
          seller_id TEXT,
          seller_name TEXT,
          seller_avatar TEXT,
          seller_its_verified BOOLEAN DEFAULT TRUE,
          seller_verified_year INT DEFAULT 2025,
          seller_phone TEXT,
          city_id TEXT,
          city_name TEXT,
          mohalla_name TEXT,
          category TEXT,
          title TEXT NOT NULL,
          description TEXT,
          price NUMERIC,
          is_negotiable BOOLEAN DEFAULT FALSE,
          condition TEXT DEFAULT 'LIKE_NEW',
          real_estate_meta JSONB,
          job_meta JSONB,
          media_urls JSONB,
          status TEXT DEFAULT 'ACTIVE',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          whatsapp_clicks_count INT DEFAULT 0
        );
      `;

      // 5. Feed Posts & Souq Drops Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_posts (
          id TEXT PRIMARY KEY,
          business_id TEXT,
          business_name TEXT,
          business_avatar TEXT,
          has_raza_badge BOOLEAN DEFAULT TRUE,
          author_id TEXT,
          post_type TEXT DEFAULT 'PHOTO_CAROUSEL',
          media_urls JSONB,
          caption TEXT,
          price_inr NUMERIC,
          is_available_today BOOLEAN DEFAULT TRUE,
          today_drop_deadline TEXT,
          city_id TEXT,
          city_name TEXT,
          mohalla_name TEXT,
          likes_count INT DEFAULT 0,
          whatsapp_clicks_count INT DEFAULT 0,
          whatsapp_number TEXT,
          expires_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          category TEXT,
          tags JSONB
        );
      `;

      // 6. 24h Stories / Flash Drops Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_stories (
          id TEXT PRIMARY KEY,
          business_id TEXT,
          business_name TEXT,
          business_avatar TEXT,
          media_url TEXT,
          caption TEXT,
          price_inr NUMERIC,
          order_deadline TEXT,
          city_id TEXT,
          city_name TEXT,
          mohalla_name TEXT,
          is_available_today BOOLEAN DEFAULT TRUE,
          whatsapp_number TEXT,
          expires_in_hours INT DEFAULT 24,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 7. Leads & WhatsApp Inquiries Table
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_leads (
          id TEXT PRIMARY KEY,
          item_id TEXT,
          item_type TEXT,
          item_title TEXT,
          seller_id TEXT,
          buyer_name TEXT,
          buyer_its TEXT,
          buyer_mohalla TEXT,
          timestamp TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;

      // 8. Temporary OTP Tokens Table (Fallback when Redis is not configured)
      await sql`
        CREATE TABLE IF NOT EXISTS alsouq_otp_tokens (
          key TEXT PRIMARY KEY,
          otp_value TEXT NOT NULL,
          attempts INT DEFAULT 0,
          expires_at TIMESTAMPTZ NOT NULL
        );
      `;

      // Clean up all dummy seed records from marketplace tables
      await sql`
        DELETE FROM alsouq_classifieds
        WHERE id IN ('listing-1', 'listing-2', 'listing-3', 'listing-4', 'listing-5', 'listing-6', 'listing-7')
           OR id LIKE 'seed-%';
      `;

      await sql`
        DELETE FROM alsouq_posts
        WHERE id IN ('post-1', 'post-2', 'post-3', 'post-4', 'post-5')
           OR id LIKE 'seed-%';
      `;

      await sql`
        DELETE FROM alsouq_stories
        WHERE id IN ('story-1', 'story-2', 'story-3', 'story-4')
           OR id LIKE 'seed-%';
      `;

      await sql`
        DELETE FROM alsouq_businesses
        WHERE id IN ('biz-1', 'biz-2', 'biz-3', 'biz-4', 'biz-5', 'biz-6')
           OR id LIKE 'seed-%';
      `;

      await sql`
        DELETE FROM alsouq_leads
        WHERE id IN ('lead-1', 'lead-2', 'lead-3')
           OR id LIKE 'seed-%';
      `;

      // Clean up seed users (user-1 through user-5), strictly preserving real community users
      await sql`
        DELETE FROM alsouq_users
        WHERE id IN ('user-1', 'user-2', 'user-3', 'user-4', 'user-5');
      `;

      await sql`
        DELETE FROM alsouq_verifications
        WHERE id IN ('verif-req-1', 'verif-req-2', 'verif-req-3');
      `;

      // Seed Default Admin User if users table is empty
      const usersCount = await sql`SELECT count(*) FROM alsouq_users`;
      if (Number(usersCount[0].count) === 0) {
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@AlSouq2026';
        const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@alsouq.community';
        await sql`
          INSERT INTO alsouq_users (
            id, email, phone, full_name, avatar_url, its_number,
            verification_status, city_id, city_name, mohalla_name,
            role, created_at, password_hash
          ) VALUES (
            'admin-1', ${defaultAdminEmail}, '+919820000001', 'Community Admin',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            '10000001', 'VERIFIED', 'mumbai', 'Mumbai', 'Mazgaon (Al-Souq Admin Desk)',
            'ADMIN', NOW(), ${hashPassword(defaultAdminPassword)}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }

      return true;
    } catch (err) {
      console.error('Postgres init tables error:', err);
      return false;
    }
  })();

  return initPromise;
}

export async function cleanAllDummyData() {
  const sql = getDb();
  if (!sql) return { success: false, message: 'No database configured' };

  try {
    await initPostgresTables();
    await sql`
      DELETE FROM alsouq_classifieds
      WHERE id IN ('listing-1', 'listing-2', 'listing-3', 'listing-4', 'listing-5', 'listing-6', 'listing-7')
         OR id LIKE 'seed-%';
    `;
    await sql`
      DELETE FROM alsouq_posts
      WHERE id IN ('post-1', 'post-2', 'post-3', 'post-4', 'post-5')
         OR id LIKE 'seed-%';
    `;
    await sql`
      DELETE FROM alsouq_stories
      WHERE id IN ('story-1', 'story-2', 'story-3', 'story-4')
         OR id LIKE 'seed-%';
    `;
    await sql`
      DELETE FROM alsouq_businesses
      WHERE id IN ('biz-1', 'biz-2', 'biz-3', 'biz-4', 'biz-5', 'biz-6')
         OR id LIKE 'seed-%';
    `;
    await sql`
      DELETE FROM alsouq_leads
      WHERE id IN ('lead-1', 'lead-2', 'lead-3')
         OR id LIKE 'seed-%';
    `;
    await sql`
      DELETE FROM alsouq_users
      WHERE id IN ('user-1', 'user-2', 'user-3', 'user-4', 'user-5');
    `;
    await sql`
      DELETE FROM alsouq_verifications
      WHERE id IN ('verif-req-1', 'verif-req-2', 'verif-req-3');
    `;

    const users = await sql`SELECT id, email, full_name, role FROM alsouq_users`;
    const classifieds = await sql`SELECT count(*) FROM alsouq_classifieds`;
    const posts = await sql`SELECT count(*) FROM alsouq_posts`;
    const stories = await sql`SELECT count(*) FROM alsouq_stories`;
    const leads = await sql`SELECT count(*) FROM alsouq_leads`;
    const verifications = await sql`SELECT count(*) FROM alsouq_verifications`;

    return {
      success: true,
      remainingUsers: users,
      counts: {
        users: users.length,
        classifieds: Number(classifieds[0].count),
        posts: Number(posts[0].count),
        stories: Number(stories[0].count),
        leads: Number(leads[0].count),
        verifications: Number(verifications[0].count),
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}