// ModalAssetPage.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { getKodeBarangs, getGedungs } from "../services/api"; // Add getGedungs import

const ModalAssetPage = ({ 
  isOpen, 
  closeModal, 
  currentStep, 
  setCurrentStep, 
  handleSubmit,
  assetData = null,
  isEditMode = false 
}) => {
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
    Tanggal: new Date().toISOString().split('T')[0], 
    
    //Step 2 Fields
    SumberPerolehan: '',
    KoderingBelanja: '',
    NoSPKFakturKuitansi: '',
    NoBAPenerimaan: '',
    KodeRekeningAset: '',
    NamaRekeningAset: '',
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
        KodeRekeningAset: assetData.kode_rekening_aset || 
                          (assetData.asetData ? assetData.asetData.kodeRekeningAset : '') || '',
        NamaRekeningAset: assetData.nama_rekening_aset || 
                          (assetData.asetData ? assetData.asetData.namaRekeningAset : '') || '',
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    const processedFormData = {
      kode: String(formData.kodeBarang || ''),
      nama_gedung: String(formData.lokasi || ''), // keep the backend field name for compatibility
      merk_barang: String(formData.merkBarang || ''),
      jumlah: Number(formData.jumlah || 0),
      satuan: String(formData.satuan || ''),
      harga: Number(formData.harga || 0),
      kondisi: String(formData.kondisi || 'Baru'),
      tanggal_pembelian: String(formData.Tanggal) || defaultFormattedDate,
      kode_rekening_belanja: String(formData.KoderingBelanja || ''),
      no_spk_faktur_kuitansi: String(formData.NoSPKFakturKuitansi || ''),
      no_bast: String(formData.NoBAPenerimaan || ''),
      umur_ekonomis: Number(formData.UmurEkonomis || 0),
      nilai_perolehan: Number(formData.NilaiPerolehan || 0),
      beban_penyusutan: Number(formData.BebanPenyusutan || 0),
      sumber_perolehan: String(formData.SumberPerolehan || '')  // Add this line to include sumber_perolehan
    };
    
    const requiredFields = [
      { key: 'kode', label: 'Kode Barang' },
      { key: 'nama_gedung', label: 'Lokasi' },
      { key: 'merk_barang', label: 'Merk Barang' },
      { key: 'satuan', label: 'Satuan' },
      { key: 'tanggal_pembelian', label: 'Tanggal' },
      { key: 'no_spk_faktur_kuitansi', label: 'No. SPK/Faktur/Kuitansi' },
      { key: 'kode_rekening_belanja', label: 'Kodering Belanja' },
      { key: 'no_bast', label: 'No BA Penerimaan' },
      { key: 'kondisi', label: 'Kondisi' },
      { key: 'umur_ekonomis', label: 'Umur Ekonomis' },
      { key: 'nilai_perolehan', label: 'Nilai Perolehan' },
      { key: 'beban_penyusutan', label: 'Beban Penyusutan' },
      { key: 'sumber_perolehan', label: 'Sumber Perolehan' }  // Add this line to include in validation
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

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.kodeBarang || !formData.lokasi || !formData.merkBarang) {
        alert('Please fill in all required fields before continuing.');
        return false;
      }
    }
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
      setFormData({});
      setCurrentStep(1);
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
                {showLokasiDropdown && (!filteredLokasiOptions || filteredLokasiOptions.length === 0) && !loadingLokasi && (
                  <div className="no-options">No matching locations found</div>
                )}
              </div>
              </div>
            <div className="form-group">
              <label htmlFor="Tanggal">Tanggal (DD-MM-YYYY)</label>
              <input
                type="date"
                id="Tanggal"
                name="Tanggal"
                value={formData.Tanggal || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="SumberPerolehan">Sumber Perolehan</label>
              <input
                type="text"
                id="SumberPerolehan"
                name="SumberPerolehan"
                value={formData.SumberPerolehan || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="KoderingBelanja">Kodering Belanja</label>
              <input
                type="text"
                id="KoderingBelanja"
                name="KoderingBelanja"
                value={formData.KoderingBelanja || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="NoSPKFakturKuitansi">No.SPK / Faktur / Kuitansi</label>
              <input
                type="text"
                id="NoSPKFakturKuitansi"
                name="NoSPKFakturKuitansi"
                value={formData.NoSPKFakturKuitansi || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="NoBAPenerimaan">No BA Penerimaan</label>
              <input
                type="text"
                id="NoBAPenerimaan"
                name="NoBAPenerimaan"
                value={formData.NoBAPenerimaan || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="KodeRekeningAset">Kode Rekening Aset</label>
              <input
                type="text"
                id="KodeRekeningAset"
                name="KodeRekeningAset"
                value={formData.KodeRekeningAset || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="NamaRekeningAset">Nama Rekening Aset</label>
              <input
                type="text"
                id="NamaRekeningAset"
                name="NamaRekeningAset"
                value={formData.NamaRekeningAset || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="UmurEkonomis">Umur Ekonomis</label>
              <input
                type="number"
                id="UmurEkonomis"
                name="UmurEkonomis"
                value={formData.UmurEkonomis || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="NilaiPerolehan">Nilai Perolehan</label>
              <input
                type="number"
                id="NilaiPerolehan"
                name="NilaiPerolehan"
                value={formData.NilaiPerolehan || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="BebanPenyusutan">Beban Penyusutan</label>
              <input
                type="number"
                id="BebanPenyusutan"
                name="BebanPenyusutan"
                value={formData.BebanPenyusutan || ''}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        )}

        <div className="modal-buttons">
          {currentStep > 1 ? (
            <button type="button" className="secondary-button" onClick={handleBack}>
              Back
            </button>
          ) : (
            <button type="button" className="secondary-button" onClick={closeModal}>
              Close
            </button>
          )}
          {currentStep === 3 ? (
            <button type="submit" className="main-button">
              Submit
            </button>
          ) : (
            <button type="button" className="main-button" onClick={handleNext}>
              Next
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ModalAssetPage;