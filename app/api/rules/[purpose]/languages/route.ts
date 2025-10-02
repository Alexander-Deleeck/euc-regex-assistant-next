// app/api/rules/[purpose]/languages/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listLanguages } from '@/lib/rules';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ purpose: string }> }
) {
  try {
    const { purpose } = await params;
    const languages = await listLanguages(purpose);
    return NextResponse.json({ languages });
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}

