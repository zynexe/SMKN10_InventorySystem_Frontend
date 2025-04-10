import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/logo.png'; 
import homeIcon from '../assets/home.png'; 
import assetIcon from '../assets/asset.png'; 
import kodeRekeningIcon from '../assets/kode-rekening.png'; 
import gedungIcon from '../assets/gedung.png'; 
import profileIcon from '../assets/profile.png'; 
import switchIcon from '../assets/switch.png'; 
import '../CSS/Asset.css';

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth > 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {!isDesktop && (
                <button className="hamburger-icon" onClick={toggleSidebar}>
                    ☰
                </button>
            )}
            <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <ul className="nav-links">
                    <li>
                        <a
                            href="#"
                            onClick={() => { navigate("/asset-home"); toggleSidebar(); }}
                            className={location.pathname === "/asset-home" ? "active" : ""}
                        >
                            <img src={homeIcon} alt="Home" className="icon" />
                            Home
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => { navigate("/asset-page"); toggleSidebar(); }}
                            className={location.pathname === "/asset-page" ? "active" : ""}
                        >
                            <img src={assetIcon} alt="Asset" className="icon" />
                            Asset
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => { navigate("/kode-barang"); toggleSidebar(); }}
                            className={location.pathname === "/kode-barang" ? "active" : ""}
                        >
                            <img src={kodeRekeningIcon} alt="Kode Barang" className="icon" />
                            Kode Barang
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            onClick={() => { navigate("/gedung"); toggleSidebar(); }}
                            className={location.pathname === "/gedung" ? "active" : ""}
                        >
                            <img src={gedungIcon} alt="Gedung" className="icon" />
                            Gedung
                        </a>
                    </li>
                
                </ul>
                <div className="switch-system">
                    <button onClick={() => { navigate("/choose-system"); toggleSidebar(); }}>
                        <img src={switchIcon} alt="Switch System" className="icon" />
                        Switch System
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;