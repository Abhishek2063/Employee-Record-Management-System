import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized access
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(
      error.response?.data || { message: "Something went wrong" }
    );
  }
);

//
// 🔐 AUTH APIs
//
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    }
  },
};

//
// 👤 USER APIs
//
export const userAPI = {
  getUsers: async (params = {}) => {
    const response = await api.get("/user", { params });
    return response.data;
  },
};

//
// ⏱️ ATTENDANCE APIs
//
export const attendanceAPI = {
  punchIn: async () => {
    const response = await api.post("/attendance/punch-in");
    return response.data;
  },

  punchOut: async () => {
    const response = await api.post("/attendance/punch-out");
    return response.data;
  },

  getMyAttendance: async (params = {}) => {
    const response = await api.get("/attendance/me", { params });
    return response.data;
  },

  getAllAttendance: async (params = {}) => {
    const response = await api.get("/attendance", { params });
    return response.data;
  },

  downloadMyAttendance: async (params = {}) => {
    const response = await api.get("/attendance/download/me", {
      params,
    });
    return response.data;
  },

  downloadAllAttendance: async (params = {}) => {
    const response = await api.get("/attendance/download/all", {
      params,
    });
    return response.data;
  },
};

export default api;
