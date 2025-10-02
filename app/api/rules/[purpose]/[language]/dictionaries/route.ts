// app/api/rules/[purpose]/[language]/dictionaries/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { listRuleDictionaries } from '@/lib/rules';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ purpose: string; language: string }> }
) {
  try {
    const { purpose, language } = await params;
    const files = await listRuleDictionaries(purpose, language);
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching dictionaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dictionaries' },
      { status: 500 }
    );
  }
}

