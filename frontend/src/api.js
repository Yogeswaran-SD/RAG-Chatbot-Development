import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatAPI = {
    sendMessage: async (query, conversationId = null) => {
        const response = await api.post('/api/chat/', {
            query,
            conversation_id: conversationId,
        });
        return response.data;
    },
};

export const documentsAPI = {
    upload: async (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/api/documents/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                if (onProgress) onProgress(progress);
            },
        });
        return response.data;
    },

    list: async () => {
        const response = await api.get('/api/documents/');
        return response.data;
    },

    delete: async (documentId) => {
        const response = await api.delete(`/api/documents/${documentId}`);
        return response.data;
    },
};

export default api;
