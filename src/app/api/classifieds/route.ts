import { NextRequest, NextResponse } from 'next/server';
import { classifiedsRepository } from '@/server/repositories/classifieds.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('cityId') || undefined;
    const mohallaName = searchParams.get('mohallaName') || undefined;
    const category = (searchParams.get('category') as any) || undefined;

    const classifieds = await classifiedsRepository.getClassifieds({
      cityId,
      mohallaName,
      category,
    });
    return NextResponse.json({ success: true, count: classifieds.length, classifieds });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch classifieds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listing = await classifiedsRepository.createClassified(body);
    return NextResponse.json({ success: true, listing }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create classified listing' },
      { status: 400 }
    );
  }
}
