import React, { useState, useEffect } from 'react';
// Add FaTrash to imports
import { FaEdit, FaTrashAlt, FaFileImport, FaTrash } from 'react-icons/fa';
import SearchBar from '../../Components/SearchBar';
import Pagination from '../../Components/Pagination';
import SidebarBHP from '../../Layout/SidebarBHP';
import KodeRekeningModal from '../../Components/KodeRekeningModal';
import '../../CSS/Asset.css';
import { useNavigate } from 'react-router-dom';
import { getKodeRekenings, addKodeRekening, updateKodeRekening, deleteKodeRekening, importKodeRekening, deleteAllKodeRekening } from '../../services/api';

const RekeningPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    // Add state for delete all functionality
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;

    // Fetch all kode rekening items
    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await getKodeRekenings();
            console.log('API Response from getKodeRekenings:', response);
            
            // Check different possible data structures
            let itemsData;
            if (response && response.data) {
                itemsData = Array.isArray(response.data) ? response.data : [];
            } else {
                itemsData = Array.isArray(response) ? response : [];
            }
            
            console.log('Processed items data:', itemsData);
            setItems(itemsData);
            setTotalItems(itemsData.length);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch kode rekening:', err);
            setError('Failed to load kode rekening data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchItems();
    }, []);

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

    // Handler for adding or updating an item from the modal
    const handleAddFromModal = async (newItem) => {
        try {
            setLoading(true);
            
            if (isEditing && currentItem) {
                // Update existing item
                await updateKodeRekening(currentItem.id, newItem);
                alert('Item updated successfully');
            } else {
                // Add new item
                const result = await addKodeRekening(newItem);
                console.log('Add item result:', result);
                alert('Item added successfully');
            }
            
            setIsModalOpen(false);
            // Force refresh data after adding/updating
            await fetchItems(); 
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
                await deleteKodeRekening(id);
                alert('Item deleted successfully');
                await fetchItems(); // Force refresh data after deletion
            } catch (err) {
                console.error('Error deleting item:', err);
                alert(`Failed to delete item: ${err.message}`);
            } finally {
                setLoading(false);
            }
        }
    };

    // Update the handleDeleteAll function to use the API
    const handleDeleteAll = async () => {
        // Show a confirmation dialog with strong warning
        const confirmResult = window.confirm(
            'WARNING: This will permanently delete ALL Kode Rekening items. This action cannot be undone. Are you absolutely sure?'
        );
        
        if (confirmResult) {
            // Double-check with a more specific confirmation
            const secondConfirm = window.confirm(
                `You are about to delete ${items.length} items. Please confirm once more to proceed.`
            );
            
            if (secondConfirm) {
                try {
                    setIsDeleting(true);
                    
                    // Call the API to delete all items
                    await deleteAllKodeRekening();
                    
                    // Show success message
                    alert('All Kode Rekening items have been successfully deleted.');
                    
                    // Clear the local items list and refresh the data
                    setItems([]);
                    fetchItems();
                    
                } catch (error) {
                    console.error("Error deleting all items:", error);
                    alert(`Failed to delete all items: ${error.message}`);
                } finally {
                    setIsDeleting(false);
                }
            }
        }
    };

    // Debug items state
    useEffect(() => {
        console.log('Current Items state:', { items, filteredItems, currentItems });
    }, [items, filteredItems, currentItems]);

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
                        {/* Add Delete All button here */}
                        {items.length > 0 && (
                            <button 
                                className="delete-all-button"
                                onClick={handleDeleteAll}
                                disabled={isDeleting || loading}
                            >
                                <FaTrash style={{ marginRight: '5px' }} />
                                {isDeleting ? "Deleting..." : "Delete All"}
                            </button>
                        )}
                        <button className="main-button" onClick={handleAddItem}>
                            + Add
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="error-message">
                        <p>{error}</p>
                        <button onClick={fetchItems} className="retry-button">Retry</button>
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
                                    <th>Uraian</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems && currentItems.length > 0 ? (
                                    currentItems.map(item => (
                                        <tr key={item.id || `item-${Math.random()}`}>
                                            <td>{item.kode || 'No Code'}</td>
                                            <td>{item.uraian || 'No Description'}</td>
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

            {/* Use the KodeRekeningModal component */}
            <KodeRekeningModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddFromModal}
                isEditing={isEditing}
                currentItem={currentItem}
                onImportSuccess={fetchItems}
            />
        </div>
    );
};

export default RekeningPage;