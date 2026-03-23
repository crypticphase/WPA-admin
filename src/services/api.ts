import axios from 'axios';

const DEFAULT_BASE_URL = 'https://wpadocker-production.up.railway.app/api/v1';

const api = axios.create();

api.interceptors.request.use((config) => {
  const customBaseUrl = localStorage.getItem('custom_base_url');
  config.baseURL = customBaseUrl || DEFAULT_BASE_URL;
  
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers['X-Admin-Token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
