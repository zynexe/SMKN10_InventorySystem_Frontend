import React from 'react';

function InfoBA({ isOpen, closeModal, bpaData }) {
  if (!isOpen || !bpaData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>&times;</button>
        <h1>Info BA Penerimaan</h1>
        <div className="info-section">
          <p><strong>Sumber Perolehan:</strong> {bpaData.sumberPerolehan}</p>
          <p><strong>Kode Rekening Belanja:</strong> {bpaData.kodeRekeningBelanja}</p>
          <p><strong>No. SPK/Faktur/Kuitansi:</strong> {bpaData.noSPK}</p>
          <p><strong>No. BAST:</strong> {bpaData.noBAST}</p>
        </div>
      </div>
    </div>
  );
}

export default InfoBA;