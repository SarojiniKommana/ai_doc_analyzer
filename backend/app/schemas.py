from pydantic import BaseModel
from typing import List, Optional


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    char_count: int
    preview: str  # first ~500 chars, so the frontend can confirm the right file was read


class AnalyzeRequest(BaseModel):
    document_id: str


class QARequest(BaseModel):
    document_id: str
    question: str


class HistoryItem(BaseModel):
    document_id: str
    filename: str
    uploaded_at: str


class HistoryResponse(BaseModel):
    items: List[HistoryItem]


class DocumentDetail(BaseModel):
    document_id: str
    filename: str
    uploaded_at: str
    analysis: Optional[dict] = None  # None if analysis hasn't completed/saved yet
