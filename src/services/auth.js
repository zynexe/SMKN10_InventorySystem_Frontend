import api from './api';

export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

export const getAuthToken = () => {
    return localStorage.getItem('token');
};

export const loginUser = async (credentials) => {
  try {
    console.log('Sending login request:', credentials); // Debug log
    const response = await api.post('/login', credentials);
    console.log('Login response:', response.data); // Debug log
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Token not received');
    }
  } catch (error) {
    console.error('Login error details:', error.response || error); // Debug log
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Network error occurred');
  }
};