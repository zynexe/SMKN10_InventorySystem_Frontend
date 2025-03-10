import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

export const loginUser = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Network error occurred' };
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