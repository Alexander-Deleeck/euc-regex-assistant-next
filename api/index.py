from __future__ import annotations
import os
import re
import io
from typing import List, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field, ValidationError
from openai import AzureOpenAI
from api.types import GenerateResponseFormat, GenerateResult, ConvertSyntaxResponseFormat, ConvertSyntaxResult, RefineResponseFormat, RefineResult, GenerateRequest, ConvertSyntaxRequest, RefineRequest
import mammoth
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="EUC Regex Assistant API (Python)")

# ---------- Azure OpenAI client ----------
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)
AZURE_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME")


# ---------- Helpers ----------
def _unpack_examples(examples: Optional[List[Tuple[str, str]]], heading: str) -> str:
    if not examples:
        return "\n"
    rows: List[str] = []
    for example_text, description in examples:
        example_text = (example_text or "").strip()
        if not example_text:
            continue
        rows.append(f"Ex: {example_text}\nDesc: {description or '(No description)'}")
    return (f"{heading} EXAMPLES:\n" + "\n".join(rows) + "\n\n") if rows else "\n"


def _build_base_prompt(data: GenerateRequest) -> str:
    # Define the word boundary message outside the f-string
    word_match_msg = 'ENTIRE WORDS ONLY (use \\b)' if data.partOfWord is False else 'part of words allowed'
    
    options_lines = [
        f"- Case-sensitive: {data.caseSensitive}",
        f"- Match {word_match_msg}",
    ]
    base = f"""
DESCRIPTION:
{data.description}

{_unpack_examples(data.examples, 'MATCH')}{_unpack_examples(data.notExamples, 'DO NOT MATCH')}OPTIONS:
{os.linesep.join(options_lines)}
""".strip()
    return base


def _call_structured_response(messages, response_format):
    resp = client.chat.completions.parse(
        model=AZURE_DEPLOYMENT,
        messages=messages,
        response_format=response_format,
    )
    
    # Check if we got a parsed object or a string
    content = resp.choices[0].message.content
    
    if isinstance(content, str):
        # If it's a string, parse it as JSON using the response format
        return response_format.model_validate_json(content)
    else:
        # If it's already parsed, return it directly
        return content


_js_group_num = re.compile(r"\$(\d+)")
_js_group_named = re.compile(r"\$\{([A-Za-z_][A-Za-z0-9_]*)\}")

def js_replace_to_python(repl: str) -> str:
    if repl is None:
        return ""
    s = repl
    s = s.replace("$$", "$")          # $$ -> literal $
    s = s.replace("$&", r"\g<0>")     # $& -> entire match
    s = _js_group_num.sub(r"\\g<\1>", s)
    s = _js_group_named.sub(r"\\g<\1>", s)
    return s


# ---------- Routes ----------
@app.post("/api/py/generate", response_model=GenerateResult)
def generate_regex(data: GenerateRequest):
    # TODO:
    # - Update prompt to use structured response WITH explanation
    # - Remove second call to LLM for explanation
    # - Parse structured response
    """
    Generate a new regex find_pattern and replace_pattern based on the given description and examples.
    Args:
        data: GenerateRequest
    Returns:
        GenerateResult
    """
    # print("Python API: Generating regex...")
    # print("Python API: Data:", data)
    base_prompt = _build_base_prompt(data)

    try:
        # Combined LLM call that generates both regex patterns and explanation in structured format
        response_generate = _call_structured_response(messages=[
            {
                "role": "system",
                "content": (
                    "You are a regex expert and technical documentation specialist. "
                    "Generate JavaScript regex patterns and provide clear explanations. "
                    "Return your response in the structured format with:\n"
                    "- findPattern: JavaScript regex pattern (just the body, no /.../flags)\n"
                    "- replacePattern: JavaScript replacement pattern using $1, $2... for groups\n"
                    "- explanation: GitHub-flavored markdown with a table breaking down regex components "
                    "(columns: 'Pattern' and 'Explanation'). No intro/outro text."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"{base_prompt}\n\n"
                    f"Generate both the regex patterns and a detailed explanation of how they work."
                ),
            },
        ], response_format=GenerateResponseFormat)
        
        # Verify the structured response was correctly obtained
        # print("[python api](generate): LLM Response received successfully!")
        # print(f"[python api](generate): Response type: {type(response_generate).__name__}")
        # print(f"[python api](generate): FindPattern length: {len(response_generate.findPattern)} chars")
        # print(f"[python api](generate): ReplacePattern length: {len(response_generate.replacePattern)} chars")
        # print(f"[python api](generate): Explanation length: {len(response_generate.explanation)} chars")
        
    except ValidationError as e:
        print("/api/py/generate: ValidationError:", e)
        raise HTTPException(
            500, "ValidationError Error while generating regex in /api/py/generate."
        )
    except Exception as e:
        print(f"/api/py/generate: Unexpected error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            500, f"Unexpected error while generating regex: {e}"
        )

    if not response_generate.findPattern:
        raise HTTPException(500, "Model did not return a find pattern.")

    # Create and verify the final result object
    result = GenerateResult(
        findPattern=response_generate.findPattern,
        replacePattern=response_generate.replacePattern,
        explanation=response_generate.explanation,
        basePrompt=base_prompt,
    )
    
    # print("[python api](generate): GenerateResult created successfully!")
    # print(f"[python api](generate): Final result type: {type(result).__name__}")
    # print(f"[python api](generate): Final FindPattern length: {len(result.findPattern)} chars")
    # print(f"[python api](generate): Final ReplacePattern length: {len(result.replacePattern)} chars")
    # print(f"[python api](generate): Final Explanation length: {len(result.explanation)} chars")
    
    # Verify result can be serialized to JSON before returning
    try:
        result_dict = result.model_dump()
        print(f"[python api](generate): Result successfully serialized to dict")
        # Try to encode as JSON to ensure it's valid
        json_compatible = jsonable_encoder(result_dict)
        print(f"[python api](generate): Result successfully JSON encoded")
        print(f"[python api](generate): Returning response to frontend...")
        return JSONResponse(content=json_compatible)
    except Exception as e:
        print(f"[python api](generate): ERROR - Failed to serialize result: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, f"Failed to serialize result: {e}")


@app.post("/api/py/convert-syntax", response_model=ConvertSyntaxResult)
def convert_syntax(data: ConvertSyntaxRequest):
    prompt = (
        "Convert the following JavaScript regex to .NET regex.\n\n"
        f"Description: {data.description or '(none)'}\n\n"
        f"JavaScript Find: {data.findPattern}\n"
        f"JavaScript Replace: {data.replacePattern or '(none)'}\n\n"
        "Return ONLY: dotnet_find|||dotnet_replace"
    )
    try:
        response_convert = _call_structured_response([
            {
                "role": "system",
                "content": (
                    "You are a regex expert. Convert JavaScript regex to .NET. "
                    "Output ONLY the .NET find and replace patterns separated by '|||'. No extra text."
                ),
            },
            {"role": "user", "content": prompt},
        ], response_format=ConvertSyntaxResponseFormat)
        
    except ValidationError as e:
        # TODO add logger: logger.warning(f"LLM classification parse failed; attempting simple classification. Error: {e}")
        print("/api/py/convert-syntax: ValidationError:", e)
        raise HTTPException(
            500, "ValidationError Error while converting syntax in /api/py/convert-syntax."
        )
    return ConvertSyntaxResult(
        dotnetFind=response_convert.dotnetFind,
        dotnetReplace=response_convert.dotnetReplace,
    )


@app.post("/api/py/refine", response_model=RefineResult)
def refine_regex(data: RefineRequest):
    try:
        # Combined LLM call that generates both refined regex patterns and explanation in structured format
        response_refine = _call_structured_response(messages=[
            {
                "role": "system",
                "content": (
                    "You are a regex expert and technical documentation specialist helping refine patterns based on feedback. "
                    "Generate improved JavaScript regex patterns and provide clear explanations. "
                    "Return your response in the structured format with:\n"
                    "- findPattern: Refined JavaScript regex pattern (just the body, no /.../flags)\n"
                    "- replacePattern: Refined JavaScript replacement pattern using $1, $2... for groups\n"
                    "- explanation: GitHub-flavored markdown with a table breaking down the refined regex components "
                    "(columns: 'Pattern' and 'Explanation'). No intro/outro text."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"<previous_description>\n{data.basePrompt}\n</previous_description>\n"
                    f"<previous_find>\n{data.currentFindPattern}\n</previous_find>\n"
                    f"<previous_replace>\n{data.currentReplacePattern}\n</previous_replace>\n"
                    f"<feedback>\n{data.userMessage}\n</feedback>\n\n"
                    f"Refine the regex patterns based on the feedback and provide a detailed explanation of the improvements."
                ),
            },
        ], response_format=RefineResponseFormat)
        
        # Verify the structured response was correctly obtained
        print("[python api](refine): LLM Response received successfully!")
        print(f"[python api](refine): Response type: {type(response_refine).__name__}")
        print(f"[python api](refine): FindPattern length: {len(response_refine.findPattern)} chars")
        print(f"[python api](refine): ReplacePattern length: {len(response_refine.replacePattern)} chars")
        print(f"[python api](refine): Explanation length: {len(response_refine.explanation)} chars")
        
    except ValidationError as e:
        print("/api/py/refine: ValidationError:", e)
        raise HTTPException(
            500, "ValidationError Error while refining regex in /api/py/refine."
        )

    if not response_refine.findPattern:
        raise HTTPException(500, "Model did not return a refined find pattern.")

    # Create and verify the final result object
    result = RefineResult(
        findPattern=response_refine.findPattern,
        replacePattern=response_refine.replacePattern,
        explanation=response_refine.explanation,
        userMessage=data.userMessage,
    )
    
    print("[python api](refine): RefineResult created successfully!")
    print(f"[python api](refine): Final result type: {type(result).__name__}")
    print(f"[python api](refine): Final FindPattern length: {len(result.findPattern)} chars")
    print(f"[python api](refine): Final ReplacePattern length: {len(result.replacePattern)} chars")
    print(f"[python api](refine): Final Explanation length: {len(result.explanation)} chars")
    
    return result


@app.post("/api/py/process-file")
async def process_file(
    file: UploadFile = File(...),
    findPattern: str = Form(...),
    replacePattern: Optional[str] = Form(None),
    caseSensitive: str = Form("false"),  # 'true' / 'false'
    action: str = Form(...),              # 'test' | 'substitute'
):
    if action not in ("test", "substitute"):
        raise HTTPException(400, 'Invalid action (must be "test" or "substitute").')
    if action == "substitute" and replacePattern is None:
        raise HTTPException(400, "Replace pattern is required for substitute action.")

    # Read text content (.txt or .docx)
    content_type = (file.content_type or "").lower()
    text = ""
    try:
        if content_type == "text/plain":
            text = (await file.read()).decode("utf-8", errors="replace")
        elif content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            buf = await file.read()
            with io.BytesIO(buf) as file_like:
                result = mammoth.extract_raw_text(file_like)
                text = result.value or ""
        else:
            raise HTTPException(400, f"Unsupported file type: {content_type}. Please upload .txt or .docx")
    except Exception as e:  # pragma: no cover - defensive
        raise HTTPException(500, f"Failed to read file content: {e}")

    # Build Python regex (NOTE: semantics differ from JS)
    flags = 0 if caseSensitive == "true" else re.IGNORECASE
    try:
        regex = re.compile(findPattern, flags)
    except re.error as e:
        raise HTTPException(400, f"Invalid Regex Pattern: {e}")

    if action == "test":
        matches = []
        for m in regex.finditer(text):
            start, end = m.start(), m.end()
            ctx_start = max(0, start - 50)
            ctx_end = min(len(text), end + 50)
            context = text[ctx_start:ctx_end]
            prefix = "..." if ctx_start > 0 else ""
            suffix = "..." if ctx_end < len(text) else ""
            matches.append(
                {
                    "match": m.group(0),
                    "start": start,
                    "end": end,
                    "context": f"{prefix}{context}{suffix}",
                }
            )
        return JSONResponse({"matches": matches})

    # substitute
    py_repl = js_replace_to_python(replacePattern or "")
    try:
        substituted = regex.sub(py_repl, text)
    except re.error as e:
        raise HTTPException(400, f"Replacement error: {e}")
    return JSONResponse({"substitutedText": substituted})
