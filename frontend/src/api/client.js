import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Send httpOnly cookies with every request
});

API.interceptors.request.use((config) => {
  if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject({ ...err, userMessage: message });
  }
);

export const applicationsAPI = {
  submit:       (data)       => API.post('/api/applications', data),
  getAll:       (params)     => API.get('/api/applications', { params }),
  updateStatus: (id, status) => API.patch(`/api/applications/${id}/status`, { status }),
};

export const summaryAPI = {
  get: () => API.get('/api/summary'),
};

export const authAPI = {
  register: (data)             => API.post('/api/auth/register', data),
  login:    (mobile, password) => API.post('/api/auth/login', { mobile, password }),
  logout:   ()                 => API.post('/api/auth/logout'),
  me:       ()                 => API.get('/api/auth/me'),
};

export default API;
