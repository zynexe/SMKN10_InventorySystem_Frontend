import React, { useState, useEffect } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { importKodeRekening } from '../services/api';
import axios from 'axios';
import '../CSS/KodeBarangModal.css'; // Reuse the same CSS

const KodeRekeningModal = ({ isOpen, onClose, onAdd, isEditing = false, currentItem = null, onImportSuccess }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [kodeRekening, setKodeRekening] = useState('');
  const [uraian, setUraian] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEditing && currentItem) {
        setKodeRekening(currentItem.kode || '');
        setUraian(currentItem.uraian || '');
        setActiveTab('manual');
      } else {
        setKodeRekening('');
        setUraian('');
      }
      setErrorMessage('');
    }
  }, [isEditing, currentItem, isOpen]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    onAdd({
      kode: kodeRekening.trim(),
      uraian: uraian.trim()
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrorMessage('');
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
      
      // Create FormData and use 'file' as the field name as required by backend
      const formData = new FormData();
      formData.append('file', file); // Changed from 'xlsx_file' to 'file'
      
      // For debugging - log what we're sending
      console.log('Sending file:', file.name, file.type, file.size);
      
      // Make direct API call for better error handling
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:8000/api/kode-rekening/import', 
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      
      console.log('Import successful:', response.data);
      
      setFile(null);
      onClose();
      
      if (onImportSuccess) {
        onImportSuccess();
      }
      
      alert('File imported successfully');
    } catch (error) {
      console.error('Import error:', error);
      
      if (error.response) {
        console.log('Error response:', error.response);
        console.log('Error data:', error.response.data);
        
        // Check for validation errors in the response
        if (error.response.status === 422) {
          if (error.response.data && error.response.data.errors) {
            // Format validation errors
            const errorMessages = Object.entries(error.response.data.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            
            setErrorMessage(`Validation error:\n${errorMessages}`);
          } else if (error.response.data && error.response.data.message) {
            setErrorMessage(`Error: ${error.response.data.message}`);
          } else {
            setErrorMessage('The server rejected the file. Please check the file format and try again.');
          }
        } else {
          setErrorMessage(`Server error: ${error.response.status} - ${error.response.statusText}`);
        }
      } else {
        setErrorMessage(`Error: ${error.message || 'Unknown error occurred'}`);
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
          <h3>{isEditing ? 'Edit Kode Rekening' : 'Tambah Kode Rekening'}</h3>
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
            <div className="error-message" style={{whiteSpace: 'pre-line'}}>
              {errorMessage}
            </div>
          )}
          
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit}>
              <div className="form-group">
                <label htmlFor="kodeRekening">Kode Rekening:</label>
                <input
                  type="text"
                  id="kodeRekening"
                  value={kodeRekening}
                  onChange={(e) => setKodeRekening(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="uraian">Uraian:</label>
                <input
                  type="text"
                  id="uraian"
                  value={uraian}
                  onChange={(e) => setUraian(e.target.value)}
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
                  {isLoading ? 'Processing...' : (isEditing ? 'Update' : 'Tambah')}
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
                    name="file" // Changed from 'xlsx_file' to 'file' to match backend expectation
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
                
                 <div className="file-requirements-note">
                  <h4>Persyaratan File:</h4>
                  <ul>
                    <li>File Excel (.xlsx atau .xls)</li>
                    <li>Harus memiliki kolom: 'kode' dan 'uraian'</li>
                    <li>Baris pertama harus berupa header</li>
                    <li>Ukuran file maksimal: 10MB</li>
                  </ul>
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

export default KodeRekeningModal;