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

// AssetPage API functions
export const getAssets = async () => {
  try {
    console.log('Making API request to fetch assets');
    const response = await api.get('/aset/index');
    console.log('API response received:', response.data);
    return response.data; // Return just the data portion, not the whole response
  } catch (error) {
    console.error('Error in getAssets API call:', error);
    throw error;
  }
};

export const addAsset = async (assetData) => {
  try {
    console.log('Sending asset data to API:', assetData);
    
    const response = await api.post('/aset', assetData);
    console.log('API response for add asset:', response);
    return response.data;
  } catch (error) {
    console.error('Error adding asset:', error);
    console.error('Request payload:', assetData);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
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

export const getAssetDetails = async (id) => {
  try {
    const response = await api.get(`/aset/${id}/show`);
    return response.data;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    throw error;
  }
};

export const getTotalAssets = async () => {
  try {
    const response = await api.get('/aset/total');
    return response.data;
  } catch (error) {
    console.error('Error fetching total assets:', error);
    throw error;
  }
};

export const getTotalPriceByYear = async (year) => {
  try {
    const response = await api.get(`/aset/total-price-by-year/${year}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching total price for year ${year}:`, error);
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

// Update the deleteAllKodeBarang function with the correct endpoint
export const deleteAllKodeBarang = async () => {
  try {
    const response = await api.delete('/kode-barang/destroy-all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all kode barang:', error.response?.data || error.message);
    throw error;
  }
};

// Add deleteAllKodeRekening function
export const deleteAllKodeRekening = async () => {
  try {
    const response = await api.delete('/kode-rekening/destroy-all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all kode rekening:', error.response?.data || error.message);
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

// Kode Rekening API functions
export const getKodeRekenings = async () => {
  try {
    const response = await api.get('/kode-rekening/index');
    return response.data;
  } catch (error) {
    console.error('Error fetching kode rekening:', error.response?.data || error.message);
    throw error;
  }
};

export const addKodeRekening = async (kodeRekeningData) => {
  try {
    const payload = {
      kode: kodeRekeningData.kode,
      uraian: kodeRekeningData.uraian
    };
    
    const response = await api.post('/kode-rekening', payload);
    return response.data;
  } catch (error) {
    logApiError(error, 'Adding kode rekening');
    throw error;
  }
};

export const updateKodeRekening = async (id, kodeRekeningData) => {
  try {
    const payload = {
      kode: kodeRekeningData.kode,
      uraian: kodeRekeningData.uraian
    };
    
    const response = await api.put(`/kode-rekening/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating kode rekening:', error);
    throw error;
  }
};

export const deleteKodeRekening = async (id) => {
  try {
    const response = await api.delete(`/kode-rekening/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting kode rekening:', error.response?.data || error.message);
    throw error;
  }
};

export const importKodeRekening = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file); // Changed from 'xlsx_file' to 'file'
    
    const response = await api.post('/kode-rekening/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing kode rekening:', error.response?.data || error.message);
    throw error;
  }
};

export default api;

// BHP API functions
export const getBHPs = async () => {
  try {
    console.log('Fetching BHP items...');
    const response = await api.get('/bhp/index');
    
    console.log('BHP API Response:', response);
    
    let bhpItems = [];
    
    // Process data to normalize fields
    if (response.data && Array.isArray(response.data)) {
      bhpItems = response.data.map(item => ({
        ...item,
        // Use Volume field if available for stock_awal 
        stock_awal: item.Volume || item.volume || item.initial_volume || 0,
        // Make stock_akhir match stock_awal initially unless explicitly set
        stock_akhir: item.total_volume || item.Volume || item.volume || item.initial_volume || 0,
      }));
    } else if (Array.isArray(response)) {
      bhpItems = response.map(item => ({
        ...item,
        stock_awal: item.Volume || item.volume || item.initial_volume || 0,
        stock_akhir: item.total_volume || item.Volume || item.volume || item.initial_volume || 0,
      }));
    }
    
    console.log('Processed BHP items:', bhpItems);
    return bhpItems;
  } catch (error) {
    console.error('Error fetching BHP items:', error);
    throw error;
  }
};

export const addBHPManually = async (bhpData) => {
  try {
    console.log('Adding BHP item manually:', bhpData);
    
    // Prepare the payload according to the API requirements without balance update
    const payload = {
      nama_barang: bhpData.nama_barang,
      kode_rekening: bhpData.kode_rekening,
      merk: bhpData.merk,
      volume: parseInt(bhpData.stock_awal) || 0,
      satuan: bhpData.satuan || 'Pcs',
      harga: parseInt(bhpData.harga_satuan) || 0,
      update_balance: false
    };
    
    console.log('API payload:', payload);
    
    // Call the API endpoint to add BHP
    const response = await api.post('/bhp', payload);
    console.log('API response:', response);
    
    // Dispatch a custom event to notify other components about BHP update
    const bhpUpdateEvent = new Event('bhp-balance-updated');
    window.dispatchEvent(bhpUpdateEvent);
    
    return response.data;
  } catch (error) {
    console.error('Error adding BHP manually:', error);
    throw error;
  }
};

export const removeBHP = async (id, data = {}) => {
  try {
    console.log(`Deleting BHP item with ID: ${id}`);
    
    // Use DELETE method with the specified endpoint
    const response = await api.delete(`/bhp/${id}`);
    
    console.log('Delete response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting BHP item:', error.response?.data || error.message);
    throw error;
  }
};

export const importBHP = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    // Add flag to update balance automatically
    formData.append('update_balance', 'true');
    
    const response = await api.post('/bhp/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Import BHP response:", response);
    
    // Dispatch a custom event to notify other components about balance update
    const balanceUpdateEvent = new Event('bhp-balance-updated');
    window.dispatchEvent(balanceUpdateEvent);
    
    if (response.data && response.data.message && response.data.message.includes('success')) {
      // Fetch fresh data after successful import
      const freshData = await getBHPs();
      return freshData;
    }
    
    return [];
  } catch (error) {
    console.error('Error importing BHP items:', error.response?.data || error.message);
    throw error;
  }
};

export const importAsset = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/aset/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log("Import Asset response:", response);
    return response.data;
  } catch (error) {
    console.error('Error importing assets:', error.response?.data || error.message);
    throw error;
  }
};

export const exportBHP = async (filters = {}) => {
  try {
    // Ensure month and year are provided with defaults if not specified
    const currentDate = new Date();
    const month = filters.month || (currentDate.getMonth() + 1);
    const year = filters.year || currentDate.getFullYear();
    
    const params = new URLSearchParams();
    
    // Only add month parameter if it's not null (for "all months" case)
    if (month !== null) {
      params.append('month', month.toString());
    }
    params.append('year', year.toString());
    
    const queryString = params.toString();
    const url = `/bhp/export-bhp?${queryString}`;
    
    console.log('Export URL:', url);
    
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    logApiError(error, 'exportBHP');
    throw error;
  }
};

//get BHP history
export const getBHPRiwayat = async () => {
  try {
    console.log('Fetching BHP riwayat...');
    const response = await api.get('/bhp/riwayat');
    console.log('BHP Riwayat Response:', response);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching BHP riwayat:', error);
    throw error;
  }
};

// Undo BHP removal (return items to inventory)
export const undoBHPRemoval = async (id) => {
  try {
    console.log(`Undoing BHP removal with ID: ${id}`);
    const response = await api.post(`/bhp/undo-remove/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error undoing BHP removal:', error);
    throw error;
  }
};

// Add this new function specifically for decreasing stock
export const decrementBHPStock = async (id, data) => {
  try {
    console.log(`Decreasing stock for BHP item with ID: ${id}`, data);
    
    // Use POST method with the correct endpoint for stock decrementation
    const response = await api.post(`/bhp/remove/${id}`, {
      volume: data.volume,
      taker_name: data.taker_name
    });
    
    console.log('Decrement response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error decreasing BHP stock:', error.response?.data || error.message);
    throw error;
  }
};

// BHP Statistics API functions
export const getTotalBHP = async () => {
  try {
    console.log('Fetching total BHP count...');
    const response = await api.get('/bhp/total-bhp');
    console.log('Total BHP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching total BHP count:', error);
    throw error;
  }
};

export const getTotalPeminjam = async () => {
  try {
    console.log('Fetching total peminjam count...');
    const response = await api.get('/bhp/total-peminjam');
    console.log('Total peminjam response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching total peminjam count:', error);
    throw error;
  }
};

// Chart API functions
export const getMonthlyExpenses = async (year) => {
  try {
    console.log(`Fetching monthly expenses for year: ${year}`);
    const response = await api.get(`/bhp/total-harga/${year}`);
    console.log('Monthly expenses response:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly expenses for ${year}:`, error);
    throw error;
  }
};
// Change username
export const changeUsername = async (newName) => {
  try {
    const response = await api.put('/user/change-name', { name: newName });
    return response.data;
  } catch (error) {
    console.error('Error changing username:', error.response?.data || error.message);
    throw error;
  }
};

// Change password
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await api.put('/user/change-password', {
      current_password: currentPassword,
      new_password: newPassword,           // Changed from 'password'
      new_password_confirmation: confirmPassword  // Changed from 'password_confirmation'
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error.response?.data || error.message);
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

// Balance management API functions
export const getBalance = async () => {
   try {
     console.log('Fetching balance...');
     const response = await api.get('/balance');
     console.log('Raw balance response:', response);
     
// Check different possible formats of the response
let balanceValue;

if (response.data && typeof response.data === 'object' && 'data' in response.data) {
  // If response is { data: value }
  balanceValue = response.data.data;
  console.log('Found balance in response.data.data:', balanceValue);
} else if (response.data && typeof response.data === 'object') {
  // If response is an object with another structure
  balanceValue = response.data.balance || response.data.amount || response.data.value;
  console.log('Found balance in response.data object:', balanceValue);
} else {
  // If response.data is the balance directly
  balanceValue = response.data;
  console.log('Using response.data directly as balance:', balanceValue);
}

return { data: balanceValue };
  } catch (error) {
console.error('Error fetching balance:', error);
throw error;
  }
};

export const addBalance = async (amount) => {
  try {
console.log(`Adding balance amount: ${amount}`);
const response = await api.post('/balance/add', { amount });
console.log('Raw add balance response:', response);

// Check different possible formats of the response
let balanceValue;

if (response.data && typeof response.data === 'object' && 'data' in response.data) {
  balanceValue = response.data.data;
} else if (response.data && typeof response.data === 'object') {
  balanceValue = response.data.balance || response.data.amount || response.data.value || response.data;
} else {
  balanceValue = response.data;
}

console.log('Extracted balance value:', balanceValue);
return { data: balanceValue };
  } catch (error) {
console.error('Error adding balance:', error);
throw error;
  }
};

export const updateBalance = async (amount) => {
  try {
console.log(`Updating balance amount: ${amount}`);
const response = await api.post('/balance/update', { amount });
console.log('Raw update balance response:', response);

// Check different possible formats of the response
let balanceValue;

if (response.data && typeof response.data === 'object' && 'data' in response.data) {
  balanceValue = response.data.data;
} else if (response.data && typeof response.data === 'object') {
  balanceValue = response.data.balance || response.data.amount || response.data.value || response.data;
} else {
  balanceValue = response.data;
}

console.log('Extracted balance value:', balanceValue);
return { data: balanceValue };
  } catch (error) {
console.error('Error updating balance:', error);
throw error;
  }
};

// Get rekap bulanan & tahunan combined
export const getCurrentTotals = async () => {
  try {
    console.log('Fetching current monthly and yearly totals...');
    const response = await api.get('/aset/total-harga/current');
    console.log('Current totals response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching current totals:', error);
    throw error;
  }
};

// Get total assets count
export const getTotalAssetCount = async () => {
  try {
    console.log('Fetching total asset count...');
    const response = await api.get('/aset/total');
    console.log('Total asset count response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching total asset count:', error);
    throw error;
  }
};

// Get total gedung count
export const getTotalGedungCount = async () => {
  try {
    console.log('Fetching total gedung count...');
    const response = await api.get('/lokasi/total');
    console.log('Total gedung count response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching total gedung count:', error);
    throw error;
  }
};

export const getGedungStats = async (gedungId) => {
  try {
    const response = await axios.get(`${API_URL}/gedung/${gedungId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gedung stats:', error);
    throw error;
  }
};

// Add deleteAllAssets function
export const deleteAllAssets = async () => {
  try {
    const response = await api.delete('/aset/destroy-all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all assets:', error.response?.data || error.message);
    throw error;
  }
};

// Add deleteAllBHP function
export const deleteAllBHP = async () => {
  try {
    const response = await api.delete('/bhp/destroy-all');
    return response.data;
  } catch (error) {
    console.error('Error deleting all BHP items:', error.response?.data || error.message);
    throw error;
  }
};

// Get all asset borrowing records
export const getPeminjamanAset = async () => {
  try {
    const response = await api.get('/peminjaman-aset');
    return response.data;
  } catch (error) {
    console.error('Error fetching peminjaman aset:', error.response?.data || error.message);
    throw error;
  }
};

// Create new asset borrowing record
export const createPeminjamanAset = async (id, peminjamanData) => {
  try {
    const response = await api.post(`/peminjaman-aset/${id}`, peminjamanData);
    return response.data;
  } catch (error) {
    console.error('Error creating peminjaman aset:', error.response?.data || error.message);
    throw error;
  }
};

// Return borrowed asset
export const kembalikanAset = async (id) => {
  try {
    // Changed from PUT to POST to match the Laravel route
    const response = await api.post(`/peminjaman-aset/${id}/kembalikan`);
    return response.data;
  } catch (error) {
    console.error('Error returning peminjaman aset:', error.response?.data || error.message);
    throw error;
  }
};

export const undoPeminjamanAset = async (id) => {
  try {
    const response = await api.delete(`/peminjaman-aset/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error undoing peminjaman aset:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAllBHPRiwayat = async () => {
  try {
    console.log('Deleting all BHP riwayat records...');
    const response = await api.delete('/bhp/destroy-all-riwayat');
    console.log('Delete all BHP riwayat response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting all BHP history:', error.response?.data || error.message);
    throw error;
  }
};