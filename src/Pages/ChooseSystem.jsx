import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/ChooseSystem.css';
import { FaSignOutAlt } from 'react-icons/fa';
import logo1 from '../assets/pencil-circle-fill.png';
import logo1Hover from '../assets/pencil-circle-fill-hover.png'; // Import hover image
import logo2 from '../assets/solar_safe-square-bold.png';
import logo2Hover from '../assets/solar_safe-square-bold-hover.png'; // Import hover image
import { logout } from '../services/api';


function ChooseSystem() {
  const navigate = useNavigate();
  const [hoveredButton, setHoveredButton] = useState(null);
  const handleSystemSelect = (system) => {
    if (system === 'asset') {
      navigate('/asset-home'); // Navigate to AssetHome
    } else if (system === 'bhp') {
      navigate('/bhp-home'); // Navigate to BHPHome
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/'); // Navigate to login page after logout
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <div className="choose-system-container">
      <div className="choose-system-box">
        <h1>Choose a system</h1>

        <div className="system-options">
          <button
            className="system-button"
            onMouseEnter={() => setHoveredButton(1)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleSystemSelect('asset')}
          >
            <img
              src={hoveredButton === 1 ? logo1Hover : logo1} // Conditional image source
              alt="Icon"
              className="system-icon"
            />
            Sistem Inventaris Asset
          </button>

          <button
            className="system-button"
            onMouseEnter={() => setHoveredButton(2)}
            onMouseLeave={() => setHoveredButton(null)}
            onClick={() => handleSystemSelect('bhp')}
          >
            <img
              src={hoveredButton === 2 ? logo2Hover : logo2} // Conditional image source
              alt="Icon"
              className="system-icon"
            />
            Sistem Inventaris BHP
          </button>

       
          <button 
            className="logout-button-choose"
            onClick={handleLogout}
          >
            <FaSignOutAlt style={{ marginRight: '8px' }} /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChooseSystem;