import api from './api';
import * as auth from './auth';

export const getLokasiList = async () => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.get('/lokasi/index');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createLokasi = async (data) => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.post('/lokasi', { 
      nama_gedung: data.name
    });
    return response.data.lokasi;
  } catch (error) {
    handleApiError(error);
  }
};

export const getLokasi = async (id) => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.get(`/lokasi/${id}/show`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateLokasi = async (id, data) => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.put(`/lokasi/${id}`, {
      nama_gedung: data.name
    });
    return response.data.lokasi;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteLokasi = async (id) => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.delete(`/lokasi/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getTotalLokasi = async () => {
  if (!auth.isAuthenticated()) {
    throw new Error('Please login to access this resource');
  }

  try {
    const response = await api.get('/lokasi/total');
    return response.data.total_lokasi;
  } catch (error) {
    handleApiError(error);
  }
};

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    throw new Error('Please login to access this resource');
  }
  throw error.response?.data || { message: 'An error occurred' };
};