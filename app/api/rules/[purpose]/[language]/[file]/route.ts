// app/api/rules/[purpose]/[language]/[file]/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { loadDictionary } from '@/lib/rules';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ purpose: string; language: string; file: string }> }
) {
  try {
    const { purpose, language, file } = await params;
    const dictionary = await loadDictionary(purpose, language, file);
    return NextResponse.json(dictionary);
  } catch (error) {
    console.error('Error loading dictionary:', error);
    return NextResponse.json(
      { error: 'Failed to load dictionary' },
      { status: 500 }
    );
  }
}

