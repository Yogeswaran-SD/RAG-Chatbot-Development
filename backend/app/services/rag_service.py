from typing import Dict, Any, List
from langchain_openai import ChatOpenAI
from app.config import settings
from app.services.vector_store import vector_store_service
from app.system_prompt import format_context_prompt
import uuid

class RAGService:
    """Service for RAG (Retrieval-Augmented Generation) operations"""
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.llm_model,
            temperature=settings.llm_temperature,
            openai_api_key=settings.openai_api_key
        )
    
    def generate_answer(self, query: str) -> Dict[str, Any]:
        """
        Generate an answer to a query using RAG.
        
        Args:
            query: User's question
        
        Returns:
            Dictionary containing answer and sources
        """
        # Step 1: Retrieve relevant documents
        search_results = vector_store_service.similarity_search(
            query, 
            k=settings.top_k_results
        )
        
        # Check if any documents were found
        if not search_results:
            return {
                "answer": "I don't have enough information in the provided documents.",
                "sources": [],
                "context_found": False
            }
        
        # Step 2: Format context from retrieved documents
        context = self._format_context(search_results)
        
        # Step 3: Generate prompt with system instructions
        prompt = format_context_prompt(context, query)
        
        # Step 4: Get LLM response
        response = self.llm.invoke(prompt)
        answer = response.content
        
        # Step 5: Format sources
        sources = self._format_sources(search_results)
        
        return {
            "answer": answer,
            "sources": sources,
            "context_found": True,
            "conversation_id": str(uuid.uuid4())
        }
    
    def _format_context(self, search_results: List[Dict[str, Any]]) -> str:
        """
        Format search results into context string.
        
        Args:
            search_results: List of retrieved documents
        
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, result in enumerate(search_results, 1):
            metadata = result['metadata']
            content = result['content']
            
            context_part = f"""
Document {i}: {metadata.get('filename', 'Unknown')}
(Chunk {metadata.get('chunk_index', 0) + 1} of {metadata.get('total_chunks', 1)})
Relevance Score: {1 - result['score']:.2f}

Content:
{content}
---
"""
            context_parts.append(context_part)
        
        return "\n".join(context_parts)
    
    def _format_sources(self, search_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Format search results into source citations.
        
        Args:
            search_results: List of retrieved documents
        
        Returns:
            List of source dictionaries
        """
        sources = []
        
        for result in search_results:
            metadata = result['metadata']
            
            source = {
                "document_name": metadata.get('filename', 'Unknown'),
                "page": None,  # Could be extracted if PDF has page info
                "chunk_id": metadata.get('document_id', ''),
                "relevance_score": float(1 - result['score'])  # Convert distance to similarity
            }
            sources.append(source)
        
        return sources
    
    def validate_answer_grounding(self, answer: str, context: str) -> bool:
        """
        Validate that the answer is grounded in the context.
        This is a placeholder for more sophisticated validation.
        
        Args:
            answer: Generated answer
            context: Retrieved context
        
        Returns:
            True if answer appears grounded
        """
        # Basic validation: check for common refusal phrases
        refusal_phrases = [
            "I don't have enough information",
            "I am designed to answer questions only from the provided knowledge base",
            "cannot be found in the documents",
            "not available in the provided context"
        ]
        
        # If answer contains refusal, it's properly refusing
        for phrase in refusal_phrases:
            if phrase.lower() in answer.lower():
                return True
        
        # Otherwise, assume grounded (more sophisticated checking could be added)
        return True

# Global instance
rag_service = RAGService()
