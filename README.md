# Enterprise RAG Chatbot

A production-ready Retrieval-Augmented Generation (RAG) chatbot system for answering questions based on your document knowledge base.

## Features

- 📄 **Document Upload & Processing**: Upload PDFs, DOCX, TXT files
- 🔍 **Semantic Search**: Find relevant context using vector embeddings
- 🤖 **Context-Grounded Responses**: AI answers only from your documents
- 🛡️ **Hallucination Prevention**: Strict grounding policy
- 🚫 **Prompt Injection Defense**: Protected against malicious inputs
- 📊 **Source Citations**: Traceable responses with document references

## Tech Stack

- **Backend**: Python, FastAPI, LangChain
- **Vector Database**: ChromaDB
- **LLM**: OpenAI GPT (configurable)
- **Frontend**: React, Vite, Tailwind CSS
- **Document Processing**: PyPDF2, python-docx, sentence-transformers

## Project Structure

```
RAG-Chatbot/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration
│   │   ├── system_prompt.py     # RAG assistant system prompt
│   │   ├── models.py            # Pydantic models
│   │   ├── services/
│   │   │   ├── document_service.py    # Document processing
│   │   │   ├── vector_store.py        # ChromaDB operations
│   │   │   └── rag_service.py         # RAG logic
│   │   └── routes/
│   │       ├── chat.py          # Chat endpoints
│   │       └── documents.py     # Document endpoints
│   ├── uploads/                 # Uploaded documents
│   ├── chroma_db/              # Vector database storage
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- OpenAI API Key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
venv\Scripts\activate  # Windows
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
OPENAI_API_KEY=your_api_key_here
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4-turbo-preview
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
```

5. Run backend:
```bash
uvicorn app.main:app --reload
```

Backend runs at: `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run frontend:
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Usage

1. **Upload Documents**: Use the upload interface to add your knowledge base documents
2. **Ask Questions**: Type questions in the chat interface
3. **Get Grounded Answers**: Receive accurate, source-cited responses

## System Prompt Policy

This RAG system follows strict enterprise policies:
- ✅ Answers only from provided documents
- ✅ No external knowledge or speculation
- ✅ Explicit refusal when information is unavailable
- ✅ Prompt injection protection
- ✅ Traceable, auditable responses

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List all documents
- `DELETE /api/documents/{id}` - Delete document

### Chat
- `POST /api/chat` - Send chat message
- `GET /api/chat/history` - Get chat history

## Development

### Running Tests
```bash
cd backend
pytest
```

### Building for Production
```bash
cd frontend
npm run build
```

## License

MIT License - Created for College Project

## Author

Created for Educational Purposes
