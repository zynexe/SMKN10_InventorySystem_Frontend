import React from 'react';
import './BHPHome.css';
import logo from '../../assets/logo.png'; 

import homeIcon from "../../assets/home.png";
import assetIcon from "../../assets/asset.png";
import kodeRekeningIcon from "../../assets/kode-rekening.png";
import gedungIcon from "../../assets/gedung.png";
import profileIcon from "../../assets/profile.png";
import switchIcon from "../../assets/switch.png";
import { useNavigate } from 'react-router-dom';


function BHPHome() {
  const navigate = useNavigate();

  return (
    <div className="asset-home-container">
      {/* Sidebar/Navbar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <ul className="nav-links">
          <li>
            <a href="#" className="active" onClick={() => navigate("/bhp-home")}>
              <img src={homeIcon} alt="Home" className="icon" />
              Home
            </a>
          </li>
          <li>
            <a href="#">
              <img src={assetIcon} alt="Asset" className="icon" />
              BHP
            </a>
          </li>
          <li>
            <a href="#">
              <img src={kodeRekeningIcon} alt="Kode Rekening" className="icon" />
              Kode Rekening
            </a>
          </li>
          <li>
            <a href="#">
              <img src={gedungIcon} alt="Gedung" className="icon" />
              Lacak Barang
            </a>
          </li>
          <li>
            <a href="#">
              <img src={profileIcon} alt="Profile" className="icon" />
              Profile
            </a>
          </li>
        </ul>
        <div className="switch-system">
          <button onClick={() => navigate("/choose-system")}>
            <img src={switchIcon} alt="Switch System" className="icon" />
            Switch System
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h2>Home</h2>
        </div>
        <div className="content">
         
          <div className="dashboard-cards">
            <div className="card">
              <h3>Balance</h3>
              <p>Rp.100.000.000</p>
            </div>
            <div className="card">
              <h3>Rekap Tahunan</h3>
              <p>Rp.200.000.000</p>
            </div>
            <div className="card">
              <h3>Rekap Bulanan</h3>
              <p>Rp.200.000.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BHPHome;