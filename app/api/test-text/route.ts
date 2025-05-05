// app/api/test-text/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for the test text request body
const testTextSchema = z.object({
    findPattern: z.string(), // Expecting just the pattern body, not /.../flags
    testText: z.string(),
    caseSensitive: z.boolean()
});

// Type inference for validated data
type TestTextData = z.infer<typeof testTextSchema>;

export async function POST(request: NextRequest) {
    console.log("API Route /api/test-text called");
    try {
        let body;
        try {
            body = await request.json();
            console.log("Request Body:", body);
        } catch (parseError) {
            console.error("Failed to parse request JSON:", parseError);
            return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
        }

        const validation = testTextSchema.safeParse(body);

        if (!validation.success) {
            console.error("Request validation failed:", validation.error.errors);
            return NextResponse.json({ error: 'Invalid input for text test', details: validation.error.format() }, { status: 400 });
        }

        // Validation successful, data is guaranteed to exist
        const { findPattern, testText, caseSensitive } = validation.data;

        // Construct the RegExp object
        const flags = `g${caseSensitive ? '' : 'i'}`; // Global flag is essential for finding all matches
        let regex: RegExp;
        try {
            regex = new RegExp(findPattern, flags);
            console.log("Testing with RegExp:", regex);
        } catch (e: any) {
            // Catch errors during RegExp creation (e.g., invalid pattern syntax)
            console.error("Invalid Regex Pattern:", e.message);
            return NextResponse.json({ error: "Invalid Regex Pattern", details: e.message }, { status: 400 });
        }

        const matches = [];
        let match;

        // Use exec in a loop to find all matches for global regex
        while ((match = regex.exec(testText)) !== null) {
            matches.push({
                match: match[0],
                start: match.index,
                end: match.index + match[0].length,
                // Include captured groups if needed:
                // groups: match.slice(1), // All numbered capture groups
                // namedGroups: match.groups // Named capture groups (if supported/used)
            });

            // Prevent infinite loops for zero-length matches with global flag
             if (match[0].length === 0) {
                // Only advance if the pattern could potentially match at the next position
                // This check avoids infinite loops on patterns like /a*/g against "bbb"
                if (regex.lastIndex === match.index) {
                     regex.lastIndex++;
                }
             }
        }
        console.log(`Found ${matches.length} matches.`);

        return NextResponse.json({ matches });

    } catch (error: any) {
        // Catch unexpected errors during execution
        console.error("Error in /api/test-text:", error);
        const errorMessage = error.message || 'An unknown error occurred during text testing';
        return NextResponse.json({ error: 'Failed to test regex on text', details: errorMessage }, { status: 500 });
    }
}