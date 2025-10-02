// app/api/rules/purposes/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listPurposes } from '@/lib/rules';

export async function GET() {
  try {
    const purposes = await listPurposes();
    return NextResponse.json({ purposes });
  } catch (error) {
    console.error('Error fetching purposes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purposes' },
      { status: 500 }
    );
  }
}

