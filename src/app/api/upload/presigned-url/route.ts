import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/server/services/storage.service';

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, folder } = await request.json();

    if (!filename) {
      return NextResponse.json(
        { success: false, message: 'filename is required' },
        { status: 400 }
      );
    }

    const presignedData = await storageService.generatePresignedPutUrl(
      filename,
      contentType || 'image/webp',
      folder || 'listings'
    );

    return NextResponse.json({ success: true, ...presignedData });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to generate presigned upload URL' },
      { status: 500 }
    );
  }
}
