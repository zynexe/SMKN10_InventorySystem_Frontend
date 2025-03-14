import React, { useState, useEffect } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { importKodeBarang } from '../services/api';
import '../CSS/KodeBarangModal.css';

const KodeBarangModal = ({ isOpen, onClose, onAdd, isEditing = false, currentItem = null }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [kodeBarang, setKodeBarang] = useState('');
  const [namaBarang, setNamaBarang] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Set form values when editing an existing item
  useEffect(() => {
    if (isEditing && currentItem) {
      setKodeBarang(currentItem.kode || '');
      // Check for either nama or uraian field, depending on what the backend returns
      setNamaBarang(currentItem.uraian || currentItem.nama || '');
      // Force manual tab when editing
      setActiveTab('manual');
    } else {
      // Reset form when not editing
      setKodeBarang('');
      setNamaBarang('');
    }
  }, [isEditing, currentItem, isOpen]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Use the correct field name 'uraian' instead of 'nama'
    onAdd({
      kode: kodeBarang.trim(),
      uraian: namaBarang.trim()  // Changed from 'nama' to 'uraian'
    });
    
    // Reset form
    setKodeBarang('');
    setNamaBarang('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrorMessage('');
    
    // Log file details for debugging
    if (selectedFile) {
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`
      });
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMessage('Please select a file first');
      return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMessage('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      
      await importKodeBarang(file);
      
      setFile(null);
      onClose();
      
      // Show success message
      alert('File imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      
      // Enhanced error handling
      if (error.response && error.response.status === 422) {
        // Validation error
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          let errorMsg = "Validation error:\n";
          Object.keys(validationErrors).forEach(field => {
            errorMsg += `- ${validationErrors[field].join('\n- ')}\n`;
          });
          setErrorMessage(errorMsg);
        } else {
          setErrorMessage(error.response.data.message || 'Validation failed. Please check your file.');
        }
      } else {
        setErrorMessage(error.response?.data?.message || 'Failed to import file. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Kode Barang' : 'Add Kode Barang'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {!isEditing && (
          <div className="modal-tabs">
            <button 
              className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
              onClick={() => setActiveTab('manual')}
            >
              Manual Input
            </button>
            <button 
              className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              Import Excel
            </button>
          </div>
        )}

        <div className="modal-content">
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
          
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label htmlFor="kodeBarang">Kode Barang:</label>
                <input
                  type="text"
                  id="kodeBarang"
                  value={kodeBarang}
                  onChange={(e) => setKodeBarang(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="namaBarang">Nama Barang:</label>
                <input
                  type="text"
                  id="namaBarang"
                  value={namaBarang}
                  onChange={(e) => setNamaBarang(e.target.value)}
                  required
                />
              </div>
              <div className="form-buttons">
                <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                <button 
                  type="submit" 
                  className={`submit-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : (isEditing ? 'Update' : 'Add Item')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleImportSubmit}>
              <div className="import-container">
                <FaFileExcel size={40} className="excel-icon" />
                <p>Import data from Excel file</p>
                <p className="file-format-note">Supported format: .xlsx, .xls</p>
                
                <div className="file-input-container">
                  <input
                    type="file"
                    id="excelFile"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    aria-label="Upload Excel file (.xlsx or .xls)"
                  />
                  <label htmlFor="excelFile" className="file-input-label">
                    {file ? file.name : 'Choose Excel File (.xlsx, .xls)'}
                  </label>
                  {file && (
                    <div className="file-info">
                      File size: {(file.size / 1024).toFixed(2)} KB
                    </div>
                  )}
                </div>
                
                <div className="form-buttons">
                  <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                  <button 
                    type="submit" 
                    className={`submit-button ${isLoading ? 'loading' : ''}`}
                    disabled={!file || isLoading}
                  >
                    {isLoading ? 'Importing...' : 'Import'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default KodeBarangModal;