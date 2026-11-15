import { NextResponse } from 'next/server';

export async function GET() {
  const hasDbUrl = Boolean(process.env.DATABASE_URL);
  const dbUrlPrefix = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'configured'
    : 'none';

  return NextResponse.json({
    hasDatabaseUrl: hasDbUrl,
    dbHost: dbUrlPrefix,
    isVercel: Boolean(process.env.VERCEL),
  });
}
