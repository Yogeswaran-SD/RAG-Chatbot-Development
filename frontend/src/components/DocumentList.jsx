import React, { useState, useEffect } from 'react';
import { FileText, Trash2, Calendar, Layers, Loader } from 'lucide-react';
import { documentsAPI } from '../api';

const DocumentList = ({ refreshTrigger }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentsAPI.list();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId, filename) => {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      setDeleting(documentId);
      await documentsAPI.delete(documentId);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">No documents uploaded yet</p>
        <p className="text-sm text-slate-500 mt-1">
          Upload documents to start asking questions
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.document_id}
          className="glass rounded-xl p-4 card-hover group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 bg-primary/20 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-200 truncate">
                  {doc.filename}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(doc.upload_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>{doc.chunks_count} chunks</span>
                  </div>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(doc.document_id, doc.filename)}
              disabled={deleting === doc.document_id}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
            >
              {deleting === doc.document_id ? (
                <Loader className="w-4 h-4 text-red-400 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-red-400" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentList;
