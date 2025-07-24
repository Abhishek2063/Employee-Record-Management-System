import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }
};

// Time tracking API calls
export const timeAPI = {
  punchIn: async () => {
    try {
      const response = await api.post('/time/punch-in');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Punch in failed' };
    }
  },
  
  punchOut: async () => {
    try {
      const response = await api.post('/time/punch-out');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Punch out failed' };
    }
  },
  
  getTimeRecords: async () => {
    try {
      const response = await api.get('/time/records');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch time records' };
    }
  },
  
  getUserTimeDetails: async (userId) => {
    try {
      const response = await api.get(`/time/user/${userId}/details`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch user time details' };
    }
  },
  
  getCurrentStatus: async () => {
    try {
      const response = await api.get('/time/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch current status' };
    }
  }
};

export default api;
