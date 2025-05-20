import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import { useNavigate } from "react-router-dom";
import SidebarBHP from '../../Layout/SidebarBHP';
import Pagination from "../../Components/Pagination";
import { FaDownload, FaUndo } from 'react-icons/fa'; 
import SearchBar from '../../Components/SearchBar';
import * as XLSX from 'xlsx';
import { getBHPRiwayat, undoBHPRemoval } from '../../services/api';

function Riwayat() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch BHP riwayat data from API
  const fetchRiwayat = async () => {
    try {
      setIsLoading(true);
      const response = await getBHPRiwayat();
      console.log('API Response - BHP History:', response);
      
      // Process and normalize the data
      let riwayatData = [];
      
      // Handle different API response structures
      if (Array.isArray(response)) {
        // If the response itself is an array
        riwayatData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // If the response has data property that is an array
        riwayatData = response.data;
      } else if (response && typeof response === 'object') {
        // If it's an object with unknown structure, try to find an array property
        for (const key in response) {
          if (Array.isArray(response[key])) {
            riwayatData = response[key];
            break;
          }
        }
      }
      
      console.log('Normalized riwayat data:', riwayatData);
      
      if (riwayatData.length > 0) {
        setRiwayat(riwayatData);
        setFilteredData(riwayatData);
        setTotalPages(Math.ceil(riwayatData.length / itemsPerPage));
        setError(null);
      } else {
        console.warn('No history data found in the API response');
        setRiwayat([]);
        setFilteredData([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching BHP history:', err);
      setError('Failed to load BHP history. Please try again later.');
      setRiwayat([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchRiwayat();
  }, []);

  // Search functionality
  useEffect(() => {
    if (riwayat.length > 0) {
      console.log('Filtering with search term:', searchTerm);
      
      // If search term is empty, show all data
      if (!searchTerm.trim()) {
        setFilteredData(riwayat);
        setTotalPages(Math.ceil(riwayat.length / itemsPerPage));
        return;
      }
      
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      const filtered = riwayat.filter((item) => {
        // Check all relevant fields in the item 
        // Use the field names that match your API response
        return (
          // Search in Nama Barang
          (item['Nama Barang']?.toLowerCase().includes(lowerCaseSearchTerm) || false) ||
          // Search in Kode Rekening
          (item['Kode Rekening']?.toLowerCase().includes(lowerCaseSearchTerm) || false) ||
          // Search in Merk
          (item.Merk?.toLowerCase().includes(lowerCaseSearchTerm) || false) ||
          // Search in Peminjam
          (item.Peminjam?.toLowerCase().includes(lowerCaseSearchTerm) || false)
        );
      });
      
      console.log('Filtered data count:', filtered.length);
      setFilteredData(filtered);
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
      setCurrentPage(1); // Reset to first page when search changes
    }
  }, [searchTerm, riwayat, itemsPerPage]);

  // Calculate total value
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let overallTotal = 0;
    
    filteredData.forEach((item) => {
      // Look for the jumlah akhir value from the API response
      // This could be named "Total", but we want to make sure we get the actual value
      const itemTotal = parseInt(item.Total || 0);
      
      if (!isNaN(itemTotal)) {
        overallTotal += itemTotal;
      }
    });
    
    console.log('Calculated total value:', overallTotal);
    setTotalValue(overallTotal);
  }, [filteredData]);

  const handleSearchChange = (e) => {
    console.log('Search term changed:', e.target.value);
    setSearchTerm(e.target.value);
  };

  const handleUndo = async (id) => {
    if (window.confirm("Are you sure you want to undo this transaction? Items will be returned to inventory.")) {
      try {
        setIsLoading(true);
        // Call the API to undo the removal
        await undoBHPRemoval(id);
        
        // Refresh the data
        await fetchRiwayat();
        
        // Show success message
        alert('Transaction successfully undone. Items have been returned to inventory.');
      } catch (error) {
        console.error('Error undoing BHP removal:', error);
        alert(`Failed to undo transaction: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Removed handleDeleteAll function

  // Format date function to handle different date formats and display nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    let date;
    try {
      // Try to parse the date string
      date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Return formatted date (DD/MM/YYYY)
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'N/A';
    }
  };

  // Export to Excel function
  const exportToExcel = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for export using the correct field names
    const exportData = filteredData.map((item, index) => {
      // Use the exact field names from the API
      const namaBarang = item['Nama Barang'] || item.nama_barang || 'N/A';
      const kodeRekening = item['Kode Rekening'] || item.kode_rekening || 'N/A';
      const merk = item.Merk || item.merk || 'N/A';
      const peminjam = item.Peminjam || item.taker_name || 'N/A';
      const jumlahBarang = item['Jumlah Barang'] ? `${item['Jumlah Barang']} Pcs` : '0 Pcs';
      const total = parseInt(item.Total || 0);
      const tanggal = formatDate(item.created_at || item.date || item.tanggal);
      
      return {
        'No': (index + 1),
        'Tanggal': tanggal,
        'Nama Barang': namaBarang,
        'Kode Rekening': kodeRekening,
        'Merk': merk,
        'Peminjam': peminjam,
        'Jumlah Barang': jumlahBarang,
        'Total': `Rp. ${total.toLocaleString('id-ID')}`,
      };
    });
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },   // No
      { wch: 15 },  // Tanggal (new column)
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
            
            {/* Removed Delete All Button */}

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
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button className="retry-button" onClick={fetchRiwayat}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Tanggal</th>
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
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => {
                        // Calculate row number based on current page and index
                        const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        // Use the exact field names from the API response
                        const namaBarang = item['Nama Barang'] || item.nama_barang || 'N/A';
                        const kodeRekening = item['Kode Rekening'] || item.kode_rekening || 'N/A';
                        const merk = item.Merk || item.merk || 'N/A';
                        const peminjam = item.Peminjam || item.taker_name || 'N/A';
                        const volume = parseInt(item['Jumlah Barang'] || 0);
                        const satuan = 'Pcs'; // Default unit if not provided
                        const jumlahBarang = item['Jumlah Barang'] ? `${volume} ${satuan}` : '0 Pcs';
                        const total = parseInt(item.Total || 0);
                        
                        // Get the date - try different possible field names
                        const tanggal = formatDate(item.created_at || item.date || item.tanggal);
                        
                        return (
                          <tr key={item.Id || item.id || index}>
                            <td>{rowNumber}</td>
                            <td>{tanggal}</td>
                            <td>{namaBarang}</td>
                            <td>{kodeRekening}</td>
                            <td>{merk}</td>
                            <td>{peminjam}</td>
                            <td>{jumlahBarang}</td>
                            <td>{`Rp. ${total.toLocaleString('id-ID')}`}</td>
                            <td>
                              <button 
                                className="secondary-button undo-button"
                                onClick={() => handleUndo(item.Id || item.id)}
                                disabled={!(item.Id || item.id)}
                                title="Batalkan transaksi"
                              >
                                <FaUndo style={{ marginRight: '5px' }} /> Undo
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="no-data-cell">No history data available</td>
                      </tr>
                    )}
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