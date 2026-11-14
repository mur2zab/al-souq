import { NextRequest, NextResponse } from 'next/server';
import { leadsRepository } from '@/server/repositories/leads.repository';
import { feedRepository } from '@/server/repositories/feed.repository';
import { classifiedsRepository } from '@/server/repositories/classifieds.repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('sellerId') || undefined;

    const leads = await leadsRepository.getLeadsBySeller(sellerId);
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLead = await leadsRepository.recordLead(body);

    // Increment click counter
    if (body.itemType === 'POST') {
      await feedRepository.incrementWhatsAppClicks(body.itemId);
    } else if (body.itemType === 'CLASSIFIED') {
      await classifiedsRepository.incrementWhatsAppClicks(body.itemId);
    }

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to record lead event' },
      { status: 400 }
    );
  }
}
