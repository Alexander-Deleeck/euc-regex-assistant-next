// app/api/substitute-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for the substitute text request body
const substituteTextSchema = z.object({
    findPattern: z.string(), // Expecting just the pattern body
    replacePattern: z.string(), // The replacement string
    text: z.string(),
    caseSensitive: z.boolean()
});

// Type inference for validated data
type SubstituteTextData = z.infer<typeof substituteTextSchema>;

export async function POST(request: NextRequest) {
    console.log("API Route /api/substitute-text called");
    try {
        let body;
        try {
            body = await request.json();
            console.log("Request Body:", body);
        } catch (parseError) {
            console.error("Failed to parse request JSON:", parseError);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        const validation = substituteTextSchema.safeParse(body);

        if (!validation.success) {
            console.error("Request validation failed:", validation.error.errors);
            return NextResponse.json({ error: 'Invalid input for text substitution', details: validation.error.format() }, { status: 400 });
        }

        // Validation successful
        const { findPattern, replacePattern, text, caseSensitive } = validation.data;

        // Construct the RegExp object
        const flags = `g${caseSensitive ? '' : 'i'}`; // Global flag is needed for replace all
        let regex: RegExp;
        try {
            regex = new RegExp(findPattern, flags);
            console.log("Substituting with RegExp:", regex, "Replace pattern:", replacePattern);
        } catch (e: any) {
            // Catch errors during RegExp creation
            console.error("Invalid Regex Pattern:", e.message);
            return NextResponse.json({ error: "Invalid Regex Pattern", details: e.message }, { status: 400 });
        }

        // Perform the substitution using the replacePattern directly
        // REMOVED: const safeReplacePattern = replacePattern.replace(/\$/g, '$$$$');
        const substitutedText = text.replace(regex, replacePattern); // Use replacePattern directly
        console.log("Substitution complete.");

        return NextResponse.json({ substitutedText });

    } catch (error: any) {
        // Catch unexpected errors during execution
        console.error("Error in /api/substitute-text:", error);
        const errorMessage = error.message || 'An unknown error occurred during text substitution';
        return NextResponse.json({ error: 'Failed to substitute text', details: errorMessage }, { status: 500 });
    }
}