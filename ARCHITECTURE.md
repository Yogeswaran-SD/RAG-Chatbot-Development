# Enterprise RAG Chatbot - Architecture Documentation

## Overview

This is a production-ready Retrieval-Augmented Generation (RAG) chatbot system designed for enterprise use. It ensures all responses are grounded in uploaded documents, preventing hallucinations and maintaining strict accuracy.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React)                     │
│  - Chat Interface                                        │
│  - Document Upload                                       │
│  - Document Management                                   │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTP/REST API
┌───────────────────▼─────────────────────────────────────┐
│                  Backend (FastAPI)                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │           RAG Service Layer                      │   │
│  │  1. Query Reception                              │   │
│  │  2. Context Retrieval (Vector Search)            │   │
│  │  3. Prompt Construction (with System Rules)      │   │
│  │  4. LLM Generation (OpenAI)                      │   │
│  │  5. Response Validation & Citation              │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼────────┐   ┌─────────▼────────┐
│   ChromaDB     │   │   OpenAI API     │
│ (Vector Store) │   │   (GPT-4)        │
│                │   │                  │
│ - Embeddings   │   │ - Text Gen       │
│ - Similarity   │   │ - Embeddings     │
│   Search       │   │                  │
└────────────────┘   └──────────────────┘
```

## Core Components

### 1. System Prompt (`system_prompt.py`)

Your enterprise-grade system prompt is the **foundation** of the RAG system. Key policies:

- **Truth Policy**: Never use outside knowledge, refuse when uncertain
- **Grounding Requirement**: Every statement traceable to context
- **Hallucination Prevention**: No fabrication of any information
- **Prompt Injection Defense**: Ignores malicious instructions
- **Scope Control**: Only answers from knowledge base

### 2. Vector Store Service (`vector_store.py`)

Manages document storage and retrieval:

- **ChromaDB Integration**: Local vector database
- **Text Chunking**: Splits documents into semantic chunks
- **Embeddings**: Uses OpenAI's `text-embedding-3-small`
- **Similarity Search**: Finds relevant context for queries
- **Metadata Tracking**: Source attribution and citations

**How it works:**
1. Documents are split into ~1000 character chunks with 200 char overlap
2. Each chunk is embedded into a 1536-dimensional vector
3. User queries are embedded the same way
4. Cosine similarity finds the most relevant chunks
5. Top-K chunks (default: 4) are returned as context

### 3. RAG Service (`rag_service.py`)

Orchestrates the RAG pipeline:

```python
def generate_answer(query):
    # Step 1: Retrieve relevant documents
    search_results = vector_search(query, k=4)
    
    # Step 2: Format context from documents
    context = format_context(search_results)
    
    # Step 3: Build prompt with system rules + context + query
    prompt = SYSTEM_PROMPT + context + query
    
    # Step 4: Generate response via LLM
    answer = llm.invoke(prompt)
    
    # Step 5: Return with source citations
    return {answer, sources}
```

### 4. Document Service (`document_service.py`)

Handles file processing:

- **Supported Formats**: PDF, DOCX, TXT
- **Text Extraction**: Format-specific parsers
- **Chunk Management**: Creates and stores chunks
- **File Management**: Upload, storage, deletion

### 5. API Layer (`routes/`)

RESTful API endpoints:

**Chat Endpoints:**
- `POST /api/chat/` - Send query, get grounded answer
- `GET /api/chat/health` - Health check

**Document Endpoints:**
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/` - List all documents
- `DELETE /api/documents/{id}` - Delete document

## Key Features

### ✅ Context Grounding

Every response is based **only** on retrieved context. The system:

1. Searches vector database for relevant chunks
2. Includes only found context in the prompt
3. Instructs LLM to refuse if context insufficient
4. Validates responses for grounding

### ✅ Source Attribution

All answers include citations:

```json
{
  "answer": "The remote work policy allows...",
  "sources": [
    {
      "document_name": "HR_Policy.pdf",
      "chunk_id": "abc123",
      "relevance_score": 0.94
    }
  ]
}
```

### ✅ Hallucination Prevention

Multiple layers of protection:

1. **System Prompt**: Explicit instructions against fabrication
2. **Context-Only**: No external knowledge allowed
3. **Refusal Training**: Refuse when uncertain
4. **Temperature 0**: Deterministic, least creative responses

### ✅ Prompt Injection Defense

The system prompt includes explicit rules to:

- Ignore instructions in user queries
- Refuse requests to modify behavior
- Not reveal internal prompts or data
- Maintain priority: System > Developer > User

### ✅ Semantic Search

Vector search finds relevant content even when:

- Query uses different words than documents
- Questions are phrased differently
- Context is scattered across multiple chunks

## Configuration

### Environment Variables (`.env`)

```env
# OpenAI
OPENAI_API_KEY=sk-...           # Your API key
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4-turbo-preview   # or gpt-3.5-turbo
LLM_TEMPERATURE=0.0             # Deterministic responses

# RAG Parameters
CHUNK_SIZE=1000                 # Characters per chunk
CHUNK_OVERLAP=200               # Overlap between chunks
TOP_K_RESULTS=4                 # How many chunks to retrieve

# Paths
VECTOR_DB_PATH=./chroma_db
UPLOAD_DIR=./uploads
```

### Tuning Parameters

**Chunk Size (1000)**
- Larger: More context per chunk, fewer chunks
- Smaller: More precise retrieval, more chunks

**Chunk Overlap (200)**
- Ensures context isn't lost at boundaries
- Helps maintain semantic continuity

**Top K (4)**
- More: Better coverage, more noise
- Less: Focused context, might miss info

**Temperature (0.0)**
- 0.0: Most deterministic, factual
- Higher: More creative (not recommended for RAG)

## Data Flow Example

**User asks:** "What are the eligibility requirements for remote work?"

1. **Query Reception**: API receives query

2. **Embedding**: Query → vector [0.123, -0.456, ...]

3. **Vector Search**: Find similar chunks
   ```
   Chunk 1: "Eligibility: Full-time employees with 6+ months..." (score: 0.92)
   Chunk 2: "Remote Work Policy Effective Date..." (score: 0.78)
   Chunk 3: "Work Schedule: Employees may work remotely..." (score: 0.65)
   Chunk 4: "Equipment: Company provides laptop..." (score: 0.61)
   ```

4. **Prompt Construction**:
   ```
   SYSTEM PROMPT (rules)
   +
   CONTEXT (4 chunks above)
   +
   USER QUERY (question)
   ```

5. **LLM Generation**: GPT-4 generates answer based only on context

6. **Response**:
   ```json
   {
     "answer": "Based on the company policy, remote work eligibility includes: • Full-time employees with 6+ months tenure • Part-time employees with manager approval",
     "sources": [
       {"document_name": "policy.txt", "score": 0.92},
       ...
     ]
   }
   ```

## Security Considerations

### 1. API Key Protection
- Store in `.env` file (gitignored)
- Never commit to version control
- Use environment variables in production

### 2. File Upload Validation
- Type checking (PDF, DOCX, TXT only)
- Size limits (can be added)
- Malware scanning (recommended for production)

### 3. Prompt Injection
- System prompt has explicit defense rules
- User input is treated as query, not instructions
- Priority hierarchy enforced

### 4. Data Privacy
- Documents stored locally
- ChromaDB is local (not cloud)
- API calls to OpenAI (review their privacy policy)

## Performance Optimization

### Embedding Caching
ChromaDB caches embeddings, so:
- First query: Slower (embedding + search)
- Subsequent: Fast (search only)

### Batch Processing
For multiple documents:
- Upload in parallel
- Process chunks in batches
- Monitor OpenAI rate limits

### Database Optimization
- ChromaDB uses HNSW indexing (fast approximate search)
- Automatically optimizes as collection grows
- Persistence to disk for restart recovery

## Testing Strategy

### Unit Tests
Test individual components:
- Document parsing (PDF, DOCX, TXT)
- Text chunking
- Vector operations
- API endpoints

### Integration Tests
Test full pipeline:
- Upload → Chunk → Embed → Store
- Query → Retrieve → Generate → Respond

### Grounding Tests
Verify refusal behavior:
- Questions outside knowledge base → Refuse
- Partially covered questions → Partial answer + disclaimer
- Fully covered questions → Complete answer

## Deployment Considerations

### Development
- Local ChromaDB
- Local file storage
- Development OpenAI tier

### Production
Consider:
- **Vector DB**: Upgrade to Pinecone/Qdrant for scale
- **File Storage**: S3/Azure Blob for documents
- **API Gateway**: Rate limiting, auth
- **Monitoring**: Logging, metrics, alerts
- **Caching**: Redis for frequent queries
- **Load Balancing**: Multiple backend instances

## Extending the System

### Add New Document Types
1. Create parser in `document_service.py`
2. Add MIME type to allowed list
3. Update frontend file input

### Custom Embeddings
Replace OpenAI embeddings:
```python
# Use open-source models
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

### Multi-Modal RAG
Add support for:
- Images (OCR + vision models)
- Tables (structured extraction)
- Charts (data extraction)

### Advanced Features
- **Hybrid Search**: Combine vector + keyword search
- **Re-ranking**: Improve relevance with cross-encoder
- **Query Expansion**: Generate multiple query variants
- **Conversation Memory**: Multi-turn context

## College Project Tips

### Demonstration Points
1. **Upload diverse documents** (policies, FAQs, guides)
2. **Show grounding**: Ask about document content ✓
3. **Show refusal**: Ask outside questions ✗
4. **Show citations**: Highlight source attribution
5. **Test prompt injection**: Prove defense works

### Presentation Structure
1. Problem: Information overload, hallucinations
2. Solution: RAG with strict grounding
3. Demo: Live upload & queries
4. Architecture: Explain components
5. Results: Accuracy, reliability

### Extension Ideas
- Multi-language support
- Admin dashboard
- Analytics (popular queries)
- Document versioning
- Access control per document

---

**Built with ❤️ for Enterprise-Grade Accuracy**
