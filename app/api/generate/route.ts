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

// Zod schema for the generate request body
const generateRequestSchema = z.object({
  description: z.string().min(1, "Description cannot be empty"),
  examples: z.array(z.tuple([z.string(), z.string()])).optional(),
  notExamples: z.array(z.tuple([z.string(), z.string()])).optional(),
  caseSensitive: z.boolean(),
  startPara: z.boolean().optional(), // Optional for now (UI hidden)
  endPara: z.boolean().optional(),   // Optional for now (UI hidden)
  partOfWord: z.boolean().optional(), // New option for part/entire word
});

// Type inference for the validated data
type GenerateRequestData = z.infer<typeof generateRequestSchema>;

// Helper function to generate the base prompt for the LLM
function generateBasePrompt(data: GenerateRequestData): string {
     const unpack = (examples: [string, string][] | undefined, type: string): string => {
        // Filter out examples where the first element (the actual example text) is empty or just whitespace
        const validExamples = examples?.filter(ex => ex[0]?.trim() !== '');
        if (!validExamples || validExamples.length === 0) {
            return '\n'; // Return just a newline if no valid examples
        }
        return `${type} EXAMPLES:\n` + validExamples
            .map(ex => `Ex: ${ex[0]}\nDesc: ${ex[1] || '(No description)'}`) // Add placeholder if desc is empty
            .join('\n') + '\n\n';
    }

    // Build options lines only if present
    const optionsLines = [
      `- Case-sensitive: ${data.caseSensitive}`,
      `- Match ${data.partOfWord === false ? 'ENTIRE WORDS ONLY (use \\b word boundaries)' : 'part of words allowed (no word boundaries needed)'}`,
    ];
    /* if (typeof data.startPara === 'boolean') {
      optionsLines.push(`- Start of paragraph: ${data.startPara}`);
    }
    if (typeof data.endPara === 'boolean') {
      optionsLines.push(`- End of paragraph: ${data.endPara}`);
    } */
    const basePrompt = `
DESCRIPTION:
${data.description}

${unpack(data.examples, 'MATCH')}${unpack(data.notExamples, 'DO NOT MATCH')}OPTIONS:
${optionsLines.join('\n')}

`.replace(/\n\n\n+/g, '\n\n').trim(); // Clean up extra newlines

    return basePrompt;
}

// The single POST handler for the /api/generate route
export async function POST(request: NextRequest) {
  console.log("API Route /api/generate called"); // Add logging
  try {
    let body;
    try {
         body = await request.json();
         console.log("(./api/generate/route.ts) Request Body:", body);
    } catch (parseError) {
        console.error("(./api/generate/route.ts) Failed to parse request JSON:", parseError);
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = generateRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("(./api/generate/route.ts) Request validation failed:", validation.error.errors);
      // Provide more specific Zod error details
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    // Validation successful, data is guaranteed to exist here
    const data = validation.data;
    const basePrompt = generateBasePrompt(data);
    console.log("(./api/generate/route.ts) Generated Base Prompt:", basePrompt);

    // --- Call Azure OpenAI to generate Find/Replace patterns ---
    console.log("Calling Azure OpenAI for pattern generation...");
    const response = await openai.chat.completions.create({
         model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
         messages: [
            {"role": "system", "content": "You are a regex expert. Return EXACTLY the find_pattern and replace_pattern in JavaScript regex format separated by '|||' and do NOT include any other text or characters like ``` or quotes."},
            {"role": "user", "content": `${basePrompt}\n\nATTENTION: Provide the JavaScript regex \`find_pattern\` and \`replace_pattern\`, formatted by separating them with '|||', (so for example: \`find_pattern|||replace_pattern\`) and do NOT include any other text or characters like backticks, quotes, etc. For the find_pattern, provide only the pattern body, not the surrounding slashes or flags (e.g., return 'hello' not '/hello/gi'). For the replace_pattern, use $1, $2 etc. for capture groups.`}
         ],
      temperature: 0.3,
      // max_tokens: 150, // Consider adding a max_tokens limit
    });
    console.log("Azure OpenAI Pattern Response received.");

    const result = response.choices[0]?.message?.content?.trim();
    console.log("Raw AI Response:", result);

    if (!result) {
      throw new Error('No content received from AI for pattern generation');
    }

    // Parse the result
    const parts = result.split('|||');
    const findPattern = parts[0]?.trim() ?? result; // Default to full result if split fails
    const replacePattern = parts[1]?.trim() ?? '';
    console.log("Parsed Patterns - Find:", findPattern, "Replace:", replacePattern);

    // --- Call Azure OpenAI to generate Explanation ---
    console.log("Calling Azure OpenAI for explanation generation...");
     const explanationResponse = await openai.chat.completions.create({
            model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
             messages: [
                {
                    "role": "system",
                    "content": `You are an expert in explaining JavaScript Regular Expressions. \n
                    You will be asked to explain the regex patterns. Write an explanation in markdown format wherein you explain both the find and replace patterns by breaking them down into their components and explaining each component. Only write the explanation in your response, and do not include any other text such as an introduction, conclusion or greeting.
                    Note: write your response in github flavored markdown.`,
                },
                {
                    "role": "user",
                    "content": `Can you please explain these regex patterns for me? Here is the description I used to generate the regex patterns:\n${data.description}. The generated find and replace patterns are:\nFind: ${findPattern}\nReplace: ${replacePattern}.`
                    
                    /* "Showcase the JavaScript regex solution (using /pattern/flags format for find pattern if applicable, and showing the replace string) and briefly explain the solution to me. Enclose any formulas or code snippets in ```.", */
                },
            ],
      temperature: 0.3,
      max_tokens: 1200,
    });
    console.log("Azure OpenAI Explanation Response received.");

    const explanation = explanationResponse.choices[0]?.message?.content?.trim() ?? 'Could not generate explanation.';
    console.log("Generated Explanation (truncated):", explanation);

    // Return the successful response
    return NextResponse.json({
        findPattern,
        replacePattern,
        explanation,
        basePrompt // Return base prompt for refinement later
     });

  } catch (error: any) {
    // Log the detailed error on the server
    console.error('API Error in /api/generate:', error);
    // Determine the error message and status code
    const errorMessage = error.response?.data?.error?.message // Axios-like error structure
                      || error.message // Standard error message
                      || 'An unknown error occurred during regex generation';
    const statusCode = error.response?.status || error.status || 500; // Get status code if available

    // Return a generic error message to the client
    return NextResponse.json({ error: 'Failed to generate regex', details: errorMessage }, { status: statusCode });
  }
}