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

      // Seed Initial Businesses if empty
      const bizCount = await sql`SELECT count(*) FROM alsouq_businesses`;
      if (Number(bizCount[0].count) === 0 && SEED_BUSINESSES.length > 0) {
        for (const b of SEED_BUSINESSES) {
          await sql`
            INSERT INTO alsouq_businesses (
              id, user_id, business_name, slug, tagline, description, category,
              city_id, city_name, mohalla_name, ships_globally, has_raza_badge,
              subscription_tier, whatsapp_number, instagram_handle, rating, verified_since
            ) VALUES (
              ${b.id}, ${b.userId}, ${b.businessName}, ${b.slug}, ${b.tagline}, ${b.description}, ${b.category},
              ${b.cityId}, ${b.cityName}, ${b.mohallaName}, ${b.shipsGlobally}, ${b.hasRazaBadge},
              ${b.subscriptionTier}, ${b.whatsappNumber}, ${b.instagramHandle || null}, ${b.rating || 4.9}, ${b.verifiedSince || '2022'}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }

      // Seed Initial Classifieds if empty
      const classCount = await sql`SELECT count(*) FROM alsouq_classifieds`;
      if (Number(classCount[0].count) === 0 && SEED_CLASSIFIEDS.length > 0) {
        for (const c of SEED_CLASSIFIEDS) {
          await sql`
            INSERT INTO alsouq_classifieds (
              id, seller_id, seller_name, seller_avatar, seller_its_verified, seller_verified_year,
              seller_phone, city_id, city_name, mohalla_name, category, title, description,
              price, is_negotiable, condition, real_estate_meta, job_meta, media_urls, status,
              created_at, whatsapp_clicks_count
            ) VALUES (
              ${c.id}, ${c.sellerId}, ${c.sellerName}, ${c.sellerAvatar}, ${c.sellerItsVerified}, ${c.sellerVerifiedYear},
              ${c.sellerPhone}, ${c.cityId}, ${c.cityName}, ${c.mohallaName}, ${c.category}, ${c.title}, ${c.description},
              ${c.price}, ${c.isNegotiable}, ${c.condition},
              ${c.realEstateMeta ? JSON.stringify(c.realEstateMeta) : null},
              ${c.jobMeta ? JSON.stringify(c.jobMeta) : null},
              ${JSON.stringify(c.mediaUrls)},
              ${c.status}, ${c.createdAt}, ${c.whatsappClicksCount || 0}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }

      // Seed Initial Feed Posts if empty
      const postCount = await sql`SELECT count(*) FROM alsouq_posts`;
      if (Number(postCount[0].count) === 0 && SEED_POSTS.length > 0) {
        for (const p of SEED_POSTS) {
          await sql`
            INSERT INTO alsouq_posts (
              id, business_id, business_name, business_avatar, has_raza_badge, author_id,
              post_type, media_urls, caption, price_inr, is_available_today, today_drop_deadline,
              city_id, city_name, mohalla_name, likes_count, whatsapp_clicks_count, whatsapp_number,
              expires_at, created_at, category, tags
            ) VALUES (
              ${p.id}, ${p.businessId}, ${p.businessName}, ${p.businessAvatar}, ${p.hasRazaBadge}, ${p.authorId},
              ${p.postType}, ${JSON.stringify(p.mediaUrls)}, ${p.caption}, ${p.priceInr || null}, ${p.isAvailableToday}, ${p.todayDropDeadline || null},
              ${p.cityId}, ${p.cityName}, ${p.mohallaName}, ${p.likesCount || 0}, ${p.whatsappClicksCount || 0}, ${p.whatsappNumber},
              ${p.expiresAt || null}, ${p.createdAt}, ${p.category}, ${JSON.stringify(p.tags)}
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }

      // Seed Initial Stories if empty
      const storyCount = await sql`SELECT count(*) FROM alsouq_stories`;
      if (Number(storyCount[0].count) === 0 && SEED_STORIES.length > 0) {
        for (const s of SEED_STORIES) {
          await sql`
            INSERT INTO alsouq_stories (
              id, business_id, business_name, business_avatar, media_url, caption,
              price_inr, order_deadline, city_id, city_name, mohalla_name, is_available_today,
              whatsapp_number, expires_in_hours, created_at
            ) VALUES (
              ${s.id}, ${s.businessId}, ${s.businessName}, ${s.businessAvatar}, ${s.mediaUrl}, ${s.caption},
              ${s.priceInr || null}, ${s.orderDeadline}, ${s.cityId}, ${s.cityName}, ${s.mohallaName}, ${s.isAvailableToday},
              ${s.whatsappNumber}, ${s.expiresInHours}, NOW()
            ) ON CONFLICT (id) DO NOTHING;
          `;
        }
      }

      // Seed Default Admin User if users table is empty
      const usersCount = await sql`SELECT count(*) FROM alsouq_users`;
      if (Number(usersCount[0].count) === 0) {
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
        const defaultAdminEmail = process.env.ADMIN_EMAIL || 'admin@alsouq.community';
        await sql`
          INSERT INTO alsouq_users (
            id, email, phone, full_name, avatar_url, its_number,
            verification_status, city_id, city_name, mohalla_name,
            role, created_at, password_hash
          ) VALUES (
            'admin-1', ${defaultAdminEmail}, '+919820000001', 'Community Admin',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            '10000001', 'VERIFIED', 'mumbai', 'Mumbai', 'Mazgaon (Central Jamaat Desk)',
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