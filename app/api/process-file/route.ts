// app/api/process-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth'; // For reading .docx files

export async function POST(request: NextRequest) {
    console.log("API Route /api/process-file called");
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const findPattern = formData.get('findPattern') as string | null; // Can be null
        const replacePattern = formData.get('replacePattern') as string | null; // Can be null
        const caseSensitiveStr = formData.get('caseSensitive') as string | null; // Get as string
        const action = formData.get('action') as 'test' | 'substitute' | null;

        // --- Input Validation ---
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        if (!findPattern) {
            return NextResponse.json({ error: 'Find pattern is required' }, { status: 400 });
        }
         if (!action || (action !== 'test' && action !== 'substitute')) {
             return NextResponse.json({ error: 'Invalid or missing action parameter (must be "test" or "substitute")' }, { status: 400 });
         }
         if (action === 'substitute' && replacePattern === null) {
             // Allow empty string for replace, but not null if action is substitute
            return NextResponse.json({ error: 'Replace pattern is required for substitute action' }, { status: 400 });
        }
        // Safely parse boolean
        const caseSensitive = caseSensitiveStr === 'true';

         console.log("Processing File:", file.name, "Action:", action);

        // --- Read File Content ---
        let fileContent = '';
        console.log("File Type:", file.type);
        if (file.type === 'text/plain') {
            fileContent = await file.text();
            console.log(`Read ${fileContent.length} characters from TXT file.`);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            try {
                const buffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: buffer });
                fileContent = result.value; // The raw text content from the DOCX
                console.log(`Read ${fileContent.length} characters from DOCX file.`);
            } catch (docxError: any) {
                 console.error("Error reading DOCX file:", docxError);
                 return NextResponse.json({ error: 'Failed to read DOCX file content', details: docxError.message || 'Unknown DOCX processing error' }, { status: 500 });
            }
        } else {
             console.warn("Unsupported file type received:", file.type);
             return NextResponse.json({ error: `Unsupported file type: ${file.type}. Please upload .txt or .docx` }, { status: 400 });
        }

        // --- Perform Action (Test or Substitute) ---
        const flags = `g${caseSensitive ? '' : 'i'}`;
        let results: any = {};
        let regex: RegExp;

        try {
            regex = new RegExp(findPattern, flags);
            console.log("Processing file with RegExp:", regex);
        } catch (e: any) {
            console.error("Invalid Regex Pattern for file processing:", e.message);
            return NextResponse.json({ error: "Invalid Regex Pattern", details: e.message }, { status: 400 });
        }

        if (action === 'test') {
            const matchesData: any[] = [];
            let match;
            while ((match = regex.exec(fileContent)) !== null) {
                const startContext = Math.max(0, match.index - 50);
                const endContext = Math.min(fileContent.length, match.index + match[0].length + 50);
                const context = fileContent.substring(startContext, endContext);
                const prefix = startContext > 0 ? "..." : "";
                const suffix = endContext < fileContent.length ? "..." : "";

                matchesData.push({
                    match: match[0],
                    start: match.index,
                    end: match.index + match[0].length,
                    context: `${prefix}${context}${suffix}`
                });

                 if (match[0].length === 0) {
                     if (regex.lastIndex === match.index) {
                          regex.lastIndex++;
                     }
                }
            }
            results = { matches: matchesData };
            console.log(`Found ${matchesData.length} matches in file.`);

        } else if (action === 'substitute') {
            // Ensure $ are treated literally if not part of capture group syntax ($1, $2 etc are handled by replace)
            // In JS, $$ escapes a single $ for the replacement string.
            const safeReplacePattern = replacePattern!.replace(/\$/g, '$$$$');
            const substitutedText = fileContent.replace(regex, safeReplacePattern);
            results = { substitutedText };
            console.log(`Substitution complete. Substituted text length: ${substitutedText.length}`);
        }

        return NextResponse.json(results);

    } catch (error: any) {
        console.error('Error processing file:', error);
         const errorMessage = error.message || 'An unknown error occurred during file processing';
        return NextResponse.json({ error: 'Failed to process file', details: errorMessage }, { status: 500 });
    }
}