from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatRequest(BaseModel):
    """Request model for chat endpoint"""
    query: str = Field(..., min_length=1, description="User's question")
    conversation_id: Optional[str] = Field(None, description="Conversation ID for context")

class Source(BaseModel):
    """Source document reference"""
    document_name: str
    page: Optional[int] = None
    chunk_id: str
    relevance_score: float

class ChatResponse(BaseModel):
    """Response model for chat endpoint"""
    answer: str
    sources: List[Source]
    conversation_id: str
    timestamp: datetime = Field(default_factory=datetime.now)

class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    document_id: str
    filename: str
    chunks_created: int
    status: str
    message: str

class DocumentInfo(BaseModel):
    """Document information model"""
    document_id: str
    filename: str
    upload_date: datetime
    chunks_count: int
    file_size: int

class DocumentListResponse(BaseModel):
    """Response model for listing documents"""
    documents: List[DocumentInfo]
    total_count: int

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
