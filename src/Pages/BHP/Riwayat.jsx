import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import { useNavigate } from "react-router-dom";
import SidebarBHP from '../../Layout/SidebarBHP';
import Pagination from "../../Components/Pagination";
import { FaDownload } from 'react-icons/fa';
import SearchBar from '../../Components/SearchBar';
import * as XLSX from 'xlsx';

// Generate random peminjam names
const generateRandomName = () => {
  const firstNames = ["Budi", "Siti", "Ahmad", "Dewi", "Joko", "Nina", "Agus", "Rina", "Dodi", "Lina"];
  const lastNames = ["Santoso", "Wijaya", "Kusuma", "Putra", "Sari", "Hidayat", "Nugraha", "Pratama", "Wati", "Susanto"];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
};

// Generate dummy data for Riwayat (history) of borrowed BHP items
const generateRiwayatData = (count = 50) => {
  // Common items for BHP (Barang Habis Pakai)
  const bhpItems = [
    { name: "Kertas HVS A4", kodeRekening: "5.2.2.01", merk: "Sinar Dunia" },
    { name: "Tinta Printer", kodeRekening: "5.2.2.06", merk: "Epson" },
    { name: "Bolpoin", kodeRekening: "5.2.2.01", merk: "Snowman" },
    { name: "Pensil 2B", kodeRekening: "5.2.2.01", merk: "Faber-Castell" },
    { name: "Spidol Boardmarker", kodeRekening: "5.2.2.01", merk: "Snowman" },
    { name: "CD-R", kodeRekening: "5.2.2.11", merk: "Sony" },
    { name: "Penghapus", kodeRekening: "5.2.2.01", merk: "Joyko" },
    { name: "Isi Staples", kodeRekening: "5.2.2.01", merk: "Kenko" },
    { name: "Toner Printer", kodeRekening: "5.2.2.06", merk: "HP" },
    { name: "Amplop", kodeRekening: "5.2.2.01", merk: "Paperline" }
  ];
  
  const units = ["Pcs", "Box", "Rim", "Pack", "Set"];
  
  return Array.from({ length: count }, (_, i) => {
    const randomItem = bhpItems[Math.floor(Math.random() * bhpItems.length)];
    const jumlah = Math.floor(Math.random() * 5) + 1; // Random quantity between 1-5
    const unit = units[Math.floor(Math.random() * units.length)];
    const hargaSatuan = (Math.floor(Math.random() * 20) + 1) * 5000; // Random price between 5K-100K
    
    return {
      id: i + 1,
      nama_barang: randomItem.name,
      kode_rekening: randomItem.kodeRekening,
      merk: randomItem.merk,
      peminjam: generateRandomName(),
      jumlah_barang: `${jumlah} ${unit}`,
      total: jumlah * hargaSatuan
    };
  });
};

// Create dummy riwayat data
const riwayatDummyData = generateRiwayatData();

function Riwayat() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(riwayatDummyData);
  const [riwayat, setRiwayat] = useState(riwayatDummyData);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(Math.ceil(riwayatDummyData.length / itemsPerPage));
  
  // Search functionality
  useEffect(() => {
    const filtered = riwayat.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        item.nama_barang?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.kode_rekening?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.merk?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.peminjam?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, riwayat]);

  // Calculate total value
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let overallTotal = 0;
    filteredData.forEach((item) => {
      overallTotal += item.total;
    });
    setTotalValue(overallTotal);
  }, [filteredData]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUndo = (id) => {
    // For dummy data, just remove the item from the list
    const updatedRiwayat = riwayat.filter(item => item.id !== id);
    setRiwayat(updatedRiwayat);
    alert(`Item with ID ${id} has been removed from history`);
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for export
    const exportData = filteredData.map((item, index) => {
      return {
        'No': (index + 1),
        'Nama Barang': item.nama_barang || '',
        'Kode Rekening': item.kode_rekening || '',
        'Merk': item.merk || '',
        'Peminjam': item.peminjam || '',
        'Jumlah Barang': item.jumlah_barang || '',
        'Total': `Rp. ${parseInt(item.total || 0).toLocaleString('id-ID')}`,
      };
    });
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },   // No
      { wch: 30 },  // Nama Barang
      { wch: 15 },  // Kode Rekening
      { wch: 15 },  // Merk
      { wch: 25 },  // Peminjam
      { wch: 15 },  // Jumlah Barang
      { wch: 15 },  // Total
    ];
    ws['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat BHP');
    
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create an export filename
    const fileName = `riwayat_bhp_${timestamp}.xlsx`;
    
    // Export the file
    XLSX.writeFile(wb, fileName);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="asset-home-container">
      <SidebarBHP />
      <div className="main-content">
        <div className="header">
          <h2>Riwayat</h2>
          
          <div className="header-buttons">
            <SearchBar
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange} />

            <button 
              className="main-button export-button" 
              onClick={exportToExcel}
              disabled={isLoading || filteredData.length === 0}
            >
              <FaDownload style={{ marginRight: '5px' }} /> Export 
            </button>
          </div>
        </div>
        
        <div className="content">
          {isLoading ? (
            <div className="loading-container">
              <p>Loading riwayat data...</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Barang</th>
                      <th>Kode Rekening</th>
                      <th>Merk</th>
                      <th>Peminjam</th>
                      <th>Jumlah Barang</th>
                      <th>Total</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((item, index) => {
                      // Calculate row number based on current page and index
                      const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      
                      return (
                        <tr key={item.id}>
                          <td>{rowNumber}</td>
                          <td>{item.nama_barang}</td>
                          <td>{item.kode_rekening}</td>
                          <td>{item.merk}</td>
                          <td>{item.peminjam}</td>
                          <td>{item.jumlah_barang}</td>
                          <td>{`Rp. ${item.total.toLocaleString('id-ID')}`}</td>
                          <td>
                            <button 
                              className="main-button"
                              onClick={() => handleUndo(item.id)}
                            >
                              Undo
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pagination-total-container">
                <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
                <div className="total-value">Total: Rp. {totalValue.toLocaleString("id-ID")}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Riwayat;