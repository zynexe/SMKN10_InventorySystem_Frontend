import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import gedungImage from '../../assets/Gedung-image.png';
import { useNavigate } from "react-router-dom";
import GedungDetails from './GedungDetails';
import GedungFormModal from '../../Components/GedungFormModal';
import Sidebar from '../../Layout/Sidebar';
// Add API imports
import { getGedungs, addGedung, updateGedung, deleteGedung } from '../../services/api';

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
    const [gedungs, setGedungs] = useState(gedungData); // Use gedungData as initial state
    const [formMode, setFormMode] = useState('add');

    useEffect(() => {
        fetchGedungs();
    }, []);

    const fetchGedungs = async () => {
        try {
            const data = await getGedungs();
            setGedungs(data);
        } catch (error) {
            console.error('Failed to fetch gedungs:', error);
        }
    };

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

    const handleFormSubmit = async (formData) => {
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('nama_gedung', formData.name);
            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            if (formMode === 'add') {
                await addGedung(formDataToSend);
            } else {
                await updateGedung(selectedGedung.id, formDataToSend);
            }
            fetchGedungs();
        } catch (error) {
            console.error('Error saving gedung:', error);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this building?')) {
            try {
                await deleteGedung(id);
                fetchGedungs();
            } catch (error) {
                console.error('Error deleting gedung:', error);
            }
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
                        {gedungs.map((gedung) => (
                            <div
                                className="gedung-card"
                                key={gedung.id}
                                onClick={() => handleCardClick(gedung)}
                            >
                                <img 
                                    src={gedung.image ? `http://127.0.0.1:8000/storage/${gedung.image}` : gedungImage} 
                                    alt={gedung.nama_gedung} 
                                    className="gedung-image" 
                                />
                                <div className="gedung-details">
                                    <h3>{gedung.nama_gedung}</h3>
                                    <p>{gedung.items || 0} Items</p>
                                    <h4>{gedung.assets || 'Rp.0'}</h4>
                                    <button 
                                        className="edit-button"
                                        onClick={(e) => handleEditClick(e, gedung)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-button"
                                        onClick={(e) => handleDelete(gedung.id, e)}
                                    >
                                        Delete
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