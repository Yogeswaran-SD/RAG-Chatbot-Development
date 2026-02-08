import React, { useState } from 'react';
import { Upload, X, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { documentsAPI } from '../api';

const DocumentUpload = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Only PDF, DOCX, and TXT files are supported',
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus(null);

    try {
      const result = await documentsAPI.upload(selectedFile, setUploadProgress);
      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${result.filename}. Created ${result.chunks_created} chunks.`,
      });
      setSelectedFile(null);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.detail || 'Upload failed',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`glass rounded-2xl p-8 border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-slate-600 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/20 rounded-full">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-200">
              Drop your document here
            </p>
            <p className="text-sm text-slate-400 mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Supports PDF, DOCX, TXT files
            </p>
          </div>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileInput}
          />
          <label
            htmlFor="fileInput"
            className="btn-primary px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg cursor-pointer transition-all"
          >
            Browse Files
          </label>
        </div>
      </div>

      {/* Selected File */}
      {selectedFile && (
        <div className="glass rounded-xl p-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-200">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {uploading && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="gradient-bg h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!uploading && (
            <button
              onClick={handleUpload}
              className="mt-3 w-full btn-primary py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium"
            >
              Upload Document
            </button>
          )}
        </div>
      )}

      {/* Upload Status */}
      {uploadStatus && (
        <div
          className={`glass rounded-xl p-4 flex items-start space-x-3 animate-fadeIn ${
            uploadStatus.type === 'success'
              ? 'border border-green-500/30'
              : 'border border-red-500/30'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm text-slate-200">{uploadStatus.message}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
