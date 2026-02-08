import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import List, Dict, Any
import uuid
from app.config import settings

class VectorStoreService:
    """Service for managing ChromaDB vector store operations"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key
        )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path=settings.vector_db_path,
            settings=ChromaSettings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize or get collection
        self.collection_name = "documents"
        
        # Initialize LangChain Chroma wrapper
        self.vectorstore = Chroma(
            client=self.client,
            collection_name=self.collection_name,
            embedding_function=self.embeddings
        )
    
    def add_documents(self, texts: List[str], metadata: List[Dict[str, Any]]) -> List[str]:
        """
        Add documents to the vector store.
        
        Args:
            texts: List of text chunks
            metadata: List of metadata dicts for each chunk
        
        Returns:
            List of document IDs
        """
        # Generate unique IDs for each chunk
        ids = [str(uuid.uuid4()) for _ in texts]
        
        # Add documents to vectorstore
        self.vectorstore.add_texts(
            texts=texts,
            metadatas=metadata,
            ids=ids
        )
        
        return ids
    
    def similarity_search(self, query: str, k: int = None) -> List[Dict[str, Any]]:
        """
        Perform similarity search for relevant documents.
        
        Args:
            query: Search query
            k: Number of results to return
        
        Returns:
            List of documents with metadata and scores
        """
        if k is None:
            k = settings.top_k_results
        
        # Perform similarity search with scores
        results = self.vectorstore.similarity_search_with_score(query, k=k)
        
        # Format results
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": float(score)
            })
        
        return formatted_results
    
    def delete_by_document_id(self, document_id: str) -> int:
        """
        Delete all chunks associated with a document.
        
        Args:
            document_id: Document identifier
        
        Returns:
            Number of chunks deleted
        """
        collection = self.client.get_collection(self.collection_name)
        
        # Get all documents with this document_id
        results = collection.get(
            where={"document_id": document_id}
        )
        
        if results and results['ids']:
            # Delete all matching chunks
            collection.delete(ids=results['ids'])
            return len(results['ids'])
        
        return 0
    
    def get_all_document_ids(self) -> List[str]:
        """
        Get all unique document IDs in the vector store.
        
        Returns:
            List of document IDs
        """
        collection = self.client.get_collection(self.collection_name)
        
        # Get all metadata
        all_data = collection.get()
        
        if not all_data or not all_data['metadatas']:
            return []
        
        # Extract unique document IDs
        document_ids = set()
        for metadata in all_data['metadatas']:
            if 'document_id' in metadata:
                document_ids.add(metadata['document_id'])
        
        return list(document_ids)
    
    def get_document_metadata(self, document_id: str) -> Dict[str, Any]:
        """
        Get metadata for a specific document.
        
        Args:
            document_id: Document identifier
        
        Returns:
            Document metadata
        """
        collection = self.client.get_collection(self.collection_name)
        
        results = collection.get(
            where={"document_id": document_id},
            limit=1
        )
        
        if results and results['metadatas']:
            return results['metadatas'][0]
        
        return {}
    
    def split_text(self, text: str) -> List[str]:
        """
        Split text into chunks.
        
        Args:
            text: Text to split
        
        Returns:
            List of text chunks
        """
        return self.text_splitter.split_text(text)

# Global instance
vector_store_service = VectorStoreService()
