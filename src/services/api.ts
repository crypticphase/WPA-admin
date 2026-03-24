import axios from 'axios';

const DEFAULT_BASE_URL = 'https://wpadocker-production.up.railway.app/api/v1';

const api = axios.create();

api.interceptors.request.use((config) => {
  const customBaseUrl = localStorage.getItem('custom_base_url');
  config.baseURL = customBaseUrl || DEFAULT_BASE_URL;
  
  const adminToken = localStorage.getItem('admin_token');
  const delegateToken = localStorage.getItem('delegate_token');

  // If it's an admin route, use X-Admin-Token
  if (config.url?.includes('/admin/') && adminToken) {
    config.headers['X-Admin-Token'] = adminToken;
  } 
  // Otherwise, if it's a regular API route and we have a delegate token, use Bearer
  else if (delegateToken) {
    config.headers['Authorization'] = `Bearer ${delegateToken}`;
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
