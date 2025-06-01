import React, { useState, useEffect } from 'react';
// Add FaTrash to imports
import { FaEdit, FaTrashAlt, FaTrash } from 'react-icons/fa';
import SearchBar from '../../Components/SearchBar';
import Pagination from '../../Components/Pagination';
import Sidebar from '../../Layout/Sidebar';
import KodeBarangModal from '../../Components/KodeBarangModal';
import '../../CSS/Asset.css';
import { useNavigate } from 'react-router-dom';
import { getKodeBarangs, deleteKodeBarang, addKodeBarang, updateKodeBarang, getTotalKodeBarang, deleteAllKodeBarang } from '../../services/api';

const KodeBarangPage = () => {
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

    // Fetch kode barang items from API
    const fetchItems = async () => {
        try {
            setLoading(true);
            const response = await getKodeBarangs();
            
            // Check the response structure and extract data correctly
            if (response.data) {
                setItems(response.data);
            } else if (Array.isArray(response)) {
                setItems(response);
            } else {
                console.warn("Unexpected API response format:", response);
                setItems([]);
            }
            
            // Get total count
            try {
                const totalResponse = await getTotalKodeBarang();
                if (totalResponse && totalResponse.total) {
                    setTotalItems(totalResponse.total);
                } else {
                    setTotalItems(items.length);
                }
            } catch (totalError) {
                console.warn("Error fetching total count:", totalError);
                setTotalItems(items.length);
            }
            
            setError(null);
        } catch (err) {
            console.error('Error fetching items:', err);
            
            // More detailed error logging
            if (err.response) {
                console.error("Response error data:", err.response.data);
                console.error("Response error status:", err.response.status);
            }
            
            setError('Failed to fetch items. Please try again later.');
            setItems([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

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
        
        // Check uraian field first (preferred field from backend)
        if (item.uraian && item.uraian.toLowerCase().includes(searchTermLower)) {
            return true;
        }
        
        // Fallback to nama field if uraian is not available
        if (item.nama && item.nama.toLowerCase().includes(searchTermLower)) {
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
                // Update existing item
                const response = await updateKodeBarang(currentItem.id, newItem);
                
                // Update the item in the local state without refreshing the entire list
                setItems(items.map(item => 
                    item.id === currentItem.id ? { ...item, ...response.data } : item
                ));
                
                alert('Item updated successfully');
            } else {
                // Add new item
                const response = await addKodeBarang(newItem);
                setItems([...items, response.data]);
                alert('Item added successfully');
                
              
                fetchItems();
            }
            
            setIsModalOpen(false);
        } catch (err) {
            console.error('Error saving item:', err);
            
            // Handle validation errors specifically
            if (err.response && err.response.status === 422) {
                const validationErrors = err.response.data.errors;
                let errorMessage = "Validation failed:\n";
                
                // Format validation errors nicely
                Object.keys(validationErrors).forEach(field => {
                    errorMessage += `- ${validationErrors[field].join('\n- ')}\n`;
                });
                
                alert(errorMessage);
            } else {
                // Generic error handling
                alert(`Failed to save item: ${err.response?.data?.message || err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Delete item handler
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                setLoading(true);
                await deleteKodeBarang(id);
                setItems(items.filter(item => item.id !== id));
                fetchItems(); 
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
            'WARNING: Apakah anda yakin untuk menghapus semua kode barang?'
        );
        
        if (confirmResult) {
            // Double-check with a more specific confirmation
            const secondConfirm = window.confirm(
                `Anda akan menghapus ${items.length} kode barang. apakah anda yakin? Semua data akan hilang dan tidak dapat dikembalikan.`
            );
            
            if (secondConfirm) {
                try {
                    setIsDeleting(true);
                    
                    // Call the API to delete all items
                    await deleteAllKodeBarang();
                    
                    // Show success message
                    alert('All Kode Barang items have been successfully deleted.');
                    
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

    return (
        <div className="asset-home-container">
            <Sidebar />

            <div className="main-content">
                <div className="header">
                    <h2 style={{ marginRight: "10px" }}>Kode Barang</h2>
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
                                    <th>Kode Barang</th>
                                    <th>Nama Barang</th>
                                    <th>Aksi</th>
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
                onImportSuccess={fetchItems}
            />
        </div>
    );
};

export default KodeBarangPage;