// ModalAssetPage.js
import React, { useState, useEffect } from "react";
import Modal from "react-modal";

const ModalAssetPage = ({ isOpen, closeModal, currentStep, setCurrentStep, handleSubmit }) => {
  // Add form state
  const [formData, setFormData] = useState({});

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update the handleFormSubmit function
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
    setFormData({}); // Reset form
  };

  // Handle step navigation
  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Reset form when modal closes
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
      maxHeight: "90vh", // Add max height
      padding: "20px",
      overflow: "auto", // Enable scrolling
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

  // Update the form submission handling in the JSX
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add Asset Modal"
    >
      <h2 style={{ textAlign: "center" }}>Add Asset</h2>
      {renderBreadcrumbs()}

      <form onSubmit={handleFormSubmit}>
        {currentStep === 1 && (
          <div className="step-content">
            <div className="form-group">
              <label htmlFor="kodeBarang">Kode Barang (ID)</label>
              <input
                type="text"
                id="kodeBarang"
                name="kodeBarang"
                value={formData.kodeBarang || ''}
                onChange={handleInputChange}
                required
              />
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
              <label htmlFor="lokasi">Lokasi</label>
              <input
                type="text"
                id="lokasi"
                name="lokasi"
                value={formData.lokasi || ''}
                onChange={handleInputChange}
                required
              />
             
            </div>
            <div className="form-group">
                <label htmlFor="Tanggal">Tanggal</label>
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