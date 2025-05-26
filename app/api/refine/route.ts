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
const refineRequestSchema = z.object({
  basePrompt: z.string().min(1, "Previous pattern description not found. Please refresh the page and try again."),
  currentFindPattern: z.string().min(1, "Previous find regex pattern not found. Please refresh the page and try again."),
  currentReplacePattern: z.string().min(1, "Previous replace regex pattern not found. Please refresh the page and try again."),
  userMessage: z.string().min(1, "User refinement feedback not found. Please enter feedback and ensure a pattern has been generated."),
  caseSensitive: z.boolean().optional(),
  partOfWord: z.boolean().optional(), // New option for part/entire word
});

// Type inference for the validated data
type RefineRequestData = z.infer<typeof refineRequestSchema>;

// The single POST handler for the /api/generate route
export async function POST(request: NextRequest) {
  console.log("API Route /api/refine called"); // Add logging
    try {
      let body;
    try {
         body = await request.json();
         console.log("(./api/refine/route.ts) Request Body:", body);
    } catch (parseError) {
        console.error("(./api/refine/route.ts) Failed to parse request JSON:", parseError);
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const validation = refineRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error("(./api/refine/route.ts) Request validation failed:", validation.error.errors);
      // Provide more specific Zod error details
      return NextResponse.json({ error: 'Invalid input', details: validation.error.format() }, { status: 400 });
    }

    // Validation successful, data is guaranteed to exist here
    const data = validation.data;

    // --- Call Azure OpenAI to generate Find/Replace patterns ---
    console.log("(./api/refine/route.ts) Calling Azure OpenAI for pattern generation...");
    const response = await openai.chat.completions.create({
         model: process.env.AZURE_OPENAI_DEPLOYMENT_NAME!,
         messages: [
            {"role": "system", "content": `
<role>  
  You are a regex expert who helps users refine their regex patterns. The user has already generated a regex pattern, but they want your help to refine and improve it. 
</role>

<instructions>
  Below, you will be given the description that the user had written to generate the previous regex pattern, and also the previous regex patterns (find_pattern and replace_pattern) itself. 
  After that, you will be given the user's feedback on the previous regex patterns, and you will need to refine the patterns based on the feedback.

  Return EXACTLY the refined \`find_pattern\` and \`replace_pattern\` in *JavaScript* regex format    separated by '|||' and do NOT include any other text or characters like \`\`\` or quotes.
</instructions>
  
<previous>
  <previous_description>
  ${data.basePrompt}
  </previous_description>
  
  <previous_find_pattern>
  ${data.currentFindPattern}
  </previous_find_pattern>

  <previous_replace_pattern>
  ${data.currentReplacePattern}
  </previous_replace_pattern>
</previous>
`},

            {"role": "user", "content": `
<new>
  <user_feedback>
  ${data.userMessage}
  </user_feedback>
</new>

<reminder>
  Return EXACTLY the refined \`find_pattern\` and \`replace_pattern\` in *JavaScript* regex format separated by '|||' and do NOT include any other text or characters like \`\`\` or quotes.
</reminder>
`}
         ],
      temperature: 0.3,
      // max_tokens: 150, // Consider adding a max_tokens limit
    });
    console.log("Azure OpenAI Pattern Response received.");

    const result = response.choices[0]?.message?.content?.trim();
    console.log("(./api/refine/route.ts) Raw AI Response:", result);

    if (!result) {
      throw new Error('No content received from AI for pattern generation');
    }

    // Parse the result
    const parts = result.split('|||');
    const findPattern = parts[0]?.trim() ?? result; // Default to full result if split fails
    const replacePattern = parts[1]?.trim() ?? '';
    console.log("(./api/refine/route.ts) Parsed Patterns - Find:", findPattern, "Replace:", replacePattern);

    // --- Call Azure OpenAI to generate Explanation ---
    console.log("(./api/refine/route.ts) Calling Azure OpenAI for explanation generation...");
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
                    "content": `Can you please explain these regex patterns for me? The generated find and replace patterns are:\nFind: ${findPattern}\nReplace: ${replacePattern}.`
                    
                    /* "Showcase the JavaScript regex solution (using /pattern/flags format for find pattern if applicable, and showing the replace string) and briefly explain the solution to me. Enclose any formulas or code snippets in ```.", */
                },
            ],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const explanation = explanationResponse.choices[0]?.message?.content?.trim() ?? 'Could not generate explanation.';
    console.log("(./api/refine/route.ts) Generated Explanation (truncated):\n", explanation);

    // Return the successful response
    return NextResponse.json({
        findPattern,
        replacePattern,
        explanation,
        userMessage: data.userMessage // Return base prompt for refinement later
     });

  } catch (error: any) {
    // Log the detailed error on the server
    console.error('API Error in /api/refine:', error);
    // Determine the error message and status code
    const errorMessage = error.response?.data?.error?.message // Axios-like error structure
                      || error.message // Standard error message
                      || 'An unknown error occurred during regex refinement';
    const statusCode = error.response?.status || error.status || 500; // Get status code if available

    // Return a generic error message to the client
    return NextResponse.json({ error: 'Failed to refine regex', details: errorMessage }, { status: statusCode });
  }
}