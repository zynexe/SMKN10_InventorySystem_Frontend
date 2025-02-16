import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ChooseSystem from './ChooseSystem';
import AssetHome from './AssetHome';
import AssetPage from './AssetPage';
import BHPHome from './BHPHome';
import Gedung from './Gedung'; // Import the Gedung component
import logo from './logo.png';

function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission
    navigate('/choose-system'); // Redirect to Choose System page
  };

  return (
    <div className="container">
      {/* Left Side: Login Form */}
      <div className="login-section">
      <header className="header">
          <img src={logo} alt="Company Logo" />
        </header>
        <div className="login-box">
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" />
            </div>
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input type="password" id="password" name="password" />
            </div>
            <button className= "login-button"type="submit">Login</button>
          </form>
        </div>
        
      </div>

      {/* Right Side: Key Visual */}
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
      </Routes>
    </Router>
  );
}

export default App;