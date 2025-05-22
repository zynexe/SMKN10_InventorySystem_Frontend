import React from 'react';
import { FaTrash } from 'react-icons/fa';

const BHPTable = ({ 
  paginatedData = [], 
  onDecrementStock, 
  onDelete,
  currentPage = 1, 
  itemsPerPage = 25 
}) => {
  // Safety check for paginatedData
  const safeData = Array.isArray(paginatedData) ? paginatedData : [];
  
  // Add debug log
  console.log("BHPTable received data:", safeData.length, "items");
  
  // Calculate start index for numbering
  const startIndex = (currentPage - 1) * itemsPerPage;

  // Helper function to safely get property values with multiple key options
  const getProperty = (item, keys, defaultValue = 'N/A') => {
    // First check for the PascalCase version which seems to have the updated value
    if (item['Stock Akhir'] !== undefined && item['Stock Akhir'] !== null) {
      // Also update the snake_case version to keep them in sync
      item.stock_akhir = item['Stock Akhir'];
    }
    
    // Similarly for Stock Awal
    if (item['Stock Awal'] !== undefined && item['Stock Awal'] !== null) {
      item.stock_awal = item['Stock Awal'];
    }
    
    // Now proceed with normal property lookup
    for (const key of keys) {
      if (item[key] !== undefined && item[key] !== null) {
        return item[key];
      }
    }
    return defaultValue;
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Kode Rekening</th>
            <th>Merk</th>
            <th>Tanggal</th>
            <th>Stok Bulan Lalu</th>
            <th>Pengguna</th> 
            <th>Stok Bulan Ini</th>
            <th>Harga Satuan</th>
            <th>Total Bulan Lalu</th>
            <th>Total Bulan Ini</th>
            <th>Hapus</th>
          </tr>
        </thead>
        <tbody>
          {safeData.length > 0 ? (
            safeData.map((item, index) => {
              // Extract properties with fallbacks for different field names
              const namaBarang = getProperty(item, ['nama_barang', 'Nama Barang'], 'N/A');
              
              // Handle kode rekening, which might be direct or from relation
              let kodeRekening = getProperty(item, ['kode_rekening', 'Kode Rekening'], null);
              if (!kodeRekening && item.kodeRekening && item.kodeRekening.kode) {
                kodeRekening = item.kodeRekening.kode;
              }
              
              const merk = getProperty(item, ['merk', 'Merk'], 'N/A');
              const tanggal = getProperty(item, ['tanggal', 'Tanggal', 'created_at', 'updated_at'], 'N/A');
              
              const stockAwal = parseInt(getProperty(item, ['Stock Awal', 'stock_awal', 'Volume', 'volume', 'initial_volume'], 0));
              // Prioritize the Stock Akhir (PascalCase) first as it seems to have the correct value
              const stockAkhir = parseInt(getProperty(item, ['Stock Akhir', 'stock_akhir', 'total_volume'], stockAwal));

              // After getting these values, synchronize them back to the item object
              item.stock_awal = stockAwal;
              item.stock_akhir = stockAkhir;
              item['Stock Awal'] = stockAwal;
              item['Stock Akhir'] = stockAkhir;

              const hargaSatuan = parseInt(getProperty(item, ['Harga', 'Harga Satuan', 'harga_satuan', 'harga'], 0));
              
              // Extract unit/satuan
              const satuan = getProperty(item, ['Satuan', 'satuan'], 'Pcs');
              
              // Calculate totals
              const jumlahAwal = stockAwal * hargaSatuan;
              const jumlahAkhir = stockAkhir * hargaSatuan;
              
                return (
                <tr key={item.id || index}>
                  <td>{startIndex + index + 1}</td>
                  <td>{namaBarang}</td>
                  <td>{kodeRekening || 'N/A'}</td>
                  <td>{merk}</td>
                  <td>{tanggal}</td>
                  <td>{stockAwal.toLocaleString()} {satuan}</td>
                
                  <td className="action-cell">
                  {onDecrementStock && (
                    <button 
                    className="main-button"
                    onClick={() => onDecrementStock(item.id)}
                    title="Pengurangan Stock"
                    style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                    >
                    Pilih
                    </button>
                  )}
                  </td>
                  <td>{stockAkhir.toLocaleString()} {satuan}</td>
                  <td>Rp. {hargaSatuan.toLocaleString('id-ID')}</td>
                  <td>Rp. {jumlahAwal.toLocaleString('id-ID')}</td>
                  <td>Rp. {jumlahAkhir.toLocaleString('id-ID')}</td>
                  <td>
                  <div className="table-actions">
                    {onDelete && (
                    <button className="icon-button delete-button" onClick={() => onDelete(item.id)}>
                      <FaTrash />
                    </button>
                    )}
                  </div>
                  </td>
                </tr>
                );
            })
          ) : (
            <tr>
              <td colSpan="12" className="no-data-cell">No data available</td> 
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BHPTable;