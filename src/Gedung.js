// Gedung.js
import React, { useState } from 'react'; // Import useState!
import './Asset.css';
import gedungImage from './assets/Gedung-image.png';
import { useNavigate } from "react-router-dom";
import GedungDetails from './GedungDetails';
import Sidebar from './Layout/Sidebar';

// Move the data array outside the component
export const gedungData = [
    { name: 'Gedung A', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung B', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung C', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung D', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung E', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung F', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung G', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung H', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung I', items: 12, assets: 'Rp.200.000.000' },
    { name: 'Gedung J', items: 12, assets: 'Rp.200.000.000' },
];

function Gedung() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGedung, setSelectedGedung] = useState(null);

    const handleCardClick = (gedung) => {
        setSelectedGedung(gedung);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className="asset-home-container">
            <Sidebar />

            <div className="main-content">
                <div className="header">
                    <h2>Gedung</h2>
                    <div className="header-buttons">
                        <button className="secondary-button">Edit</button>
                        <button className="main-button">+ Add</button>
                    </div>
                </div>
                <div className="content">
                    <div className="gedung-grid">
                        {gedungData.map((gedung, index) => (
                            <div
                                className="gedung-card"
                                key={index}
                                onClick={() => handleCardClick(gedung)}
                            >
                                <img src={gedungImage} alt={gedung.name} className="gedung-image" />
                                <div className="gedung-details">
                                    <h3>{gedung.name}</h3>
                                    <p>{gedung.items} Items</p>
                                    <h4>{gedung.assets}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                    <GedungDetails
                        isOpen={isModalOpen}
                        closeModal={closeModal}
                        gedung={selectedGedung}
                    />
                </div>
            </div>
        </div>
    );
}

export default Gedung;