// ModalAssetPage.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaFileExcel } from 'react-icons/fa';
import { getKodeBarangs, getGedungs, importAsset } from "../services/api";

const ModalAssetPage = ({ 
  isOpen, 
  closeModal, 
  currentStep, 
  setCurrentStep, 
  handleSubmit,
  assetData = null,
  isEditMode = false,
  onImportSuccess
}) => {
  // Add state for tabs
  const [activeTab, setActiveTab] = useState('manual');
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Initialize form data with either existing asset data or empty values
  const [formData, setFormData] = useState({
    // Step 1 fields
    kodeBarang: '',
    namaBarang: '',
    merkBarang: '',
    jumlah: '1', 
    satuan: '',
    harga: '',
    kondisi: 'Baru', 
    lokasi: '',
    // Set today's date as default
    Tanggal: new Date().toISOString().split('T')[0], 
    
    // Step 2 Fields - optional
    SumberPerolehan: '',
    KoderingBelanja: '',
    NoSPKFakturKuitansi: '',
    NoBAPenerimaan: '',
    
    // Step 3 Fields - optional
    UmurEkonomis: '',
    NilaiPerolehan: '',
    BebanPenyusutan: '',
  });
  
  // Add state for kode barang options
  const [kodeOptions, setKodeOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // Replace hardcoded lokasi options with empty array
  const [lokasiOptions, setLokasiOptions] = useState([]);
  const [filteredLokasiOptions, setFilteredLokasiOptions] = useState([]);
  const [showLokasiDropdown, setShowLokasiDropdown] = useState(false);
  const [lokasiSearchTerm, setLokasiSearchTerm] = useState('');
  const [loadingLokasi, setLoadingLokasi] = useState(false);

  // Fetch kode barang options when component mounts
  useEffect(() => {
    const fetchKodeBarangOptions = async () => {
      try {
        setLoading(true);
        const response = await getKodeBarangs();
        
        // Process the response data to get the options
        let options = [];
        if (response && response.data) {
          options = response.data;
        } else if (Array.isArray(response)) {
          options = response;
        }
        
        setKodeOptions(options);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching kode barang options:", error);
        setLoading(false);
      }
    };
    
    fetchKodeBarangOptions();
  }, []);

  // Fetch location options from gedungs when component mounts
  useEffect(() => {
    const fetchLokasiOptions = async () => {
      try {
        setLoadingLokasi(true);
        const response = await getGedungs();
        
        // Process the response data to get the options
        let options = [];
        if (response && response.data) {
          // Extract the name property from each gedung object
          options = response.data.map(gedung => gedung.name || gedung.nama_gedung);
        } else if (Array.isArray(response)) {
          // Extract the name property from each gedung object
          options = response.map(gedung => gedung.name || gedung.nama_gedung);
        }
        
        setLokasiOptions(options.filter(Boolean)); // Filter out any undefined or null values
        setFilteredLokasiOptions(options.filter(Boolean));
        setLoadingLokasi(false);
      } catch (error) {
        console.error("Error fetching lokasi options:", error);
        setLokasiOptions([]);
        setFilteredLokasiOptions([]);
        setLoadingLokasi(false);
      }
    };
    
    fetchLokasiOptions();
  }, []);

  // Use effect to populate form when editing an asset
  useEffect(() => {
    if (isEditMode && assetData) {
      setFormData({
        // Step 1 fields - handle both frontend and backend data formats
        kodeBarang: assetData.kode_barang || assetData.kode || assetData.kodeBarang || '',
        namaBarang: assetData.nama_barang || assetData.namaBarang || '',
        merkBarang: assetData.merk_barang || assetData.merkBarang || '',
        jumlah: assetData.jumlah || '',
        satuan: assetData.satuan || '',
        harga: assetData.harga ? (
          typeof assetData.harga === 'string' && assetData.harga.includes('Rp') ?
          assetData.harga.replace('Rp.', '').replace(/\./g, '').trim() :
          assetData.harga.toString()
        ) : '',
        kondisi: assetData.kondisi || 'Baru',
        lokasi: assetData.lokasi || '',
        Tanggal: assetData.tanggal || new Date().toISOString().split('T')[0],

        // Step 2 fields
        SumberPerolehan: assetData.sumber_perolehan || 
                          (assetData.bpaData ? assetData.bpaData.sumberPerolehan : '') || '',
        KoderingBelanja: assetData.kode_rekening_belanja || 
                          (assetData.bpaData ? assetData.bpaData.kodeRekeningBelanja : '') || '',
        NoSPKFakturKuitansi: assetData.no_spk_faktur_kuitansi || 
                              (assetData.bpaData ? assetData.bpaData.no_spk_faktur_kuitansi : '') || '',
        NoBAPenerimaan: assetData.no_bast || 
                          (assetData.bpaData ? assetData.bpaData.noBAST : '') || '',

        // Step 3 fields
        UmurEkonomis: assetData.umur_ekonomis || 
                      (assetData.asetData ? assetData.asetData.umurEkonomis : '') || '',
        NilaiPerolehan: assetData.nilai_perolehan || 
                        (assetData.asetData ? assetData.asetData.nilaiPerolehan : '') || '',
        BebanPenyusutan: assetData.beban_penyusutan || 
                          (assetData.asetData ? assetData.asetData.bebanPenyusutan : '') || '',
      });
      
      // If editing, set the search term to current kode for filtering
      if (assetData.kode_barang || assetData.kode || assetData.kodeBarang) {
        setSearchTerm(assetData.kode_barang || assetData.kode || assetData.kodeBarang);
      }
      
      // Force manual tab when editing
      setActiveTab('manual');
    }
  }, [isEditMode, assetData]);

  // Filter options based on search term - update to search by both kode and name
  useEffect(() => {
    if (searchTerm) {
      const filtered = kodeOptions.filter(option => 
        option.kode.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (option.uraian && option.uraian.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (option.nama && option.nama.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(kodeOptions);
    }
  }, [searchTerm, kodeOptions]);

  // Filter lokasi options based on search term
  useEffect(() => {
    if (lokasiSearchTerm && lokasiOptions.length > 0) {
      const filtered = lokasiOptions.filter(option => 
        option && option.toLowerCase().includes(lokasiSearchTerm.toLowerCase())
      );
      setFilteredLokasiOptions(filtered);
    } else {
      setFilteredLokasiOptions(lokasiOptions);
    }
  }, [lokasiSearchTerm, lokasiOptions]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'kodeBarang') {
      setSearchTerm(value);
      setShowDropdown(true);
    } else if (name === 'lokasi') {
      setLokasiSearchTerm(value);
      setShowLokasiDropdown(true);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle option selection from dropdown - populate both kode and nama
  const handleOptionSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      kodeBarang: option.kode,
      namaBarang: option.uraian || option.nama || ''
    }));
    setSearchTerm(option.kode);
    setShowDropdown(false);
  };

  // Add function to handle lokasi selection
  const handleLokasiSelect = (lokasi) => {
    setFormData(prev => ({
      ...prev,
      lokasi: lokasi
    }));
    setLokasiSearchTerm(lokasi);
    setShowLokasiDropdown(false);
  };

  // Handle file change for import
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setImportError('');
    
    if (selectedFile) {
      console.log('File selected:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`
      });
    }
  };

  // Handle import submit
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setImportError('Please select a file first');
      return;
    }
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setImportError('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }
    
    try {
      setIsImporting(true);
      setImportError('');
      
      await importAsset(file);
      
      setFile(null);
      closeModal();
      
      // Call onImportSuccess to refresh data in the parent component
      if (onImportSuccess) {
        onImportSuccess();
      }
      
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
          setImportError(errorMsg);
        } else {
          setImportError(error.response.data.message || 'Validation failed. Please check your file.');
        }
      } else {
        setImportError(error.response?.data?.message || 'Failed to import file. Please try again.');
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Update handleFormSubmit to properly handle optional fields
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Default date format in case it's not provided
    const defaultFormattedDate = new Date().toISOString().split('T')[0];
    
    // Make sure all string fields are sent as empty strings, not null or undefined
    const processedFormData = {
      // Step 1 fields - required
      kode: String(formData.kodeBarang || ''),
      nama_gedung: String(formData.lokasi || ''),
      merk_barang: String(formData.merkBarang || ''),
      jumlah: Number(formData.jumlah || 0),
      satuan: String(formData.satuan || ''),
      harga: Number(formData.harga || 0),
      kondisi: String(formData.kondisi || 'Baru'),
      tanggal_pembelian: String(formData.Tanggal) || defaultFormattedDate,
      
      // Step 2 fields - optional but must be valid strings or excluded
      // Only include if they have values, otherwise exclude them from the request
      ...(formData.KoderingBelanja ? { kode_rekening_belanja: String(formData.KoderingBelanja) } : {}),
      ...(formData.NoSPKFakturKuitansi ? { no_spk_faktur_kuitansi: String(formData.NoSPKFakturKuitansi) } : {}),
      ...(formData.NoBAPenerimaan ? { no_bast: String(formData.NoBAPenerimaan) } : {}),
      ...(formData.SumberPerolehan ? { sumber_perolehan: String(formData.SumberPerolehan) } : {}),
      
      // Step 3 fields - optional but must be valid numbers or excluded
      ...(formData.UmurEkonomis ? { umur_ekonomis: Number(formData.UmurEkonomis) } : {}),
      ...(formData.NilaiPerolehan ? { nilai_perolehan: Number(formData.NilaiPerolehan) } : {}),
      ...(formData.BebanPenyusutan ? { beban_penyusutan: Number(formData.BebanPenyusutan) } : {})
    };
    
    // Validate only the required fields from Step 1
    const requiredFields = [
      { key: 'kode', label: 'Kode Barang' },
      { key: 'nama_gedung', label: 'Lokasi' },
      { key: 'merk_barang', label: 'Merk Barang' },
      { key: 'satuan', label: 'Satuan' },
      { key: 'tanggal_pembelian', label: 'Tanggal' }
    ];
    
    const emptyFields = requiredFields.filter(field => {
      if (typeof processedFormData[field.key] === 'string') {
        return !processedFormData[field.key];
      }
      return false;
    });
    
    if (emptyFields.length > 0) {
      const fieldLabels = emptyFields.map(f => f.label).join(', ');
      alert(`Please fill in all required fields: ${fieldLabels}`);
      return;
    }
    
    handleSubmit(processedFormData);
  };

  // Validate only the Step 1 fields, since steps 2 and 3 are now optional
  const validateStep = (step) => {
    if (step === 1) {
      const requiredFields = [
        { key: 'kodeBarang', label: 'Kode Barang' },
        { key: 'namaBarang', label: 'Nama Barang' },
        { key: 'merkBarang', label: 'Merk Barang' },
        { key: 'satuan', label: 'Satuan' },
        { key: 'lokasi', label: 'Lokasi' },
        { key: 'Tanggal', label: 'Tanggal' }
      ];
      
      const missingFields = requiredFields.filter(field => {
        // Check if the field exists and is not empty
        const value = formData[field.key];
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (typeof value === 'number') return isNaN(value) || value === 0;
        return true;
      });
      
      if (missingFields.length > 0) {
        const fieldLabels = missingFields.map(f => f.label).join(', ');
        alert(`Please fill in the following required fields: ${fieldLabels}`);
        return false;
      }
    }
    // Steps 2 and 3 are optional, so always return true for those steps
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      // Reset form when closing
      setFormData({
        kodeBarang: '',
        namaBarang: '',
        merkBarang: '',
        jumlah: '1',
        satuan: '',
        harga: '',
        kondisi: 'Baru',
        lokasi: '',
        // Set today's date as default
        Tanggal: new Date().toISOString().split('T')[0],
        SumberPerolehan: '',
        KoderingBelanja: '',
        NoSPKFakturKuitansi: '',
        NoBAPenerimaan: '',
        UmurEkonomis: '',
        NilaiPerolehan: '',
        BebanPenyusutan: '',
      });
      setCurrentStep(1);
      setActiveTab('manual');
      setFile(null);
      setImportError('');
    }
  }, [isOpen, setCurrentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBreadcrumbs = () => {
    const steps = [
      { label: "1. Info Barang", step: 1 },
      { label: "2. Info BA Penerimaan", step: 2 },
      { label: "3. Info Aset", step: 3 },
    ];

    return (
      <div className="breadcrumb">
        {steps.map((s) => (
          <div key={s.step} className={`breadcrumb-item ${currentStep >= s.step ? "active" : ""}`}>
            {s.label}
          </div>
        ))}
      </div>
    );
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
      contentLabel="Add Asset Modal"
    >
      <h2 style={{ textAlign: "center" }}>{isEditMode ? 'Edit Asset' : 'Add New Asset'}</h2>
      
      {!isEditMode && (
        <div className="modal-tabs" style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
          <button 
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: activeTab === 'manual' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'manual' ? 'white' : '#333',
              cursor: 'pointer'
            }}
          >
            Manual Input
          </button>
          <button 
            className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
            onClick={() => setActiveTab('import')}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              backgroundColor: activeTab === 'import' ? '#007bff' : '#f8f9fa',
              color: activeTab === 'import' ? 'white' : '#333',
              cursor: 'pointer' // tes
            }}
          >
            Import Excel 
          </button>
        </div>
      )}

      {activeTab === 'manual' ? (
        <>
          {renderBreadcrumbs()}
          <form onSubmit={handleFormSubmit}>
            {currentStep === 1 && (
              <div className="step-content">
                <div className="form-group">
                  <label htmlFor="kodeBarang">Kode Barang (ID)</label>
                  <div className="dropdown-container-form">
                    <input
                      type="text"
                      id="kodeBarang"
                      name="kodeBarang"
                      value={searchTerm}
                      onChange={handleInputChange}
                      onClick={() => setShowDropdown(true)}
                      autoComplete="off"
                      required
                      placeholder="Search by code only..."
                    />
                    {loading && <div className="loading-indicator">Loading codes...</div>}
                    {showDropdown && filteredOptions.length > 0 && (
                      <ul className="dropdown-list">
                        {filteredOptions.map((option, index) => (
                          <li 
                            key={index} 
                            onClick={() => handleOptionSelect(option)}
                            className="dropdown-item"
                          >
                            <strong>{option.kode}</strong>
                            {option.uraian || option.nama ? ` - ${option.uraian || option.nama}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    {showDropdown && filteredOptions.length === 0 && !loading && (
                      <div className="no-options">No matching codes found</div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="namaBarang">Nama Barang</label>
                  <input
                    type="text"
                    id="namaBarang"
                    name="namaBarang"
                    value={formData.namaBarang || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="merkBarang">Merk Barang</label>
                  <input
                    type="text"
                    id="merkBarang"
                    name="merkBarang"
                    value={formData.merkBarang || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="jumlah">Jumlah</label>
                  <input
                    type="number"
                    id="jumlah"
                    name="jumlah"
                    value={formData.jumlah || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="satuan">Satuan</label>
                  <input
                    type="text"
                    id="satuan"
                    name="satuan"
                    value={formData.satuan || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="harga">Harga (Rupiah)</label>
                  <input
                    type="number"
                    id="harga"
                    name="harga"
                    value={formData.harga || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="kondisi">Kondisi</label>
                  <select
                    id="kondisi"
                    name="kondisi"
                    value={formData.kondisi || 'Baru'}
                    onChange={handleInputChange}
                    required
                    className="form-select"
                  >
                    <option value="Baru">Baru</option>
                    <option value="Pemakaian Ringan">Pemakaian Ringan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="lokasi">Lokasi</label>
                  <div className="dropdown-container-form">
                    <input
                      type="text"
                      id="lokasi"
                      name="lokasi"
                      value={formData.lokasi || lokasiSearchTerm}
                      onChange={handleInputChange}
                      onClick={() => setShowLokasiDropdown(true)}
                      autoComplete="off"
                      required
                      placeholder="Search location..."
                    />
                    {loadingLokasi && <div className="loading-indicator">Loading locations...</div>}
                    {showLokasiDropdown && filteredLokasiOptions && filteredLokasiOptions.length > 0 && (
                      <ul className="dropdown-list">
                        {filteredLokasiOptions.map((option, index) => (
                          <li 
                            key={index} 
                            onClick={() => handleLokasiSelect(option)}
                            className="dropdown-item"
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {showLokasiDropdown && filteredLokasiOptions.length === 0 && !loadingLokasi && (
                      <div className="no-options">No matching locations found</div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="Tanggal">Tanggal Pembelian</label>
                  <input
                    type="date"
                    id="Tanggal"
                    name="Tanggal"
                    value={formData.Tanggal || ''}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="modal-buttons">
                  <button type="button" className="secondary-button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="main-button" onClick={handleNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <div className="form-group">
                  <label htmlFor="SumberPerolehan">Sumber Perolehan (Optional)</label>
                  <input
                    type="text"
                    id="SumberPerolehan"
                    name="SumberPerolehan"
                    value={formData.SumberPerolehan || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="KoderingBelanja">Kode Rekening Belanja (Optional)</label>
                  <input
                    type="text"
                    id="KoderingBelanja"
                    name="KoderingBelanja"
                    value={formData.KoderingBelanja || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="NoSPKFakturKuitansi">No SPK/Faktur/Kuitansi (Optional)</label>
                  <input
                    type="text"
                    id="NoSPKFakturKuitansi"
                    name="NoSPKFakturKuitansi"
                    value={formData.NoSPKFakturKuitansi || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="NoBAPenerimaan">No BA Penerimaan (Optional)</label>
                  <input
                    type="text"
                    id="NoBAPenerimaan"
                    name="NoBAPenerimaan"
                    value={formData.NoBAPenerimaan || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="button" className="secondary-button" onClick={handleBack}>
                    Back
                  </button>
                  <button type="button" className="main-button" onClick={handleNext}>
                    Next
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="step-content">
                <div className="form-group">
                  <label htmlFor="UmurEkonomis">Umur Ekonomis (Optional)</label>
                  <input
                    type="number"
                    id="UmurEkonomis"
                    name="UmurEkonomis"
                    value={formData.UmurEkonomis || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="NilaiPerolehan">Nilai Perolehan (Optional)</label>
                  <input
                    type="number"
                    id="NilaiPerolehan"
                    name="NilaiPerolehan"
                    value={formData.NilaiPerolehan || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="BebanPenyusutan">Beban Penyusutan (Optional)</label>
                  <input
                    type="number"
                    id="BebanPenyusutan"
                    name="BebanPenyusutan"
                    value={formData.BebanPenyusutan || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-buttons">
                  <button type="button" className="secondary-button" onClick={handleBack}>
                    Back
                  </button>
                  <button type="submit" className="main-button">
                    {isEditMode ? 'Update Asset' : 'Add Asset'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </>
      ) : (
        <form onSubmit={handleImportSubmit}>
          <div className="import-container" style={{ textAlign: 'center', padding: '20px' }}>
            <FaFileExcel size={40} style={{ color: '#1D6F42', marginBottom: '15px' }} />
            <p>Import assets from Excel file</p>
            <p style={{ fontSize: '14px', color: '#666' }}>Format yang didukung: .xlsx, .xls</p>
            
            <div style={{ 
              margin: '15px 0', 
              padding: '15px', 
              border: '1px solid #ddd', 
              borderRadius: '5px', 
              backgroundColor: '#f9f9f9',
              textAlign: 'left'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Persyaratan File:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '3px' }}>File Excel (.xlsx atau .xls)</li>
                <li style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '3px' }}>Harus memiliki kolom sesuai dengan contoh yang diberikan</li>
                <li style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '3px' }}>Baris pertama harus berupa header</li>
                <li style={{ fontSize: '14px', lineHeight: '1.5', marginBottom: '3px' }}>Ukuran file maksimal: 10MB</li>
              </ul>
            </div>
            
            {importError && (
              <div style={{ 
                color: '#dc3545', 
                backgroundColor: '#f8d7da', 
                padding: '10px', 
                borderRadius: '5px',
                marginBottom: '15px',
                whiteSpace: 'pre-line'
              }}>
                {importError}
              </div>
            )}
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="file"
                id="assetFile"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label 
                htmlFor="assetFile" 
                style={{
                  display: 'inline-block',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  border: 'none'
                }}
              >
                {file ? file.name : 'Pilih File Excel (.xlsx, .xls)'}
              </label>
              {file && (
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Ukuran file: {(file.size / 1024).toFixed(2)} KB
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="secondary-button" 
                onClick={closeModal}
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="main-button"
                disabled={!file || isImporting}
              >
                {isImporting ? 'Mengimpor...' : 'Import'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ModalAssetPage;