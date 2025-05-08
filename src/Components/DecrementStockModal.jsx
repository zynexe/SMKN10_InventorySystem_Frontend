import React, { useState, useEffect } from 'react';
import '../CSS/Asset.css';
import { FaTimes } from 'react-icons/fa';

function DecrementStockModal({ isOpen, closeModal, onConfirm, item }) {
  const [volume, setVolume] = useState(1);
  const [takerName, setTakerName] = useState('');
  const [recentTakers, setRecentTakers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Maximum amount that can be reduced (stock_akhir)
  const maxVolume = item?.stock_akhir || 0;
  
  // Reset form when modal opens with a new item
  useEffect(() => {
    if (isOpen) {
      setVolume(1);
      setTakerName('');
      
      // Load recent takers from localStorage
      const storedTakers = localStorage.getItem('recentTakers');
      if (storedTakers) {
        setRecentTakers(JSON.parse(storedTakers));
      }
    }
  }, [isOpen, item]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (volume <= 0) {
      alert('Jumlah harus lebih dari 0');
      return;
    }
    
    if (volume > maxVolume) {
      alert(`Jumlah tidak dapat melebihi stock akhir (${maxVolume})`);
      return;
    }
    
    if (!takerName.trim()) {
      alert('Nama peminjam harus diisi');
      return;
    }
    
    // Save taker name to recent list
    const updatedTakers = [...recentTakers];
    if (!updatedTakers.includes(takerName)) {
      updatedTakers.unshift(takerName);
      // Keep only the most recent 10 takers
      if (updatedTakers.length > 10) updatedTakers.pop();
      setRecentTakers(updatedTakers);
      localStorage.setItem('recentTakers', JSON.stringify(updatedTakers));
    }
    
    // Call the onConfirm callback with the form data
    onConfirm({
      volume: Number(volume),
      taker_name: takerName
    });
    
    closeModal();
  };
  
  const selectTaker = (name) => {
    setTakerName(name);
    setShowDropdown(false);
  };
  
  if (!isOpen) return null;

  // Get the correct nama_barang from various possible property names
  const getItemName = () => {
    if (!item) return '';
    
    // Try to access the name from various property names that might exist
    return item.nama_barang || 
           item['Nama Barang'] || 
           item.name || 
           item.item_name || 
           'Unknown Item';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Pengurangan Stock</h2>
          <button className="close-button" onClick={closeModal}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nama Barang:</label>
              <input
                type="text"
                value={getItemName()}
                disabled
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>Stock Tersisa:</label>
              <input
                type="text"
                value={`${maxVolume} ${item?.satuan || 'Pcs'}`}
                disabled
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="volume">Jumlah Pengurangan:</label>
              <input
                type="number"
                id="volume"
                value={volume}
                onChange={(e) => setVolume(Math.min(maxVolume, Math.max(1, parseInt(e.target.value) || 0)))}
                min="1"
                max={maxVolume}
                required
                className="form-control"
              />
            </div>
            
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="takerName">Nama Peminjam:</label>
              <input
                type="text"
                id="takerName"
                value={takerName}
                onChange={(e) => setTakerName(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                required
                className="form-control"
                placeholder="Masukkan nama peminjam"
              />
              
              {showDropdown && recentTakers.length > 0 && (
                <div className="dropdown-list">
                  {recentTakers.map((name, index) => (
                    <div 
                      key={index} 
                      className="dropdown-item"
                      onClick={() => selectTaker(name)}
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="modal-buttons">
              <button type="button" className="cancel-button" onClick={closeModal}>
                Cancel
              </button>
              <button type="submit" className="main-button">
                Confirm
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default DecrementStockModal;