import React, { useState } from 'react';
import { MessageSquare, Upload as UploadIcon, FileText } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import DocumentUpload from './components/DocumentUpload';
import DocumentList from './components/DocumentList';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [refreshDocuments, setRefreshDocuments] = useState(0);

  const handleUploadComplete = () => {
    setRefreshDocuments((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                Enterprise RAG Chatbot
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Context-grounded AI assistant
              </p>
            </div>
            <div className="flex items-center space-x-2 glass rounded-xl p-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center space-x-2 ${
                  activeTab === 'chat'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center space-x-2 ${
                  activeTab === 'upload'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UploadIcon className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-4 py-2 rounded-lg transition-all font-medium flex items-center space-x-2 ${
                  activeTab === 'documents'
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-6 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full glass rounded-2xl overflow-hidden">
            <ChatInterface />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-200 mb-2">
                Upload Documents
              </h2>
              <p className="text-slate-400">
                Add documents to your knowledge base for the AI to reference
              </p>
            </div>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-200 mb-2">
                Knowledge Base
              </h2>
              <p className="text-slate-400">
                Manage your uploaded documents
              </p>
            </div>
            <DocumentList refreshTrigger={refreshDocuments} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 glass py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            Enterprise RAG Chatbot • Powered by OpenAI & ChromaDB
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Answers are grounded in uploaded documents only
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
