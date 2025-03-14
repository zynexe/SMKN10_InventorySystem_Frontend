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

// Asset API functions
export const getAssets = async () => {
  try {
    console.log('Fetching assets from API...');
    const response = await api.get('/aset');
    console.log('API response:', response);
    return response.data;
  } catch (error) {
    console.error('Error fetching assets:', error.response?.data || error.message);
    throw error;
  }
};

export const addAsset = async (assetData) => {
  try {
    const response = await api.post('/aset', assetData);
    return response.data;
  } catch (error) {
    console.error('Error adding asset:', error);
    throw error;
  }
};

export const updateAsset = async (id, assetData) => {
  try {
    const response = await api.put(`/aset/${id}`, assetData);
    return response.data;
  } catch (error) {
    console.error('Error updating asset:', error);
    throw error;
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await api.delete(`/aset/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting asset:', error);
    throw error;
  }
};

// Kode Barang API functions
export const getKodeBarangs = async () => {
  try {
    const response = await api.get('/kode-barang/index');
    return response.data;
  } catch (error) {
    console.error('Error fetching kode barang:', error.response?.data || error.message);
    throw error;
  }
};

export const getKodeBarangById = async (id) => {
  try {
    const response = await api.get(`/kode-barang/${id}/show`);
    return response.data;
  } catch (error) {
    console.error('Error fetching kode barang details:', error.response?.data || error.message);
    throw error;
  }
};

export const getTotalKodeBarang = async () => {
  try {
    const response = await api.get('/kode-barang/total');
    return response.data;
  } catch (error) {
    console.error('Error fetching total kode barang:', error.response?.data || error.message);
    throw error;
  }
};

// Add this function to help with debugging
const logApiError = (error, context) => {
  console.group(`API Error: ${context}`);
  console.error('Status:', error.response?.status);
  console.error('Headers:', error.response?.headers);
  console.error('Data:', error.response?.data);
  console.error('Error instance:', error);
  console.groupEnd();
};

export const addKodeBarang = async (kodeBarangData) => {
  try {
    // Use the correct field name 'uraian' instead of 'nama'
    const payload = {
      kode: kodeBarangData.kode,
      uraian: kodeBarangData.uraian // Changed from 'nama' to 'uraian'
    };
    
    const response = await api.post('/kode-barang', payload);
    return response.data;
  } catch (error) {
    logApiError(error, 'Adding kode barang');
    throw error;
  }
};

export const updateKodeBarang = async (id, kodeBarangData) => {
  try {
    // Use the correct field name 'uraian' instead of 'nama'
    const payload = {
      kode: kodeBarangData.kode,
      uraian: kodeBarangData.uraian // Changed from 'nama' to 'uraian'
    };
    
    const response = await api.put(`/kode-barang/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating kode barang:', error);
    throw error;
  }
};

export const deleteKodeBarang = async (id) => {
  try {
    const response = await api.delete(`/kode-barang/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting kode barang:', error.response?.data || error.message);
    throw error;
  }
};

export const importKodeBarang = async (file) => {
  try {
    const formData = new FormData();
    // Change the field name from 'file' to 'xlsx_file' as required by the backend
    formData.append('xlsx_file', file);
    
    const response = await api.post('/kode-barang/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing kode barang:', error.response?.data || error.message);
    throw error;
  }
};

export default api;
