import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaFileExcel } from 'react-icons/fa';
import { getKodeRekenings, importBHP } from "../services/api"; 

const ModalBHPPage = ({ 
  isOpen, 
  closeModal, 
  handleSubmit,
  bhpData = null,
  isEditMode = false,
  onImportSuccess
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('manual');
  const [formData, setFormData] = useState({
    nama_barang: '',
    kode_rekening: '',
    merk: '',
    tanggal: new Date().toISOString().split('T')[0],
    stock_awal: '0',
    harga_satuan: '0',
    satuan: 'Pcs' // Add default satuan value
  });
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // State for kode rekening dropdown
  const [kodeRekeningOptions, setKodeRekeningOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingKodeRekening, setLoadingKodeRekening] = useState(false);

  // Fetch kode rekening options when component mounts
  useEffect(() => {
    const fetchKodeRekeningOptions = async () => {
      try {
        setLoadingKodeRekening(true);
        const response = await getKodeRekenings();
        
        // Process the response data to get the options
        let options = [];
        if (response && response.data) {
          options = response.data;
        } else if (Array.isArray(response)) {
          options = response;
        }
        
        setKodeRekeningOptions(options);
        setFilteredOptions(options);
        setLoadingKodeRekening(false);
      } catch (error) {
        console.error("Error fetching kode rekening options:", error);
        setLoadingKodeRekening(false);
      }
    };
    
    if (isOpen) {
      fetchKodeRekeningOptions();
    }
  }, [isOpen]);

  // Populate form data when editing an existing BHP item
  useEffect(() => {
    if (isEditMode && bhpData) {
      setFormData({
        nama_barang: bhpData.nama_barang || '',
        kode_rekening: bhpData.kode_rekening || '',
        merk: bhpData.merk || '',
        tanggal: bhpData.tanggal || new Date().toISOString().split('T')[0],
        stock_awal: bhpData.stock_awal?.toString() || '0',
        harga_satuan: bhpData.harga_satuan?.toString() || '0',
        satuan: bhpData.satuan || 'Pcs' // Include satuan with fallback
      });
      
      // If editing, set the search term to current kode_rekening for filtering
      if (bhpData.kode_rekening) {
        setSearchTerm(bhpData.kode_rekening);
      }
    }
  }, [isEditMode, bhpData]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nama_barang: '',
        kode_rekening: '',
        merk: '',
        tanggal: new Date().toISOString().split('T')[0],
        stock_awal: '0',
        harga_satuan: '0',
        satuan: 'Pcs' // Include default satuan
      });
      setFile(null);
      setErrorMessage('');
      setActiveTab('manual');
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm && kodeRekeningOptions.length > 0) {
      const filtered = kodeRekeningOptions.filter(option => 
        option.kode?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        option.uraian?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(kodeRekeningOptions);
    }
  }, [searchTerm, kodeRekeningOptions]);

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'kode_rekening') {
      setSearchTerm(value);
      setShowDropdown(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle selection of kode rekening from dropdown
  const handleOptionSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      kode_rekening: option.kode,
      nama_barang: prev.nama_barang || option.uraian // Only set nama_barang if it's empty
    }));
    setSearchTerm(option.kode);
    setShowDropdown(false);
  };

  // Handle file selection for import
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setErrorMessage('');
  };

  // Handle form submission for manual input
  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    // Validate form inputs
    if (!formData.nama_barang || !formData.kode_rekening || !formData.merk) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    // Process the form data to match backend expectations
    const processedData = {
      nama_barang: formData.nama_barang,
      kode_rekening: formData.kode_rekening, // Use as direct string ID now
      merk: formData.merk,
      tanggal: formData.tanggal,
      stock_awal: parseInt(formData.stock_awal, 10) || 0, 
      harga_satuan: parseInt(formData.harga_satuan, 10) || 0,
      satuan: formData.satuan || 'Pcs', // Include satuan field
    };
    
    handleSubmit(processedData);
  };

  // Handle form submission for import
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
      
      // Call real API to import the file
      const result = await importBHP(file);
      console.log('Import result:', result);
      
      setIsLoading(false);
      
      // Always fetch fresh data after import
      if (onImportSuccess) {
        // The importBHP function now returns the fresh data
        onImportSuccess(result);
      }
      
      closeModal();
    } catch (error) {
      console.error('Import error:', error);
      setErrorMessage(`Failed to import: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      width: "580px",
      maxWidth: "90vw",
      maxHeight: "90vh",
      padding: "20px",
      overflow: "auto",
      display: "flex",
      flexDirection: "column",
      "@media (max-width: 768px)": {
        width: "95vw",
        padding: "10px",
      },
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 1000,
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add BHP Modal"
    >
      <h2 style={{ textAlign: "center" }}>{isEditMode ? 'Edit BHP Item' : 'Add New BHP Item'}</h2>
      
      {/* Tab navigation - show only if not in edit mode */}
      {!isEditMode && (
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

      {/* Error message display */}
      {errorMessage && (
        <div className="error-message" style={{color: 'red', margin: '10px 0'}}>
          {errorMessage}
        </div>
      )}
      
      {/* Manual Input Form */}
      {(activeTab === 'manual' || isEditMode) && (
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label htmlFor="kode_rekening">Kode Rekening</label>
            <div className="dropdown-container-form">
              <input
                type="text"
                id="kode_rekening"
                name="kode_rekening"
                value={searchTerm}
                onChange={handleInputChange}
                onClick={() => setShowDropdown(true)}
                autoComplete="off"
                required
                placeholder="Search by code..."
              />
              {loadingKodeRekening && <div className="loading-indicator">Loading codes...</div>}
              {showDropdown && filteredOptions.length > 0 && (
                <ul className="dropdown-list">
                  {filteredOptions.map((option, index) => (
                    <li 
                      key={option.id || index} 
                      onClick={() => handleOptionSelect(option)}
                      className="dropdown-item"
                    >
                      <strong>{option.kode}</strong>
                      {option.uraian ? ` - ${option.uraian}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              {showDropdown && filteredOptions.length === 0 && !loadingKodeRekening && (
                <div className="no-options">No matching codes found</div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="nama_barang">Nama Barang</label>
            <input
              type="text"
              id="nama_barang"
              name="nama_barang"
              value={formData.nama_barang}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="merk">Merk</label>
            <input
              type="text"
              id="merk"
              name="merk"
              value={formData.merk}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tanggal">Tanggal</label>
            <input
              type="date"
              id="tanggal"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="stock_awal">Stock Awal</label>
            <input
              type="number"
              id="stock_awal"
              name="stock_awal"
              value={formData.stock_awal}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="satuan">Satuan</label>
            <input
              type="text"
              id="satuan"
              name="satuan"
              value={formData.satuan}
              onChange={handleInputChange}
              required
              placeholder="e.g., Pcs, Unit, Box"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="harga_satuan">Harga Satuan (Rp)</label>
            <input
              type="number"
              id="harga_satuan"
              name="harga_satuan"
              value={formData.harga_satuan}
              onChange={handleInputChange}
              required
              min="0"
            />
          </div>
          
          <div className="modal-buttons">
            <button type="button" className="secondary-button" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="main-button">
              {isEditMode ? 'Update' : 'Add'} Item
            </button>
          </div>
        </form>
      )}
      
      {/* Import Excel Form */}
      {activeTab === 'import' && !isEditMode && (
        <form onSubmit={handleImportSubmit}>
          <div className="import-container" style={{textAlign: 'center', padding: '20px 0'}}>
            <FaFileExcel size={40} style={{color: '#1D6F42', marginBottom: '15px'}} />
            <p>Import BHP data from Excel file</p>
            <p style={{fontSize: '0.8rem', color: '#666', marginBottom: '20px'}}>
              Supported formats: .xlsx, .xls
            </p>
            
            <div className="file-input-container" style={{margin: '20px 0'}}>
              <input
                type="file"
                id="bhpExcelFile"
                name="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{marginBottom: '10px'}}
              />
              <label htmlFor="bhpExcelFile" style={{
                display: 'block',
                padding: '10px',
                border: '1px dashed #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                backgroundColor: '#f9f9f9'
              }}>
                {file ? file.name : 'Choose Excel File (.xlsx, .xls)'}
              </label>
              {file && (
                <div className="file-info" style={{fontSize: '0.8rem', marginTop: '5px'}}>
                  File size: {(file.size / 1024).toFixed(2)} KB
                </div>
              )}
            </div>
            
            <div className="file-requirements" style={{
              backgroundColor: '#f7f7f7',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <h4>Excel File Requirements:</h4>
              <ul style={{paddingLeft: '20px', fontSize: '0.9rem'}}>
                <li>First row must contain column headers</li>
                <li>Required columns: nama_barang, kode_rekening, merk, tanggal, stock_awal, harga_satuan</li>
                <li>Dates should be in format DD/MM/YYYY</li>
                <li>Maximum file size: 10MB</li>
              </ul>
            </div>
            
            <div className="modal-buttons">
              <button type="button" className="secondary-button" onClick={closeModal}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="main-button"
                disabled={!file || isLoading}
              >
                {isLoading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ModalBHPPage;