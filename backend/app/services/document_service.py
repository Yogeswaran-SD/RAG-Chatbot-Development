import os
import uuid
from datetime import datetime
from typing import Dict, Any, List
from pathlib import Path
import PyPDF2
import docx
from fastapi import UploadFile
from app.config import settings
from app.services.vector_store import vector_store_service

class DocumentService:
    """Service for processing and managing documents"""
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    async def process_upload(self, file: UploadFile) -> Dict[str, Any]:
        """
        Process an uploaded file and add it to the vector store.
        
        Args:
            file: Uploaded file
        
        Returns:
            Processing result with document info
        """
        # Generate unique document ID
        document_id = str(uuid.uuid4())
        
        # Save file
        file_path = self.upload_dir / f"{document_id}_{file.filename}"
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Extract text based on file type
        text = self._extract_text(file_path, file.filename)
        
        if not text or len(text.strip()) == 0:
            raise ValueError("No text content found in document")
        
        # Split into chunks
        chunks = vector_store_service.split_text(text)
        
        # Prepare metadata for each chunk
        metadata_list = []
        for i, chunk in enumerate(chunks):
            metadata = {
                "document_id": document_id,
                "filename": file.filename,
                "chunk_index": i,
                "total_chunks": len(chunks),
                "upload_date": datetime.now().isoformat(),
                "file_size": len(content)
            }
            metadata_list.append(metadata)
        
        # Add to vector store
        chunk_ids = vector_store_service.add_documents(chunks, metadata_list)
        
        return {
            "document_id": document_id,
            "filename": file.filename,
            "chunks_created": len(chunks),
            "chunk_ids": chunk_ids,
            "file_size": len(content)
        }
    
    def _extract_text(self, file_path: Path, filename: str) -> str:
        """
        Extract text from various file formats.
        
        Args:
            file_path: Path to file
            filename: Original filename
        
        Returns:
            Extracted text
        """
        extension = Path(filename).suffix.lower()
        
        if extension == '.pdf':
            return self._extract_from_pdf(file_path)
        elif extension in ['.docx', '.doc']:
            return self._extract_from_docx(file_path)
        elif extension == '.txt':
            return self._extract_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {extension}")
    
    def _extract_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            raise ValueError(f"Error reading PDF: {str(e)}")
        
        return text
    
    def _extract_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX file"""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            raise ValueError(f"Error reading DOCX: {str(e)}")
    
    def _extract_from_txt(self, file_path: Path) -> str:
        """Extract text from TXT file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()
        except Exception as e:
            raise ValueError(f"Error reading TXT: {str(e)}")
    
    def delete_document(self, document_id: str) -> bool:
        """
        Delete a document and its chunks from the system.
        
        Args:
            document_id: Document identifier
        
        Returns:
            True if successful
        """
        # Delete from vector store
        chunks_deleted = vector_store_service.delete_by_document_id(document_id)
        
        # Delete file from disk
        for file in self.upload_dir.glob(f"{document_id}_*"):
            file.unlink()
        
        return chunks_deleted > 0
    
    def get_all_documents(self) -> List[Dict[str, Any]]:
        """
        Get information about all documents.
        
        Returns:
            List of document information
        """
        document_ids = vector_store_service.get_all_document_ids()
        documents = []
        
        for doc_id in document_ids:
            metadata = vector_store_service.get_document_metadata(doc_id)
            if metadata:
                documents.append({
                    "document_id": doc_id,
                    "filename": metadata.get("filename", "Unknown"),
                    "upload_date": metadata.get("upload_date", ""),
                    "chunks_count": metadata.get("total_chunks", 0),
                    "file_size": metadata.get("file_size", 0)
                })
        
        return documents

# Global instance
document_service = DocumentService()
