import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for CORS
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/login', credentials);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('Network error occurred');
  }
};

export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('token');
        await api.post('/logout', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        // Clear all auth related data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        throw error.response?.data || { message: 'Logout failed' };
    }
};

export default api;