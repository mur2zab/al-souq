import { NextRequest, NextResponse } from 'next/server';
import { cleanAllDummyData, getDb, initPostgresTables } from '@/server/db/postgres';
import { dbStore } from '@/server/db/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldClean = searchParams.get('clean') === 'true';

  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const dbUrlPrefix = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'
    : 'none';

  if (shouldClean) {
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
  let remainingUsers: any[] = [];

  if (sql) {
    try {
      await initPostgresTables();
      const users = await sql`SELECT id, email, full_name, role FROM alsouq_users`;
      const classifieds = await sql`SELECT count(*) FROM alsouq_classifieds`;
      const posts = await sql`SELECT count(*) FROM alsouq_posts`;
      const stories = await sql`SELECT count(*) FROM alsouq_stories`;
      const leads = await sql`SELECT count(*) FROM alsouq_leads`;
      const verifications = await sql`SELECT count(*) FROM alsouq_verifications`;

      remainingUsers = users;
      dbCounts = {
        users: users.length,
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
    hasDatabaseUrl: hasDbUrl,
    dbHost: dbUrlPrefix,
    isVercel: Boolean(process.env.VERCEL),
    postgresCounts: dbCounts,
    users: remainingUsers,
    localDiskCounts: {
      users: dbStore.users.length,
      classifieds: dbStore.classifieds.length,
      posts: dbStore.posts.length,
      leads: dbStore.leads.length,
    },
  });
}
