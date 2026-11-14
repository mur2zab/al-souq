import { NextRequest, NextResponse } from 'next/server';
import { feedRepository } from '@/server/repositories/feed.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId') || undefined;
    const mohallaName = searchParams.get('mohallaName') || undefined;
    const category = searchParams.get('category') || undefined;

    const posts = await feedRepository.getFeedPosts({ cityId, mohallaName, category });
    return NextResponse.json({ success: true, count: posts.length, posts });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch feed posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPost = await feedRepository.createPost(body);
    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create feed post' },
      { status: 400 }
    );
  }
}
