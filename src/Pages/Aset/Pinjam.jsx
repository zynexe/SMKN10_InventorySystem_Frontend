import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import Sidebar from '../../Layout/Sidebar';
import Pagination from "../../Components/Pagination";
import SearchBar from '../../Components/SearchBar';
import { FaDownload, FaUndo } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import { getPeminjamanAset, kembalikanAset, undoPeminjamanAset } from '../../services/api';

const Pinjam = () => {
  // Existing state variables
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [borrowData, setBorrowData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingItemId, setProcessingItemId] = useState(null);
  // New state for tracking undo operations
  const [isUndoing, setIsUndoing] = useState(false);
  const [undoingItemId, setUndoingItemId] = useState(null);

  // Fetch borrowing data from API
  const fetchBorrowingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPeminjamanAset();
      console.log("API Response:", response); // Debug log
      
      // Process the data with proper format
      let formattedData = [];
      if (response && Array.isArray(response)) {
        formattedData = response.map(item => {
          // Debug log for each item
          console.log("Processing item:", item);
          
          let namaBarang = "Tidak diketahui";
          let satuan = "Unit";
          
          // Check for nama_barang directly in the response
          if (item.nama_barang) {
            namaBarang = item.nama_barang;
          }
          // First check if assetItem exists with correct casing
          else if (item.asset_item) {
            namaBarang = item.asset_item.nama_barang || item.asset_item.kodeBarang?.uraian || "Tidak diketahui";
            satuan = item.asset_item.satuan || "Unit";
          } 
          // Alternative check for different casing
          else if (item.assetItem) {
            namaBarang = item.assetItem.nama_barang || item.assetItem.kodeBarang?.uraian || "Tidak diketahui";
            satuan = item.assetItem.satuan || "Unit";
          }
          
          // Format the status to display capitalized
          const formattedStatus = item.status ? 
            item.status.charAt(0).toUpperCase() + item.status.slice(1) : 
            "Tidak diketahui";
          
          return {
            id: item.id,
            tanggal: formatDate(item.tanggal_pinjam || item.created_at),
            nama_barang: namaBarang,
            jumlah: item.volume || 0,
            satuan: satuan,
            keperluan: item.keperluan || "Tidak diketahui",
            nama_pengambil: item.nama_peminjam || "Tidak diketahui",
            tanggal_kembali: item.tanggal_kembali ? formatDate(item.tanggal_kembali) : '-',
            status: formattedStatus,
            asset_item_id: item.asset_item_id
          };
        });
      }
      
      console.log("Formatted Data:", formattedData); // Debug log
      
      setBorrowData(formattedData);
      setFilteredData(formattedData);
      setTotalPages(Math.ceil(formattedData.length / itemsPerPage));
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching borrowing data:", err);
      setError("Failed to load borrowing data. Please try again.");
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBorrowingData();
  }, []);

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as is if invalid
    
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Search functionality (unchanged)
  useEffect(() => {
    const filtered = borrowData.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        (item.nama_barang?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.nama_pengambil?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.keperluan?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.status?.toLowerCase() || '').includes(lowerCaseSearchTerm)
      );
    });
    
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, borrowData]);

  // Get current items for pagination
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper function to determine badge class based on status
  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'terkembalikan':
        return 'badge badge-success';
      case 'dipinjam':
        return 'badge badge-warning';
      case 'diambil':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  // Handle return button click with API integration
  const handleReturnItem = async (id) => {
    // Confirmation dialog
    if (window.confirm("Apakah Anda yakin ingin mengembalikan barang ini?")) {
      setIsProcessing(true);
      setProcessingItemId(id);
      
      try {
        // Call API to return the asset
        const result = await kembalikanAset(id);
        console.log("Return result:", result); // Debug log
        
        // Update the local state
        const updatedData = borrowData.map(item => {
          if (item.id === id) {
            // Format today's date as DD/MM/YYYY
            const today = new Date();
            const formattedDate = today.toLocaleDateString('id-ID', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            
            return {
              ...item,
              status: 'Terkembalikan',
              tanggal_kembali: formattedDate
            };
          }
          return item;
        });
        
        setBorrowData(updatedData);
        alert("Barang telah berhasil dikembalikan.");
      } catch (err) {
        console.error("Error returning item:", err);
        alert("Gagal mengembalikan barang. Silakan coba lagi.");
      } finally {
        setIsProcessing(false);
        setProcessingItemId(null);
      }
    }
  };
  
  // New function to handle undo button click
  const handleUndoItem = async (id) => {
    // Confirmation dialog
    if (window.confirm("Apakah Anda yakin ingin membatalkan peminjaman ini?")) {
      setIsUndoing(true);
      setUndoingItemId(id);
      
      try {
        // Call API to undo the borrowing
        const result = await undoPeminjamanAset(id);
        console.log("Undo result:", result); // Debug log
        
        // Remove the item from the local state
        const updatedData = borrowData.filter(item => item.id !== id);
        
        setBorrowData(updatedData);
        alert("Peminjaman telah berhasil dibatalkan.");
        
        // Refresh data to ensure we have accurate information
        fetchBorrowingData();
      } catch (err) {
        console.error("Error undoing borrowing:", err);
        alert("Gagal membatalkan peminjaman. Silakan coba lagi.");
      } finally {
        setIsUndoing(false);
        setUndoingItemId(null);
      }
    }
  };

  // Export to Excel function (unchanged)
  const exportToExcel = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for export
    const exportData = filteredData.map((item, index) => {
      return {
        'No': (index + 1),
        'Tanggal': item.tanggal,
        'Nama Barang': item.nama_barang,
        'Volume': `${item.jumlah} ${item.satuan}`,
        'Keperluan': item.keperluan,
        'Nama Pengambil': item.nama_pengambil,
        'Tanggal Kembali': item.tanggal_kembali,
        'Status': item.status
      };
    });
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },   // No
      { wch: 12 },  // Tanggal
      { wch: 30 },  // Nama Barang
      { wch: 15 },  // Volume
      { wch: 25 },  // Keperluan
      { wch: 20 },  // Nama Pengambil
      { wch: 15 },  // Tanggal Kembali
      { wch: 15 },  // Status
    ];
    ws['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Peminjaman Asset');
    
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create an export filename
    const fileName = `peminjaman_asset_${timestamp}.xlsx`;
    
    // Export the file
    XLSX.writeFile(wb, fileName);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="asset-home-container">
      <Sidebar />
      
      <div className="main-content">
        <div className="header">
          <h2>Peminjaman Asset</h2>
          
          <div className="header-buttons">
            <SearchBar
              searchTerm={searchTerm}
              handleSearchChange={handleSearchChange} 
            />

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
            <div className="loading">Loading borrowing data...</div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
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
                      <th>Volume</th>
                      <th>Keperluan</th>
                      <th>Nama Pengambil</th>
                      <th>Tanggal Kembali</th>
                      <th>Status</th>
                      <th>Kembali</th>
                      <th>Undo</th> 
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => {
                        // Calculate row number based on current page and index
                        const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        // Combine jumlah and satuan for volume
                        const volume = `${item.jumlah} ${item.satuan}`;
                        
                        // Determine if the item can be returned
                        const canBeReturned = item.status.toLowerCase() === 'dipinjam';
                        
                        return (
                          <tr key={item.id}>
                            <td>{rowNumber}</td>
                            <td>{item.tanggal}</td>
                            <td>{item.nama_barang}</td>
                            <td>{volume}</td>
                            <td>{item.keperluan}</td>
                            <td>{item.nama_pengambil}</td>
                            <td>{item.tanggal_kembali}</td>
                            <td>
                              <span className={getStatusBadgeClass(item.status)}>
                                {item.status}
                              </span>
                            </td>
                            <td>
                              {canBeReturned ? (
                                <button 
                                  className="main-button"
                                  onClick={() => handleReturnItem(item.id)}
                                  disabled={isProcessing && processingItemId === item.id}
                                  style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                                >
                                  {isProcessing && processingItemId === item.id ? 'Processing...' : 'Kembalikan'}
                                </button>
                              ) : (
                                <span className={item.status.toLowerCase() === 'terkembalikan' ? 'status-returned' : 'status-taken'}>
                                  {item.status.toLowerCase() === 'terkembalikan' ? 'Sudah kembali' : 'Tidak dapat dikembalikan'}
                                </span>
                              )}
                            </td>
                            {/* New undo column */}
                            <td>
                              <button 
                                className="secondary-button undo-button"
                                onClick={() => handleUndoItem(item.id)}
                                disabled={isUndoing && undoingItemId === item.id}
                                title="Batalkan peminjaman"
                                style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                              >
                                {isUndoing && undoingItemId === item.id ? (
                                  'Processing...' 
                                ) : (
                                  <>
                                    <FaUndo style={{ marginRight: '5px' }} /> Undo
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="10" className="no-data-cell">No borrowing data available</td> {/* Updated colspan to 10 */}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-container">
                <Pagination 
                  currentPage={currentPage} 
                  setCurrentPage={setCurrentPage} 
                  totalPages={totalPages} 
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pinjam;