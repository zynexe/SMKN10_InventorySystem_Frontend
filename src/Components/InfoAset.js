import React from 'react';


function InfoAset({ isOpen, closeModal, asetData }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>
          &times;
        </button>
        <h1>Info Aset</h1>
        <div className="info-section">
          <p><strong>Kode Rekening Aset:</strong> {asetData.kodeRekeningAset}</p>
          <p><strong>Nama Rekening Aset:</strong> {asetData.namaRekeningAset}</p>
          <p><strong>Umur Ekonomis:</strong> {asetData.umurEkonomis}</p>
          <p><strong>Nilai Perolehan:</strong> {asetData.nilaiPerolehan}</p>
          <p><strong>Beban Penyusutan:</strong> {asetData.bebanPenyusutan}</p>
        </div>
      </div>
    </div>
  );
}

export default InfoAset;