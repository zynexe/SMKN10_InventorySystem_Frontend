// src/context/UserContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      // Also store in localStorage as backup
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Try to get from localStorage if API fails
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user info function to be used by components
  const updateUserInfo = (newUserData) => {
    setUser(prevUser => ({ ...prevUser, ...newUserData }));
    // Also update localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...storedUser, ...newUserData }));
  };

  useEffect(() => {
    // Fetch user data on initial load
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, updateUserInfo, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;