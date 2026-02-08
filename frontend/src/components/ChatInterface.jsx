import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader, User, Bot, FileText } from 'lucide-react';
import { chatAPI } from '../api';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(input, conversationId);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (response.conversation_id) {
        setConversationId(response.conversation_id);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
        error: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="p-4 bg-primary/20 rounded-full mb-4">
              <Bot className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-2">
              Enterprise RAG Assistant
            </h2>
            <p className="text-slate-400 max-w-md">
              Ask questions about your documents. I'll provide accurate, grounded
              answers based only on the uploaded knowledge base.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 animate-fadeIn ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'assistant' && (
              <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <Bot className="w-5 h-5 text-primary" />
              </div>
            )}

            <div
              className={`max-w-2xl ${
                message.role === 'user'
                  ? 'glass rounded-2xl rounded-tr-sm p-4'
                  : 'space-y-3'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-slate-200">{message.content}</p>
              ) : (
                <>
                  <div className="glass rounded-2xl rounded-tl-sm p-4">
                    <p
                      className={`text-slate-200 whitespace-pre-wrap markdown-content ${
                        message.error ? 'text-red-400' : ''
                      }`}
                    >
                      {message.content}
                    </p>
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="glass rounded-xl p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-slate-300">
                          Sources
                        </span>
                      </div>
                      <div className="space-y-2">
                        {message.sources.map((source, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-slate-400 flex items-center justify-between"
                          >
                            <span className="truncate">{source.document_name}</span>
                            <span className="text-primary font-medium ml-2">
                              {(source.relevance_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {message.role === 'user' && (
              <div className="p-2 bg-slate-700 rounded-lg flex-shrink-0">
                <User className="w-5 h-5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3 animate-fadeIn">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="glass rounded-2xl rounded-tl-sm p-4">
              <div className="flex items-center space-x-2 text-slate-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-2 flex items-end space-x-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your documents..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-slate-200 placeholder-slate-500 px-3 py-2 max-h-32"
              rows="1"
              style={{
                minHeight: '40px',
                maxHeight: '128px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="btn-primary p-3 bg-primary hover:bg-primary/90 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl transition-all"
            >
              {loading ? (
                <Loader className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Answers are based only on uploaded documents
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
