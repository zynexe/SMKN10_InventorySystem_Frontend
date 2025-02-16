// Gedung.js
import React from 'react';
import './Asset.css'; // Import the CSS file
import gedungImage from './assets/Gedung-image.png'; // Import your gedung image
import { useNavigate } from "react-router-dom";
import logo from "./logo.png"; // Import your logo
import homeIcon from "./assets/home.png";
import assetIcon from "./assets/asset.png";
import kodeRekeningIcon from "./assets/kode-rekening.png";
import gedungIcon from "./assets/gedung.png";
import profileIcon from "./assets/profile.png";
import switchIcon from "./assets/switch.png";


function Gedung() {
    const navigate = useNavigate();

    const gedungData = [
        { name: 'Gedung A', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung B', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung C', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung D', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung E', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung F', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung G', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung H', items: 12, assets: 'Rp.200.000.000' },
        { name: 'Gedung I', items: 12, assets: 'Rp.200.000.000' },
    ];

    return (
        <div className="asset-home-container">
            {/* Sidebar/Navbar */}
            <div className="sidebar">
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                </div>
                <ul className="nav-links">
                    <li>
                        <a href="#"  onClick={() => navigate("/asset-home")}>
                            <img src={homeIcon} alt="Home" className="icon" />
                            Home
                        </a>
                    </li>
                    <li>
                        <a href="#" onClick={() => navigate("/asset-page")}>
                            <img src={assetIcon} alt="Asset" className="icon" />
                            Asset
                        </a>
                    </li>
                    <li>
                        <a href="#">
                            <img src={kodeRekeningIcon} alt="Kode Rekening" className="icon" />
                            Kode Rekening
                        </a>
                    </li>
                    <li>
                        <a href="#" className="active" onClick={() => navigate("/gedung")}>
                            <img src={gedungIcon} alt="Gedung" className="icon" />
                            Gedung
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
                    <h2>Gedung</h2>
                    <div className="header-buttons"> {/* Container for buttons */}
                        <button className="secondary-button">Edit</button>
                        <button className="main-button">+ Add</button>
                    </div>
                </div>
                <div className="content">
                <div className="gedung-grid">
                    {gedungData.map((gedung, index) => (
                        <div className="gedung-card" key={index} onClick={() => handleCardClick(gedung)}> {/* Add onClick */}
                            <img src={gedungImage} alt={gedung.name} className="gedung-image" />
                            <div className="gedung-details">
                                <h3>{gedung.name}</h3>
                                <p>{gedung.items} Items</p>
                                <h4>{gedung.assets}</h4>
                            </div>
                        </div>
                    ))}
                </div>
                    {/* Pagination */}
                    
                </div>
            </div>
        </div>
    );
    function handleCardClick(gedung) {
        // Handle the click action here.  For example:
        console.log(`Clicked on ${gedung.name}`);
        // You could navigate to a different page, open a modal, etc.
        // For example, to navigate:
        // navigate(`/gedung/${gedung.name}`); // Assuming you have a route like this
    }
}

export default Gedung;