import { NextRequest, NextResponse } from 'next/server';
import { feedRepository } from '@/server/repositories/feed.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId') || undefined;

    const stories = await feedRepository.getStories(cityId);
    return NextResponse.json({ success: true, count: stories.length, stories });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}
