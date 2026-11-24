import { NextRequest, NextResponse } from 'next/server';
import { cleanAllDummyData, getDb, initPostgresTables } from '@/server/db/postgres';
import { dbStore } from '@/server/db/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldClean = searchParams.get('clean') === 'true';
  const adminSecret =
    request.headers.get('x-admin-secret') || searchParams.get('secret');

  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const dbUrlPrefix = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'
    : 'none';

  if (shouldClean) {
    // Protect clean action with secret authorization check
    const expectedSecret = process.env.ADMIN_DIAG_SECRET || 'alsouq-clean-secret-2026';
    if (!adminSecret || adminSecret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Secret key required for data reset operations.' },
        { status: 401 }
      );
    }

    const cleanResult = await cleanAllDummyData();
    dbStore.resetToEmpty();
    return NextResponse.json({
      action: 'cleaned',
      cleanResult,
      isVercel: Boolean(process.env.VERCEL),
    });
  }

  const sql = getDb();
  let dbCounts: any = null;

  if (sql) {
    try {
      await initPostgresTables();
      const users = await sql`SELECT count(*) FROM alsouq_users`;
      const classifieds = await sql`SELECT count(*) FROM alsouq_classifieds`;
      const posts = await sql`SELECT count(*) FROM alsouq_posts`;
      const stories = await sql`SELECT count(*) FROM alsouq_stories`;
      const leads = await sql`SELECT count(*) FROM alsouq_leads`;
      const verifications = await sql`SELECT count(*) FROM alsouq_verifications`;

      dbCounts = {
        users: Number(users[0].count),
        classifieds: Number(classifieds[0].count),
        posts: Number(posts[0].count),
        stories: Number(stories[0].count),
        leads: Number(leads[0].count),
        verifications: Number(verifications[0].count),
      };
    } catch (err: any) {
      dbCounts = { error: err.message };
    }
  }

  return NextResponse.json({
    status: 'operational',
    hasDatabaseUrl: hasDbUrl,
    dbHost: dbUrlPrefix,
    isVercel: Boolean(process.env.VERCEL),
    postgresCounts: dbCounts,
    localDiskCounts: {
      users: dbStore.users.length,
      classifieds: dbStore.classifieds.length,
      posts: dbStore.posts.length,
      leads: dbStore.leads.length,
    },
  });
}
