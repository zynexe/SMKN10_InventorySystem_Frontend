import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import '../CSS/Asset.css';
import { createPeminjamanAset } from '../services/api';

Modal.setAppElement('#root'); // This is needed for accessibility

const PinjamModal = ({ isOpen, closeModal, assetData, onSubmit, previousBorrowers = [] }) => {
  // Default state for the form
  const [formData, setFormData] = useState({
    nama_pengambil: '',
    jenis: 'pinjam', // Default to borrow (pinjam) - CHANGED from status to jenis
    jumlah: 1,
    keperluan: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Update form when modal opens with new asset data
  useEffect(() => {
    if (isOpen && assetData) {
      setFormData({
        ...formData,
        jumlah: 1, // Reset to default
        nama_pengambil: '', // Clear previous input
        keperluan: '', // Clear previous input
        jenis: 'pinjam', // Reset to default
      });
      setError(null);
    }
  }, [isOpen, assetData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // For jumlah field, ensure it's not more than available stock
    if (name === 'jumlah') {
      const maxStock = assetData?.jumlah || 1;
      const numValue = parseInt(value) || 0;
      
      if (numValue > maxStock) {
        alert(`Jumlah tidak boleh melebihi stok tersedia (${maxStock} ${assetData?.satuan || 'unit'})`);
        return;
      }
      
      if (numValue <= 0) {
        alert('Jumlah harus minimal 1');
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Map jenis to status for UI display
  const getStatusFromJenis = (jenis) => {
    switch(jenis) {
      case 'pinjam':
        return 'Dipinjam';
      case 'ambil':
        return 'Diambil';
      default:
        return 'Dipinjam';
    }
  };

  // Handle form submission with API integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get the asset ID
      const assetId = assetData?.id || assetData?.no;
      
      if (!assetId) {
        throw new Error('Asset ID tidak ditemukan');
      }
      
      // Prepare the payload for API
      const payload = {
        nama_peminjam: formData.nama_pengambil,
        volume: parseInt(formData.jumlah),
        keperluan: formData.keperluan,
        jenis: formData.jenis // FIXED: Using jenis field instead of status
      };
      
      // Call API to create peminjaman
      const response = await createPeminjamanAset(assetId, payload);
      
      // Format the response for display in the Pinjam table
      const result = {
        id: response.id || Date.now(), // Use API response ID or fallback
        tanggal: response.tanggal_pinjam || new Date().toLocaleDateString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        nama_barang: assetData?.nama_barang || assetData?.namaBarang,
        jumlah: parseInt(formData.jumlah),
        satuan: assetData?.satuan,
        keperluan: formData.keperluan,
        nama_pengambil: formData.nama_pengambil,
        tanggal_kembali: '-', // Default for not returned yet
        status: getStatusFromJenis(formData.jenis), // Convert jenis to display status
        jenis: formData.jenis, // Keep original jenis value
        asset_id: assetId
      };
      
      // Pass the formatted data to the parent component
      onSubmit(result);
      closeModal();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Terjadi kesalahan saat memproses permintaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom modal styles
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '500px',
      maxWidth: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '20px',
      borderRadius: '8px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1000
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Pinjam Asset Modal"
    >
      <div className="modal-header">
        <h2>Pinjam / Berikan Asset</h2>
      </div>
      
      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Asset Information (readonly) */}
        <div className="form-group">
          <label htmlFor="nama_barang">Nama Barang</label>
          <input
            type="text"
            id="nama_barang"
            value={assetData?.nama_barang || assetData?.namaBarang || ''}
            readOnly
            className="readonly-field"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stok">Stok Tersisa</label>
          <input
            type="text"
            id="stok"
            value={`${assetData?.jumlah || ''} ${assetData?.satuan || ''}`}
            readOnly
            className="readonly-field"
          />
        </div>
        
        {/* Borrower Information */}
        <div className="form-group">
          <label htmlFor="nama_pengambil">Nama Pengambil <span className="required">*</span></label>
          {previousBorrowers.length > 0 ? (
            <div className="input-with-dropdown">
              <input
                list="borrowers-list"
                type="text"
                id="nama_pengambil"
                name="nama_pengambil"
                value={formData.nama_pengambil}
                onChange={handleInputChange}
                required
                placeholder="Masukkan nama pengambil"
              />
              <datalist id="borrowers-list">
                {previousBorrowers.map((borrower, index) => (
                  <option key={index} value={borrower} />
                ))}
              </datalist>
            </div>
          ) : (
            <input
              type="text"
              id="nama_pengambil"
              name="nama_pengambil"
              value={formData.nama_pengambil}
              onChange={handleInputChange}
              required
              placeholder="Masukkan nama pengambil"
            />
          )}
        </div>
        
        {/* Jenis Selection - CHANGED from status to jenis */}
        <div className="form-group">
          <label htmlFor="jenis">Pinjam/Ambil <span className="required">*</span></label>
          <select
            id="jenis"
            name="jenis"
            value={formData.jenis}
            onChange={handleInputChange}
            required
          >
            <option value="pinjam">Dipinjam</option>
            <option value="ambil">Diambil</option>
          </select>
        </div>
        
        {/* Volume/Quantity */}
        <div className="form-group">
          <label htmlFor="jumlah">Volume <span className="required">*</span></label>
          <input
            type="number"
            id="jumlah"
            name="jumlah"
            value={formData.jumlah}
            onChange={handleInputChange}
            min="1"
            max={assetData?.jumlah}
            required
          />
        </div>
        
        {/* Purpose */}
        <div className="form-group">
          <label htmlFor="keperluan">Keperluan <span className="required">*</span></label>
          <textarea
            id="keperluan"
            name="keperluan"
            value={formData.keperluan}
            onChange={handleInputChange}
            rows="3"
            required
            placeholder="Masukkan tujuan peminjaman/pengambilan"
          ></textarea>
        </div>
        
        {/* Button Controls */}
        <div className="modal-buttons">
          <button 
            type="button" 
            onClick={closeModal} 
            className="secondary-button"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="main-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PinjamModal;