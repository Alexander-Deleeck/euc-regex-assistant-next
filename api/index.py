from __future__ import annotations
import os
import re
import io
from typing import List, Optional, Tuple
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from openai import AzureOpenAI
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


# ---------- Models ----------
class GenerateRequest(BaseModel):
    description: str = Field(min_length=1)
    examples: Optional[List[Tuple[str, str]]] = None
    notExamples: Optional[List[Tuple[str, str]]] = None
    caseSensitive: bool
    partOfWord: Optional[bool] = True


class GenerateResponse(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str
    basePrompt: str


class ConvertSyntaxRequest(BaseModel):
    findPattern: str = Field(min_length=1)
    replacePattern: Optional[str] = None
    description: Optional[str] = None


class ConvertSyntaxResponse(BaseModel):
    dotnetFind: str
    dotnetReplace: str


class RefineRequest(BaseModel):
    basePrompt: str = Field(min_length=1)
    currentFindPattern: str = Field(min_length=1)
    currentReplacePattern: str = Field(min_length=1)
    userMessage: str = Field(min_length=1)
    caseSensitive: Optional[bool] = None
    partOfWord: Optional[bool] = None


class RefineResponse(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str
    userMessage: str


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


def _call_chat(messages, temperature: float = 0.3) -> str:
    print("Python API: Calling chat...")
    print("Python API: Messages:", messages)
    print("Python API: Temperature:", temperature)
    resp = client.chat.completions.create(
        model=AZURE_DEPLOYMENT,
        messages=messages,
        temperature=temperature,
    )
    content = (resp.choices[0].message.content or "").strip()
    if not content:
        raise RuntimeError("Empty response from Azure OpenAI.")
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
@app.post("/api/py/generate", response_model=GenerateResponse)
def generate_regex(data: GenerateRequest):
    print("Python API: Generating regex...")
    print("Python API: Data:", data)
    base_prompt = _build_base_prompt(data)

    find_replace = _call_chat([
        {
            "role": "system",
            "content": (
                "You are a regex expert. Return EXACTLY the find_pattern and replace_pattern in "
                "JavaScript regex format separated by '|||'. No extra text, backticks or quotes. "
                "The find pattern must be just the body (no /.../flags). Use $1, $2... in replace."
            ),
        },
        {
            "role": "user",
            "content": f"{base_prompt}\n\nReturn: find|||replace",
        },
    ])
    print("Python API: Find replace:", find_replace)
    parts = [p.strip() for p in find_replace.split("|||")]
    find_pattern = parts[0] if parts else ""
    replace_pattern = parts[1] if len(parts) > 1 else ""

    if not find_pattern:
        raise HTTPException(500, "Model did not return a find pattern.")

    explanation = _call_chat([
        {
            "role": "system",
            "content": (
                "You are an expert in explaining JavaScript Regular Expressions. "
                "Write GitHub-flavored markdown. Use a single markdown table with columns "
                "'Pattern' and 'Explanation' to break down the regex components. "
                "Do not include intro/outro text."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Explain these regex patterns.\nFind: {find_pattern}\nReplace: {replace_pattern}\n"
                f"Original description:\n{data.description}"
            ),
        },
    ], temperature=0.3)

    return GenerateResponse(
        findPattern=find_pattern,
        replacePattern=replace_pattern,
        explanation=explanation,
        basePrompt=base_prompt,
    )


@app.post("/api/py/convert-syntax", response_model=ConvertSyntaxResponse)
def convert_syntax(data: ConvertSyntaxRequest):
    prompt = (
        "Convert the following JavaScript regex to .NET regex.\n\n"
        f"Description: {data.description or '(none)'}\n\n"
        f"JavaScript Find: {data.findPattern}\n"
        f"JavaScript Replace: {data.replacePattern or '(none)'}\n\n"
        "Return ONLY: dotnet_find|||dotnet_replace"
    )
    result = _call_chat([
        {
            "role": "system",
            "content": (
                "You are a regex expert. Convert JavaScript regex to .NET. "
                "Output ONLY the .NET find and replace patterns separated by '|||'. No extra text."
            ),
        },
        {"role": "user", "content": prompt},
    ], temperature=0.2)
    parts = [p.strip() for p in result.split("|||")]
    return ConvertSyntaxResponse(
        dotnetFind=parts[0] if parts else "",
        dotnetReplace=parts[1] if len(parts) > 1 else "",
    )


@app.post("/api/py/refine", response_model=RefineResponse)
def refine_regex(data: RefineRequest):
    result = _call_chat([
        {
            "role": "system",
            "content": (
                "You are a regex expert helping refine patterns based on feedback. "
                "Return EXACTLY find|||replace in JavaScript format; no extra text."
            ),
        },
        {
            "role": "user",
            "content": (
                f"<previous_description>\n{data.basePrompt}\n</previous_description>\n"
                f"<previous_find>\n{data.currentFindPattern}\n</previous_find>\n"
                f"<previous_replace>\n{data.currentReplacePattern}\n</previous_replace>\n"
                f"<feedback>\n{data.userMessage}\n</feedback>\n\nReturn: find|||replace"
            ),
        },
    ], temperature=0.3)
    parts = [p.strip() for p in result.split("|||")]
    find_pattern = parts[0] if parts else ""
    replace_pattern = parts[1] if len(parts) > 1 else ""

    explanation = _call_chat([
        {
            "role": "system",
            "content": (
                "Explain the (refined) JavaScript regex in GitHub-flavored markdown; "
                "use a single table with columns 'Pattern' and 'Explanation'. No intro/outro text."
            ),
        },
        {"role": "user", "content": f"Find: {find_pattern}\nReplace: {replace_pattern}"},
    ], temperature=0.3)

    return RefineResponse(
        findPattern=find_pattern,
        replacePattern=replace_pattern,
        explanation=explanation,
        userMessage=data.userMessage,
    )


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

