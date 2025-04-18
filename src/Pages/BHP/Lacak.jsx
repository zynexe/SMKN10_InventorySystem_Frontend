import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import gedungImage from '../../assets/Gedung-image.png';
import { useNavigate } from "react-router-dom";
import GedungDetails from '../Aset/GedungDetails';
import GedungFormModal from '../../Components/GedungFormModal';
import SidebarBHP from '../../Layout/SidebarBHP';
import { FaDownload } from 'react-icons/fa';
import { getGedungs, addGedung, updateGedung, deleteGedung, getGedungStats } from '../../services/api';

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
    const [gedungs, setGedungs] = useState([]);
    const [gedungStats, setGedungStats] = useState({});
    const [formMode, setFormMode] = useState('add');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchGedungs();
    }, []);

    const fetchGedungs = async () => {
        try {
            setIsLoading(true);
            const data = await getGedungs();
            setGedungs(data);
            
            const statsPromises = data.map(gedung => getGedungStats(gedung.id));
            const statsResults = await Promise.all(statsPromises);
            
            const statsMap = {};
            data.forEach((gedung, index) => {
                statsMap[gedung.id] = statsResults[index] || { itemCount: 0, totalValue: 0 };
            });
            
            setGedungStats(statsMap);
        } catch (error) {
            console.error('Failed to fetch gedungs or stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
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
            <SidebarBHP />
            <div className="main-content">
                <div className="header">
                    <h2>Gedung</h2>
                    <div className="header-buttons">
                        <button className="secondary-button" >
                        <FaDownload /> Export 
                        </button>
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
                                        src={gedung.image ? `http://127.0.0.1:8000/storage/${gedung.image}` : gedungImage} 
                                        alt={gedung.nama_gedung} 
                                        className="gedung-image" 
                                    />
                                    <div className="gedung-details">
                                        <h3>{gedung.nama_gedung}</h3>
                                        <p>{gedungStats[gedung.id]?.itemCount || 0} Items</p>
                                        <h4>{formatCurrency(gedungStats[gedung.id]?.totalValue || 0)}</h4>
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