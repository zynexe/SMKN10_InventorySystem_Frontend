import React from 'react';

function InfoAset({ isOpen, closeModal, asetData }) {
  if (!isOpen || !asetData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={closeModal}>&times;</button>
        <h1>Info Aset</h1>
        <div className="info-section">
          <p><strong>Kode Rekening Aset:</strong> {asetData.kodeRekeningAset}</p>
          <p><strong>Nama Rekening Aset:</strong> {asetData.namaRekeningAset}</p>
          <p><strong>Umur Ekonomis:</strong> {asetData.umurEkonomis} tahun</p>
          <p><strong>Nilai Perolehan:</strong> Rp. {asetData.nilaiPerolehan.toLocaleString('id-ID')}</p>
          <p><strong>Beban Penyusutan:</strong> Rp. {asetData.bebanPenyusutan.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}

export default InfoAset;