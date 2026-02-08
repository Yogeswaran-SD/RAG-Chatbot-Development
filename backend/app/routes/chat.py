from fastapi import APIRouter, HTTPException
from app.models import ChatRequest, ChatResponse, ErrorResponse, Source
from app.services.rag_service import rag_service
from datetime import datetime

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Process a chat query and return context-grounded response.
    
    Args:
        request: Chat request with query
    
    Returns:
        Chat response with answer and sources
    """
    try:
        # Validate query
        if not request.query or len(request.query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Generate answer using RAG
        result = rag_service.generate_answer(request.query)
        
        # Format sources
        sources = [
            Source(
                document_name=src['document_name'],
                page=src.get('page'),
                chunk_id=src['chunk_id'],
                relevance_score=src['relevance_score']
            )
            for src in result['sources']
        ]
        
        # Return response
        return ChatResponse(
            answer=result['answer'],
            sources=sources,
            conversation_id=result.get('conversation_id', request.conversation_id or ''),
            timestamp=datetime.now()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for chat service"""
    return {
        "status": "healthy",
        "service": "chat",
        "timestamp": datetime.now().isoformat()
    }
