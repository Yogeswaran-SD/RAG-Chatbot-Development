# Quick Start Guide

## Prerequisites

Before starting, ensure you have:

- **Python 3.9+** installed
- **Node.js 18+** and npm installed
- **OpenAI API Key** (get from https://platform.openai.com/api-keys)

## Step-by-Step Setup

### 1. Set Up Backend

Open a terminal and navigate to the backend directory:

```powershell
cd d:\RAG-Chatbot\backend
```

Create a Python virtual environment:

```powershell
python -m venv venv
```

Activate the virtual environment:

```powershell
.\venv\Scripts\activate
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Create `.env` file from template:

```powershell
copy .env.example .env
```

Edit the `.env` file and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Start the backend server:

```powershell
uvicorn app.main:app --reload
```

The backend will run at: **http://localhost:8000**

API docs available at: **http://localhost:8000/api/docs**

---

### 2. Set Up Frontend

Open a **NEW** terminal and navigate to the frontend directory:

```powershell
cd d:\RAG-Chatbot\frontend
```

Install dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

The frontend will run at: **http://localhost:5173**

---

## Using the Application

### 1. Upload Documents

- Click the **"Upload"** tab
- Drag and drop or select a PDF, DOCX, or TXT file
- Wait for processing to complete

### 2. Ask Questions

- Go to the **"Chat"** tab
- Type your question about the uploaded documents
- The AI will provide grounded answers with source citations

### 3. Manage Documents

- Click the **"Documents"** tab to view all uploaded files
- Delete documents if needed

---

## Testing the System

### Test with Sample Document

Create a test file `test.txt` with the following content:

```
Company Policy: Remote Work

Effective Date: January 1, 2024

Eligibility:
- Full-time employees with 6+ months tenure
- Part-time employees with manager approval

Work Schedule:
- Employees may work remotely up to 3 days per week
- Core hours: 10 AM - 3 PM (must be available)

Equipment:
- Company provides laptop and monitor
- Home internet minimum: 25 Mbps

Security Requirements:
- Use VPN for all company systems
- Encrypt all sensitive files
- Lock screen when away from desk
```

Upload this file and try asking:

- "What are the remote work eligibility requirements?"
- "How many days per week can I work remotely?"
- "What equipment does the company provide?"
- "Tell me about the company's vacation policy" (should refuse - not in document)

---

## Troubleshooting

### Backend Issues

**Error: ModuleNotFoundError**
- Make sure you activated the virtual environment
- Run `pip install -r requirements.txt` again

**Error: OpenAI Authentication**
- Check that your API key is correct in `.env`
- Verify your OpenAI account has credits

**Error: Port 8000 already in use**
- Change the port in `.env`: `BACKEND_PORT=8001`
- Update frontend API URL in `frontend/src/api.js`

### Frontend Issues

**Error: ECONNREFUSED**
- Make sure the backend is running first
- Check that backend is on port 8000

**Blank page**
- Open browser console (F12) for errors
- Try `npm install` again
- Clear browser cache

---

## Project Structure

```
RAG-Chatbot/
├── backend/           # Python FastAPI backend
│   ├── app/
│   │   ├── main.py           # Application entry point
│   │   ├── config.py         # Configuration
│   │   ├── system_prompt.py  # Your enterprise prompt
│   │   ├── models.py         # Data models
│   │   ├── services/         # Business logic
│   │   └── routes/           # API endpoints
│   ├── uploads/              # Uploaded files
│   ├── chroma_db/           # Vector database
│   └── requirements.txt
│
└── frontend/          # React frontend
    ├── src/
    │   ├── components/       # React components
    │   ├── App.jsx          # Main app
    │   └── api.js           # API client
    └── package.json
```

---

## Next Steps

1. **Customize**: Modify the system prompt in `backend/app/system_prompt.py`
2. **Deploy**: See deployment guides for production hosting
3. **Extend**: Add more document types or features
4. **Test**: Upload your own documents and test the system

---

## Support

For issues or questions:

- Check the API docs: http://localhost:8000/api/docs
- Review logs in the terminal
- Verify all environment variables are set correctly

**Happy Building! 🚀**
