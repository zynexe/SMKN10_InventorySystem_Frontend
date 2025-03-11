// pages/KodeBarangPage.js
import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import SearchBar from '../../Components/SearchBar'; // Adjust path
import Pagination from '../../Components/Pagination'; // Adjust path
import Sidebar from '../../Layout/Sidebar'; // Adjust path
import '../../CSS/Asset.css'; // Import the CSS file
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const KodeBarangPage = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]); // Initialize as empty array
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Generate 300 random items on mount
        const generateRandomItems = () => {
            const newItems = [];
            for (let i = 1; i <= 10000; i++) {
                newItems.push({
                    id: i,
                    kode: `1.${Math.floor(Math.random() * 9) + 1}.${Math.floor(Math.random() * 9) + 1}.0${Math.floor(Math.random() * 9) + 1}.0${Math.floor(Math.random() * 9) + 1}.0${Math.floor(Math.random() * 9) + 1}.${100 + i}`,
                    nama: generateRandomNamaBarang(),
                });
            }
            setItems(newItems);
        };

        generateRandomItems();
    }, []);

    const generateRandomNamaBarang = () => {
        const prefixes = ["Aspal", "Semen", "Besi", "Kayu", "Batu"];
        const models = ["Tipe A", "Tipe B", "Tipe C", "Tipe D", "Tipe E"];
        const suffixes = ["Ukuran 1", "Ukuran 2", "Ukuran 3", "Ukuran 4", "Ukuran 5"];

        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomModel = models[Math.floor(Math.random() * models.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

        return `${randomPrefix} ${randomModel} ${randomSuffix}`;
    };

    // Filter items based on search term
    const filteredItems = items.filter(item =>
        item.kode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nama.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    // Add item handler (implement actual logic as needed)
    const handleAddItem = () => {
        alert('Add item functionality not implemented yet');
    };

    // Edit item handler
    const handleEdit = (id) => {
        alert(`Edit item ${id}`);
    };

    // Delete item handler
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setItems(items.filter(item => item.id !== id));
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
                        <button className="main-button" onClick={handleAddItem}>
                            + Add
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Kode Barang</th>
                                <th>Nama Barang</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.kode}</td>
                                    <td>{item.nama}</td>
                                    <td>
                                        <div className="actions-container">
                                            <button
                                                className="icon-button edit-button"
                                                onClick={() => handleEdit(item.id)}
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
                            ))}
                        </tbody>
                    </table>
                </div>

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
            </div>
        </div>
    );
};

export default KodeBarangPage;