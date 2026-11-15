import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}

export async function initPostgresTables() {
  const sql = getDb();
  if (!sql) return false;

  try {
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

    return true;
  } catch (err) {
    console.error('Postgres init error:', err);
    return false;
  }
}
