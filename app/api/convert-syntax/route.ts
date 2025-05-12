// app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Ensure OpenAI client is configured correctly for Azure
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
});

// Zod schema for the convert-syntax request body
const convertSyntaxSchema = z.object({
  findPattern: z.string().min(1, 'Find pattern is required'),
  replacePattern: z.string().optional(),
  description: z.string().optional(),
});

type ConvertSyntaxData = z.infer<typeof convertSyntaxSchema>;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = convertSyntaxSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }
    const data = validation.data;

    // Build the prompt for conversion
    const prompt = `You are a regex expert. Convert the following JavaScript regex patterns to .NET regex syntax. 

Description of the pattern's purpose: ${data.description || '(No description provided)'}

JavaScript Find Pattern: ${data.findPattern}
JavaScript Replace Pattern: ${data.replacePattern || '(none)'}

Return ONLY the .NET find pattern and replace pattern, separated by '|||', with NO extra text, quotes, or formatting. For example: dotnet_find_pattern|||dotnet_replace_pattern`;

    // Call Azure OpenAI for conversion
    const response = await openai.chat.completions.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
      messages: [
        { role: 'system', content: 'You are a regex expert. Convert JavaScript regex to .NET regex. Output ONLY the .NET find and replace patterns separated by |||, with no extra text.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) {
      throw new Error('No content received from AI for regex conversion');
    }
    const parts = result.split('|||');
    const dotnetFind = parts[0]?.trim() ?? '';
    const dotnetReplace = parts[1]?.trim() ?? '';

    return NextResponse.json({ dotnetFind, dotnetReplace });
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || error.message || 'An unknown error occurred during regex conversion';
    const statusCode = error.response?.status || error.status || 500;
    return NextResponse.json({ error: 'Failed to convert regex syntax', details: errorMessage }, { status: statusCode });
  }
}