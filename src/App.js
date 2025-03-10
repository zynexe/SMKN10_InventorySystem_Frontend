import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ChooseSystem from './ChooseSystem';
import AssetHome from './AssetHome';
import AssetPage from './AssetPage';
import BHPHome from './BHPHome';
import Gedung from './Gedung'; 
import KodeBarang from './KodeBarang';
import logo from './logo.png';
import ProfilePage from './ProfilePage'; // Import ProfilePage
import axios from 'axios';
import { loginUser } from './services/api';

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser(formData);
      localStorage.setItem('user', JSON.stringify(response.user));
      navigate('/choose-system');
    } catch (error) {
      setError(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-section">
        <header className="header">
          <img src={logo} alt="Company Logo" />
        </header>
        <div className="login-box">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button 
              className="login-button" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <div className="key-visual">
        <img src="/Login-visual.png" alt="Key Visual" />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/choose-system" element={<ChooseSystem />} />
        <Route path="/asset-home" element={<AssetHome />} />
        <Route path="/asset-page" element={<AssetPage />} />
        <Route path="/bhp-home" element={<BHPHome />} />
        <Route path="/gedung" element={<Gedung />} /> 
        <Route path="/kode-barang" element={<KodeBarang />} /> 
        <Route path="/ProfilePage" element={<ProfilePage />} /> {/* Add the profile route */}
      </Routes>
    </Router>
  );
}

export default App;