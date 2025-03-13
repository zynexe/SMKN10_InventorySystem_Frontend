import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet, useNavigate } from 'react-router-dom';
import '../CSS/App.css';
import ChooseSystem from './ChooseSystem';

// Asset imports
import AssetHome from './Aset/AssetHome';
import AssetPage from './Aset/AssetPage';

// BHP imports
import BHPHome from './BHP/BHPHome';

// Other page imports
import Gedung from './Aset/Gedung'; 
import KodeBarang from './Aset/KodeBarang';
import ProfilePage from './ProfilePage';
import logo from '../assets/logo.png';

// Services
import { login } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await login(formData.username, formData.password);

      // Store token & user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to the dashboard
      navigate('/choose-system');
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button className="login-button" type="submit" disabled={isLoading}>
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
};

// Protected route wrapper to check authentication
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/choose-system" element={<ChooseSystem />} />
          <Route path="/asset-home" element={<AssetHome />} />
          <Route path="/asset-page" element={<AssetPage />} />
          <Route path="/bhp-home" element={<BHPHome />} />
          <Route path="/gedung" element={<Gedung />} />
          <Route path="/kode-barang" element={<KodeBarang />} />
          <Route path="/ProfilePage" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;