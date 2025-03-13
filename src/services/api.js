import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (username, password) => {
  try {
    const response = await api.post('/login', { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed';
  }
};

export const logout = async () => {
  try {
      await api.post('/logout');
  } catch (error) {
      console.error('Logout failed:', error.response ? error.response.data : error);
  } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
  }
};

export const getGedungs = async () => {
  try {
    const response = await api.get('/lokasi/index');
    return response.data;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
};

export const addGedung = async (formData) => {
  try {
    const response = await api.post('/lokasi', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding building:', error);
    throw error;
  }
};

export const updateGedung = async (id, formData) => {
  try {
    formData.append('_method', 'PUT');

    const response = await api.post(`/lokasi/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating building:', error.response?.data || error);
    throw error;
  }
};


export const deleteGedung = async (id) => {
  try {
    await api.delete(`/lokasi/${id}`);
  } catch (error) {
    console.error('Error deleting building:', error);
    throw error;
  }
};

export default api;
