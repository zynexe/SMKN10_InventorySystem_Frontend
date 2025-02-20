// components/SearchBar.js
import React from 'react';

function SearchBar({ searchTerm, handleSearchChange }) {
    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Cari Item / Kode Barang"
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
            />
        </div>
    );
}

export default SearchBar;