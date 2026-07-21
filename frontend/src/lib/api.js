import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't tried to refresh yet
    if (error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - DON'T redirect here, let the component handle it
        // Just reject the promise and clear tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        // Trigger a page reload to re-initialize auth state
        window.dispatchEvent(new Event('auth:logout'));
      }
    }

    // Don't auto-redirect to login - let components handle their own auth errors
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (data) => api.post('/auth/change-password', data),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// User/Petugas API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, data) => api.put(`/users/${id}/password`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Barang API
export const barangAPI = {
  getAll: (params) => api.get('/barang', { params }),
  getById: (id) => api.get(`/barang/${id}`),
  create: (data) => api.post('/barang', data),
  update: (id, data) => api.put(`/barang/${id}`, data),
  delete: (id) => api.delete(`/barang/${id}`),
  getByKRL: (params) => api.get('/barang/krl', { params }),
  getByKA: (params) => api.get('/barang/kai', { params }),
  search: (params) => api.get('/barang/search', { params }),
  updateStatus: (id, status) => api.put(`/barang/${id}/status`, { status }),
};

// Klaim API
export const klaimAPI = {
  getAll: (params) => api.get('/klaim', { params }),
  getById: (id) => api.get(`/klaim/${id}`),
  create: (data) => api.post('/klaim', data),
  getMy: () => api.get('/klaim/my'),
  verify: (id, data) => api.put(`/klaim/${id}/verify`, data),
  reject: (id, data) => api.put(`/klaim/${id}/reject`, data),
  confirm: (id, data) => api.post(`/klaim/${id}/confirm`, data),
};

// Kategori API
export const kategoriAPI = {
  getAll: () => api.get('/kategori'),
  create: (data) => api.post('/kategori', data),
  update: (id, data) => api.put(`/kategori/${id}`, data),
  delete: (id) => api.delete(`/kategori/${id}`),
};

// Stations API
export const stationsAPI = {
  getAll: () => api.get('/stations'),
  getById: (id) => api.get(`/stations/${id}`),
};

// Upload API
export const uploadAPI = {
  uploadFoto: (formData) =>
    api.post('/upload/foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteFoto: (id) => api.delete(`/upload/foto/${id}`),
};

// Stats API
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getBarang: () => api.get('/stats/barang'),
  getKlaim: () => api.get('/stats/klaim'),
  export: (params) => api.get('/stats/export', { params }),
};

// Notifikasi API
export const notifikasiAPI = {
  getAll: () => api.get('/notifikasi'),
  markRead: (id) => api.put(`/notifikasi/${id}/read`),
  markAllRead: () => api.put('/notifikasi/read-all'),
  delete: (id) => api.delete(`/notifikasi/${id}`),
};

// QR Code API
export const qrAPI = {
  generate: (barangId) => api.get(`/qr/${barangId}`),
};

// Audit Log API
export const auditLogAPI = {
  getAll: (params) => api.get('/notifikasi/audit-log', { params }),
};

export default api;
