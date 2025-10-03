from enum import Enum
from typing import List, Optional, Literal, Tuple
from pydantic import BaseModel, Field

# Request Models
class GenerateRequest(BaseModel):
    description: str = Field(min_length=1)
    examples: Optional[List[Tuple[str, str]]] = None
    notExamples: Optional[List[Tuple[str, str]]] = None
    caseSensitive: bool
    partOfWord: Optional[bool] = True

class ConvertSyntaxRequest(BaseModel):
    findPattern: str = Field(min_length=1)
    replacePattern: Optional[str] = None
    description: Optional[str] = None

class RefineRequest(BaseModel):
    basePrompt: str = Field(min_length=1)
    currentFindPattern: str = Field(min_length=1)
    currentReplacePattern: str = Field(min_length=1)
    userMessage: str = Field(min_length=1)
    caseSensitive: Optional[bool] = None
    partOfWord: Optional[bool] = None


# Response & Result Models

## Generate - /api/py/generate
class GenerateResponseFormat(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str

class GenerateResult(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str
    basePrompt: str


## Convert Syntax - /api/py/convert-syntax
class ConvertSyntaxResponseFormat(BaseModel):
    dotnetFind: str
    dotnetReplace: str

class ConvertSyntaxResult(BaseModel):
    dotnetFind: str
    dotnetReplace: str


## Refine - /api/py/refine
class RefineResponseFormat(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str

class RefineResult(BaseModel):
    findPattern: str
    replacePattern: str
    explanation: str
    userMessage: str
