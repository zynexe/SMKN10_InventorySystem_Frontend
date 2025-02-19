// ModalAssetPage.js
import React, { useState } from "react";
import Modal from "react-modal";

const ModalAssetPage = ({ isOpen, closeModal, currentStep, setCurrentStep, handleSubmit }) => {
  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(e); // Submit on the last step
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderBreadcrumbs = () => {
    const steps = [
      { label: "1. Info Barang", step: 1 },
      { label: "2. Info BPA Penerimaan", step: 2 },
      { label: "3. Info Barang", step: 3 },
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
      <h2 style={{ textAlign: "center" }}>Add Asset</h2>
      {renderBreadcrumbs()}

      <form onSubmit={currentStep === 3 ? handleSubmit : handleNext}>
        {currentStep === 1 && (
          <div>
            <div className="form-group">
              <label htmlFor="kodeBarang">Kode Barang (ID)</label>
              <input type="text" id="kodeBarang" name="kodeBarang" />
            </div>
            <div className="form-group">
              <label htmlFor="namaBarang">Nama Barang</label>
              <input type="text" id="namaBarang" name="namaBarang" />
            </div>
            <div className="form-group">
              <label htmlFor="merkBarang">Merk Barang</label>
              <input type="text" id="merkBarang" name="merkBarang" />
            </div>
            <div className="form-group">
              <label htmlFor="jumlah">Jumlah</label>
              <input type="number" id="jumlah" name="jumlah" />
            </div>
            <div className="form-group">
              <label htmlFor="satuan">Satuan</label>
              <input type="text" id="satuan" name="satuan" />
            </div>
            <div className="form-group">
              <label htmlFor="harga">Harga (Rupiah)</label>
              <input type="number" id="harga" name="harga" />
            </div>
            <div className="form-group">
              <label htmlFor="lokasi">Lokasi</label>
              <input type="text" id="lokasi" name="lokasi" />
            </div>
          </div>
        )}
        {currentStep === 2 && (
          <div>
            <div className="form-group">
              <label htmlFor="Tanggal">Tanggal</label>
              <input type="date" id="Tanggal" name="Tanggal" />
            </div>
            <div className="form-group">
              <label htmlFor="SumberPerolehan">Sumber Perolehan</label>
              <input type="text" id="SumberPerolehan" name="SumberPerolehan" />
            </div>
            <div className="form-group">
              <label htmlFor="KoderingBelanja">Kodering Belanja</label>
              <input type="text" id="KoderingBelanja" name="KoderingBelanja" />
            </div>
            <div className="form-group">
              <label htmlFor="No.SPKFakturKuitansi">No.SPK / Faktur / Kuitansi</label>
              <input type="text" id="No.SPKFakturKuitansi" name="No.SPKFakturKuitansi" />
            </div>
            <div className="form-group">
              <label htmlFor="NoBAPenerimaan">No BA Penerimaan</label>
              <input type="number" id="NoBAPenerimaan" name="NoBAPenerimaan" />
            </div>
          </div>
        )}
        {currentStep === 3 && (
          <div>
            <p>Step 3 content</p>
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
          <button type="submit" className="main-button">
            {currentStep === 3 ? "Submit" : "Next"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ModalAssetPage;