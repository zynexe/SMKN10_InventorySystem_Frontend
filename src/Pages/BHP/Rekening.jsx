import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import SearchBar from '../../Components/SearchBar';
import Pagination from '../../Components/Pagination';
import SidebarBHP from '../../Layout/SidebarBHP';
import KodeBarangModal from '../../Components/KodeBarangModal';
import '../../CSS/Asset.css';
import { useNavigate } from 'react-router-dom';

// Generate dummy data for kode rekening BHP items
const generateDummyRekeningData = () => {
  return [
    { id: 1, kode: '5.2.2.01', uraian: 'Alat Tulis Kantor' },
    { id: 2, kode: '5.2.2.02', uraian: 'Alat Listrik' },
    { id: 3, kode: '5.2.2.03', uraian: 'Peralatan Kebersihan dan Bahan Pembersih' },
    { id: 4, kode: '5.2.2.04', uraian: 'Bahan/Material' },
    { id: 5, kode: '5.2.2.05', uraian: 'Bahan Bakar Minyak/Gas dan Pelumas' },
    { id: 6, kode: '5.2.2.06', uraian: 'Pengisian Tabung Pemadam Kebakaran' },
    { id: 7, kode: '5.2.2.07', uraian: 'Pengisian Tabung Gas' },
    { id: 8, kode: '5.2.2.08', uraian: 'Perangko, Materai dan Benda Pos Lainnya' },
    { id: 9, kode: '5.2.2.09', uraian: 'Dokumentasi' },
    { id: 10, kode: '5.2.2.10', uraian: 'Keamanan' },
    { id: 11, kode: '5.2.2.11', uraian: 'Perlengkapan/Peralatan Kantor' },
    { id: 12, kode: '5.2.2.12', uraian: 'Bahan/Material Persediaan Pemeliharaan Peralatan dan Mesin' },
    { id: 13, kode: '5.2.2.13', uraian: 'Bahan/Material Persediaan Pemeliharaan Gedung dan Bangunan' },
    { id: 14, kode: '5.2.2.14', uraian: 'Persediaan Bahan/Material untuk Pemeliharaan Jalan/Jembatan' },
    { id: 15, kode: '5.2.2.15', uraian: 'Bahan Makanan dan Minuman' }
  ];
};

const RekeningPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState(generateDummyRekeningData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(15); // Initial count from dummy data
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const itemsPerPage = 10;

    // Filter items based on search term
    const filteredItems = items.filter(item => {
        const searchTermLower = searchTerm.toLowerCase();
        
        // Check kode field
        if (item.kode && item.kode.toLowerCase().includes(searchTermLower)) {
            return true;
        }
        
        // Check uraian field
        if (item.uraian && item.uraian.toLowerCase().includes(searchTermLower)) {
            return true;
        }
        
        return false;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Add item handler - opens the modal for adding
    const handleAddItem = () => {
        setIsEditing(false);
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    // Edit item handler - opens the modal for editing
    const handleEdit = (item) => {
        setIsEditing(true);
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    // Handler for adding a new item from the modal
    const handleAddFromModal = async (newItem) => {
        try {
            setLoading(true);
            
            if (isEditing && currentItem) {
                // Update existing item in dummy data
                setItems(items.map(item => 
                    item.id === currentItem.id ? { ...item, ...newItem } : item
                ));
                alert('Item updated successfully');
            } else {
                // Add new item to dummy data
                const newId = Math.max(...items.map(item => item.id)) + 1;
                setItems([...items, { id: newId, ...newItem }]);
                setTotalItems(prev => prev + 1);
                alert('Item added successfully');
            }
            
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving item:', err);
            alert(`Failed to save item: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Delete item handler
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                setLoading(true);
                // Remove item from dummy data
                setItems(items.filter(item => item.id !== id));
                setTotalItems(prev => prev - 1);
                alert('Item deleted successfully');
            } catch (err) {
                console.error('Error deleting item:', err);
                alert(`Failed to delete item: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="asset-home-container">
            <SidebarBHP />

            <div className="main-content">
                <div className="header">
                    <h2 style={{ marginRight: "10px" }}>Kode Rekening</h2>
                    <div className="header-buttons">
                        <SearchBar
                            searchTerm={searchTerm}
                            handleSearchChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="main-button" onClick={handleAddItem}>
                            + Add
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={() => setError(null)} className="retry-button">Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="loading">Loading items...</div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Kode Rekening</th>
                                    <th>Nama Barang</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map(item => (
                                        <tr key={item.id}>
                                            <td>{item.kode}</td>
                                            <td>{item.uraian || item.nama}</td>
                                            <td>
                                                <div className="actions-container">
                                                    <button
                                                        className="icon-button edit-button"
                                                        onClick={() => handleEdit(item)}
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        className="icon-button delete-button"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <FaTrashAlt />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="no-data">
                                            No items found. {items.length === 0 ? "Add some items to get started!" : "Try a different search term."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && items.length > 0 && (
                    <div className="pagination-total-container">
                        <Pagination
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                        />
                        <div className="total-items">
                            Total Items: {filteredItems.length}
                        </div>
                    </div>
                )}
            </div>

            <KodeBarangModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddFromModal}
                isEditing={isEditing}
                currentItem={currentItem}
            />
        </div>
    );
};

export default RekeningPage;