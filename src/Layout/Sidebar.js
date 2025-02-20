// Layout/Sidebar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../logo.png';
import homeIcon from '../assets/home.png';
import assetIcon from '../assets/asset.png';
import kodeRekeningIcon from '../assets/kode-rekening.png';
import gedungIcon from '../assets/gedung.png';
import profileIcon from '../assets/profile.png';
import switchIcon from '../assets/switch.png';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation(); // Get the current location

    return (
        <div className="sidebar">
            <div className="logo-container">
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <ul className="nav-links">
                <li>
                    <a
                        href="#"
                        onClick={() => navigate("/asset-home")}
                        className={location.pathname === "/asset-home" ? "active" : ""}
                    >
                        <img src={homeIcon} alt="Home" className="icon" />
                        Home
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => navigate("/asset-page")}
                        className={location.pathname === "/asset-page" ? "active" : ""}
                    >
                        <img src={assetIcon} alt="Asset" className="icon" />
                        Asset
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => navigate("/kode-barang")}
                        className={location.pathname === "/kode-barang" ? "active" : ""}
                    >
                        <img src={kodeRekeningIcon} alt="Kode Barang" className="icon" />
                        Kode Barang
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => navigate("/gedung")}
                        className={location.pathname === "/gedung" ? "active" : ""}
                    >
                        <img src={gedungIcon} alt="Gedung" className="icon" />
                        Gedung
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        // Add an active class if needed for Profile
                        className={location.pathname === "/profile" ? "active" : ""} // Update pathname if needed
                    >
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
    );
}

export default Sidebar;