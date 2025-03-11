// Gedung.js
import React, { useState } from 'react';
import './Asset.css';
import gedungImage from './assets/Gedung-image.png';
import { useNavigate } from "react-router-dom";
import GedungDetails from './GedungDetails';
import GedungFormModal from './Components/GedungFormModal';
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
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedGedung, setSelectedGedung] = useState(null);
    const [gedungs, setGedungs] = useState(gedungData);
    const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'

    const handleCardClick = (gedung) => {
        setSelectedGedung(gedung);
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setFormMode('add');
        setSelectedGedung(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (e, gedung) => {
        e.stopPropagation();
        setFormMode('edit');
        setSelectedGedung(gedung);
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (formData) => {
        if (formMode === 'add') {
            const newGedung = {
                name: formData.name,
                items: 0,
                assets: 'Rp.0',
                image: formData.image ? URL.createObjectURL(formData.image) : gedungImage,
            };
            setGedungs([...gedungs, newGedung]);
        } else {
            setGedungs(gedungs.map(g => 
                g.name === selectedGedung.name
                    ? { ...g, name: formData.name, image: formData.image ? URL.createObjectURL(formData.image) : g.image }
                    : g
            ));
        }
    };

    return (
        <div className="asset-home-container">
            <Sidebar />

            <div className="main-content">
                <div className="header">
                    <h2>Gedung</h2>
                    <div className="header-buttons">
                        <button className="main-button" onClick={handleAddClick}>
                            + Add
                        </button>
                    </div>
                </div>
                <div className="content">
                    <div className="gedung-grid">
                        {gedungs.map((gedung, index) => (
                            <div
                                className="gedung-card"
                                key={index}
                                onClick={() => handleCardClick(gedung)}
                            >
                                <img src={gedung.image || gedungImage} alt={gedung.name} className="gedung-image" />
                                <div className="gedung-details">
                                    <h3>{gedung.name}</h3>
                                    <p>{gedung.items} Items</p>
                                    <h4>{gedung.assets}</h4>
                                    <button 
                                        className="edit-button"
                                        onClick={(e) => handleEditClick(e, gedung)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <GedungDetails
                        isOpen={isModalOpen}
                        closeModal={() => setIsModalOpen(false)}
                        gedung={selectedGedung}
                    />
                    <GedungFormModal
                        isOpen={isFormModalOpen}
                        closeModal={() => setIsFormModalOpen(false)}
                        gedung={selectedGedung}
                        onSubmit={handleFormSubmit}
                        mode={formMode}
                    />
                </div>
            </div>
        </div>
    );
}

export default Gedung;