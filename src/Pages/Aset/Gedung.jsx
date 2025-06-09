import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import gedungImage from '../../assets/Gedung-image.png';
import { useNavigate } from "react-router-dom";
import GedungDetails from './GedungDetails';
import GedungFormModal from '../../Components/GedungFormModal';
import Sidebar from '../../Layout/Sidebar';
import { FaDownload } from 'react-icons/fa';
import { getGedungs, addGedung, updateGedung, deleteGedung, getAssets } from '../../services/api';

function Gedung() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedGedung, setSelectedGedung] = useState(null);
    const [gedungs, setGedungs] = useState([]); 
    const [formMode, setFormMode] = useState('add');
    const [isLoading, setIsLoading] = useState(true);
    const [gedungStats, setGedungStats] = useState({}); // Store stats for each gedung

    useEffect(() => {
        fetchGedungs();
    }, []);

    const fetchGedungs = async () => {
        try {
            setIsLoading(true);
            const data = await getGedungs();
            setGedungs(data);
            
            // After fetching buildings, get stats for each
            fetchGedungStats(data);
        } catch (error) {
            console.error('Failed to fetch gedungs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchGedungStats = async (gedungsList) => {
        try {
            // Get all assets
            const assets = await getAssets();
            const assetData = Array.isArray(assets) ? assets : (assets?.data || []);
            
            // Process stats for each gedung
            const stats = {};
            
            gedungsList.forEach(gedung => {
                const gedungName = gedung.nama_gedung;
                
                // Filter assets for this gedung
                const gedungAssets = assetData.filter(asset => 
                    asset.nama_gedung === gedungName || asset.lokasi === gedungName
                );
                
                // Calculate total items
                const itemCount = gedungAssets.length;
                
                // Calculate total value
                const totalValue = gedungAssets.reduce((sum, asset) => {
                    const price = typeof asset.harga === 'string' 
                        ? parseFloat(asset.harga.replace(/[^\d]/g, '')) 
                        : (asset.harga || 0);
                    return sum + price;
                }, 0);
                
                // Store stats
                stats[gedung.id] = {
                    itemCount,
                    totalValue: `Rp.${totalValue.toLocaleString('id-ID')}`
                };
            });
            
            setGedungStats(stats);
            
        } catch (error) {
            console.error('Error fetching gedung stats:', error);
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
                    {isLoading ? (
                        <div className="loading-container">
                            <p>Loading gedung data...</p>
                        </div>
                    ) : (
                        <div className="gedung-grid">
                            {gedungs.map((gedung) => (
                                <div
                                    className="gedung-card"
                                    key={gedung.id}
                                    onClick={() => handleCardClick(gedung)}
                                >
                                    <img 
                                        src={gedung.image ? `https://api-inventaris.matradipti.org/storage/${gedung.image}` : gedungImage} 
                                        alt={gedung.nama_gedung} 
                                        className="gedung-image" 
                                    />
                                    <div className="gedung-details">
                                        <h3>{gedung.nama_gedung}</h3>
                                        <p>{gedungStats[gedung.id]?.itemCount || 0} Items</p>
                                        <h4>{gedungStats[gedung.id]?.totalValue || 'Rp.0'}</h4>
                                        <div className="button-container" style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                                            <button 
                                                className="main-button"
                                                onClick={(e) => handleEditClick(e, gedung)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-button-gedung"
                                                onClick={(e) => handleDelete(gedung.id, e)}
                                            >
                                                Delete
                                            </button>
                                        </div>
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