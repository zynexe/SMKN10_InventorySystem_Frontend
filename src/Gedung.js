// Gedung.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './Asset.css';
import gedungImage from './assets/Gedung-image.png';
import GedungDetails from './GedungDetails';
import GedungFormModal from './Components/GedungFormModal';
import Sidebar from './Layout/Sidebar';
import { getLokasiList, createLokasi, updateLokasi } from './services/lokasiApi';

function Gedung() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedGedung, setSelectedGedung] = useState(null);
    const [gedungs, setGedungs] = useState([]);
    const [formMode, setFormMode] = useState('add');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data when component mounts
    useEffect(() => {
        fetchGedungs();
    }, []);

    const fetchGedungs = async () => {
        try {
            setIsLoading(true);
            const data = await getLokasiList();
            setGedungs(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch gedung data');
            console.error('Error fetching gedung:', err);
        } finally {
            setIsLoading(false);
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
            if (formMode === 'add') {
                const response = await createLokasi(formData);
                setGedungs([...gedungs, response.data]);
            } else {
                const response = await updateLokasi(selectedGedung.id, formData);
                setGedungs(gedungs.map(g => 
                    g.id === selectedGedung.id ? response.data : g
                ));
            }
            setIsFormModalOpen(false);
        } catch (err) {
            console.error('Error submitting form:', err);
            alert(err.message || 'Failed to save gedung');
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
                    {isLoading ? (
                        <div className="loading">Loading...</div>
                    ) : error ? (
                        <div className="error">{error}</div>
                    ) : (
                        <div className="gedung-grid">
                            {gedungs.map((gedung) => (
                                <div
                                    className="gedung-card"
                                    key={gedung.id}
                                    onClick={() => handleCardClick(gedung)}
                                >
                                    <img 
                                        src={gedungImage} 
                                        alt={gedung.name} 
                                        className="gedung-image"
                                    />
                                    <div className="gedung-details">
                                        <h3>{gedung.name}</h3>
                                        <p>{gedung.items || 0} Items</p>
                                        <h4>{gedung.assets || 'Rp.0'}</h4>
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
                    )}
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