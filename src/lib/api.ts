// Backend API configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://final-year-project-9dgu.onrender.com/api';

// Create axios instance with default config
import axios from 'axios';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        console.log(`[API] Making ${config.method?.toUpperCase()} request to ${config.url}`);
        console.log('[API] Token present:', !!token);
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('[API] No auth token found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        console.log(`[API] Success response from ${response.config.url}:`, {
            status: response.status,
            dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        });
        return response;
    },
    (error) => {
        console.error('[API] Response error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 401) {
            console.warn('[API] Unauthorized access - redirecting to login');
            localStorage.removeItem('auth_token'); // Clear invalid token
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;