from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models import DocumentUploadResponse, DocumentListResponse, DocumentInfo
from app.services.document_service import document_service
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload and process a document for the knowledge base.
    
    Args:
        file: Document file (PDF, DOCX, TXT)
    
    Returns:
        Upload response with document info
    """
    # Validate file type
    allowed_extensions = ['.pdf', '.docx', '.doc', '.txt']
    file_ext = '.' + file.filename.split('.')[-1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Process the upload
        result = await document_service.process_upload(file)
        
        return DocumentUploadResponse(
            document_id=result['document_id'],
            filename=result['filename'],
            chunks_created=result['chunks_created'],
            status="success",
            message=f"Document processed successfully. Created {result['chunks_created']} chunks."
        )
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing document: {str(e)}"
        )

@router.get("/", response_model=DocumentListResponse)
async def list_documents():
    """
    Get list of all documents in the knowledge base.
    
    Returns:
        List of documents with metadata
    """
    try:
        documents = document_service.get_all_documents()
        
        document_infos = [
            DocumentInfo(
                document_id=doc['document_id'],
                filename=doc['filename'],
                upload_date=datetime.fromisoformat(doc['upload_date']) if doc['upload_date'] else datetime.now(),
                chunks_count=doc['chunks_count'],
                file_size=doc['file_size']
            )
            for doc in documents
        ]
        
        return DocumentListResponse(
            documents=document_infos,
            total_count=len(document_infos)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching documents: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """
    Delete a document from the knowledge base.
    
    Args:
        document_id: Document identifier
    
    Returns:
        Deletion confirmation
    """
    try:
        success = document_service.delete_document(document_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Document not found"
            )
        
        return {
            "status": "success",
            "message": f"Document {document_id} deleted successfully",
            "timestamp": datetime.now().isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting document: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Health check endpoint for documents service"""
    return {
        "status": "healthy",
        "service": "documents",
        "timestamp": datetime.now().isoformat()
    }
