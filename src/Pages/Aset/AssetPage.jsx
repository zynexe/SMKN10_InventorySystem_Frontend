import React, { useState, useEffect, useRef } from "react";
import '../../CSS/Asset.css';
import filterIcon from "../../assets/filter_icon.svg";
import addIcon from "../../assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import ModalAssetPage from "../../Components/ModalAssetPage";
import Sidebar from '../../Layout/Sidebar';
import SearchBar from '../../Components/SearchBar';
import FilterModal from "../../Components/FilterModal";
import InfoBA from "../../Components/InfoBA";
import InfoAset from "../../Components/InfoAset";
import AssetTable from '../../Components/AssetTable';
import * as XLSX from 'xlsx'; 
import { FaDownload, FaTrash } from 'react-icons/fa';
//api functions
import { 
  getAssets, 
  addAsset, 
  updateAsset, 
  deleteAsset, 
  getBalance, 
  updateBalance,
  deleteAllAssets 
} from '../../services/api';

// Keep the dummy data generation functions for fallback
const generateRandomNamaBarang = () => {
  const prefixes = ["CANON", "NIKON", "SONY", "FUJIFILM", "OLYMPUS"];
  const models = ["EOS 3000D", "Alpha a7 III", "X100V", "OM-D E-M10 Mark IV", "D3500"];
  const suffixes = ["KIT 18-55MM", "KIT 16-50MM", "BODY ONLY", "WITH LENS", "LENS 50MM"];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomModel = models[Math.floor(Math.random() * prefixes.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * prefixes.length)];

  return `${randomPrefix} ${randomModel} ${randomSuffix}`;
};

const generateRandomDate = () => {
  const end = new Date();
  const start = new Date(new Date().setFullYear(end.getFullYear() - 3));
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
  // Format date as DD/MM/YYYY
  return randomDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Fallback data
export const assetData = Array.from({ length: 200 }, (_, i) => ({
  no: i + 1,
  kodeBarang: `1.3.2.06.01.02.${126 + i}`,
  namaBarang: generateRandomNamaBarang(),
  merkBarang: "Canon Eos",
  satuan: "Pcs",
  jumlah: 1,
  harga: "Rp. 9.743.000",
  lokasi: "Gedung A",
  tanggal: generateRandomDate(), // Add the random date
  // Dummy data for InfoBA and InfoAset
  bpaData: {
    kodeRekeningBelanja: "5.2.3.01",
    noSPK: "SPK-2024-001",
    noBAST: "BAST-2024-001",
  },
  asetData: {
    kodeRekeningAset: "1.3.2.06.01",
    namaRekeningAset: "Kamera Digital",
    umurEkonomis: 5,
    nilaiPerolehan: 9743000,
    bebanPenyusutan: 1948600,
  },
}));

function AssetPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Number of items per page
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null); // For edit functionality
  const [isEditMode, setIsEditMode] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(null);

  // Months array with "All" as the first option
  const months = ["All", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  // Years array with "All" as the first option
  const currentYear = new Date().getFullYear();
  const years = ["All", ...Array.from({ length: 30 }, (_, index) => currentYear - index)];

  // State for selected month and year - set "All" as default
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // New state for FilterModal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Update the useEffect when filters change
  useEffect(() => {
    // Count active filters (excluding "All")
    let count = 0;
    if (selectedMonth !== "All") count++;
    if (selectedYear !== "All") count++;
    setActiveFilters(count);
  }, [selectedMonth, selectedYear]);

  // Fetch assets from API
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      
      console.log('Attempting to fetch assets from:', `${import.meta.env.VITE_API_BASE_URL}/aset/index`);
      
      const response = await getAssets();
      
      // Debug the response
      console.log('API Response:', response);
      
      // Check if response is an array
      if (response && Array.isArray(response)) {
        console.log('Valid data received, items count:', response.length);
        setAssets(response);
        setFilteredData(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
      } 
      // If response is an object with a data property that's an array
      else if (response && response.data && Array.isArray(response.data)) {
        console.log('Valid data received from response.data, items count:', response.data.length);
        setAssets(response.data);
        setFilteredData(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } 
      // Fallback to dummy data
      else {
        console.warn("No valid data received from API:", response);
        setAssets(assetData);
        setFilteredData(assetData);
        setTotalPages(Math.ceil(assetData.length / itemsPerPage));
        setError("API returned no usable data. Using fallback data.");
      }
    } catch (error) {
      // More detailed error logging
      console.error("Error fetching assets:", error);
      
      // Check for specific error types
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        console.error('Error response data:', error.response.data);
        
        // Handle specific status codes
        if (error.response.status === 401) {
          setError("Authentication failed. Please log in again.");
          // Optionally redirect to login page
          // navigate('/login');
          return;
        } else if (error.response.status === 403) {
          setError("You don't have permission to access assets.");
          return;
        } else if (error.response.status === 404) {
          setError("Assets endpoint not found. Please check API configuration.");
        } else if (error.response.status >= 500) {
          setError("Server error. Please try again later or contact support.");
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        setError("No response from server. Please check your internet connection.");
      } else {
        
        console.error('Request setup error:', error.message);
        setError("Error setting up request: " + error.message);
      }
      
      // Fallback to dummy data on error
      setAssets(assetData);
      setFilteredData(assetData);
      setTotalPages(Math.ceil(assetData.length / itemsPerPage));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance when component mounts
  useEffect(() => {
    fetchBalance();
  }, []);
  
  // Function to fetch current balance
  const fetchBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await getBalance();
      
      if (response && response.data !== undefined) {
        setBalance(Number(response.data));
      }
      setBalanceError(null);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceError('Failed to load balance data');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = assets.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      
      // First apply the text search filter
      const matchesSearchTerm = 
        (item.kode_barang?.toLowerCase() || item.kodeBarang?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.nama_barang?.toLowerCase() || item.namaBarang?.toLowerCase() || '').includes(lowerCaseSearchTerm) ||
        (item.merk_barang?.toLowerCase() || item.merkBarang?.toLowerCase() || '').includes(lowerCaseSearchTerm);
      
      if (!matchesSearchTerm) return false;
      
      // Parse date from various formats
      let itemDate;
      const dateString = item.tanggal_pembelian || item.tanggal || '';
      
      if (!dateString) return true; // Include items with no date when filtering
      
      try {
        // Try to parse DD/MM/YYYY format (common in Indonesia)
        if (dateString.includes('/')) {
          const [day, month, year] = dateString.split('/').map(Number);
          itemDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
        } 
        // Try to parse 'YYYY-MM-DD' format 
        else if (dateString.includes('-')) {
          itemDate = new Date(dateString);
        } 
        // Default date parser
        else {
          itemDate = new Date(dateString);
        }
        
        // Check if date is valid
        if (isNaN(itemDate.getTime())) {
          console.warn('Invalid date:', dateString);
          return true; // Include items with invalid dates when filtering
        }
      } catch (error) {
        console.error('Error parsing date:', dateString, error);
        return true; // Include items with unparseable dates when filtering
      }
      
      // Get month name
      const monthName = months[itemDate.getMonth() + 1]; // +1 because our array has "All" at index 0
      const yearValue = itemDate.getFullYear();
      
      console.log(`Item: ${item.nama_barang || item.namaBarang}, Date: ${dateString}, Parsed: ${itemDate.toLocaleDateString()}, Month: ${monthName}, Year: ${yearValue}`);
      
      // Apply month filter if not "All"
      const matchesMonth = selectedMonth === "All" || monthName === selectedMonth;
      
      // Apply year filter if not "All"
      const matchesYear = selectedYear === "All" || yearValue === parseInt(selectedYear);
      
      return matchesMonth && matchesYear;
    });
    
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, selectedMonth, selectedYear, assets]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate total value
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let overallTotal = 0;
    filteredData.forEach((item) => {
      // Handle both backend and frontend data formats
      let price = 0;
      if (typeof item.harga === 'string' && item.harga.includes('Rp.')) {
        price = parseFloat(item.harga.replace("Rp.", "").replace(/\./g, "").replace(/,/g, ""));
      } else {
        price = parseFloat(item.harga || 0);
      }
      
      overallTotal += price * (item.jumlah || 1);
    });
    setTotalValue(overallTotal);
  }, [filteredData]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const openModal = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setIsEditMode(true);
    } else {
      setSelectedAsset(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
    setCurrentStep(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
    setIsEditMode(false);
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting asset data:', formData);
      
      if (isEditMode && selectedAsset) {
        // If in edit mode, update the existing asset
        const response = await updateAsset(selectedAsset.id, formData);
        console.log("Asset updated:", response);
        
        // Refresh the asset list
        await fetchAssets();
        
        // Close modal
        closeModal();
        
        // Show success message
        alert("Asset updated successfully.");
      } else {
        // Add the asset - removed balance check
        const response = await addAsset(formData);
        console.log("Asset added:", response);
        
        // Refresh the asset list
        await fetchAssets();
        
        // Close modal
        closeModal();
        
        // Show success message without balance information
        alert("Asset added successfully.");
      }
    } catch (error) {
      console.error("Error saving asset:", error);
      
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data?.errors || {};
        console.error('Validation errors:', validationErrors);
        
        // Create a formatted error message
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        
        alert(`Validation failed:\n${errorMessages || 'Please check your form data'}`);
      } else {
        alert(`Failed to ${isEditMode ? 'update' : 'add'} asset. Please try again.`);
      }
    }
  };

  // Handle edit button click in table
  const handleEditClick = (asset) => {
    openModal(asset);
  };

  // Handle delete button click in table
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this asset?")) {
      try {
        await deleteAsset(id);
        console.log("Asset deleted successfully");
        // Refresh the asset list
        await fetchAssets();
      } catch (error) {
        console.error("Error deleting asset:", error);
        alert("Failed to delete asset. Please try again.");
      }
    }
  };

  // Functions to handle filter modal
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const applyFilters = () => {
    // Reset to first page when filters are applied
    setCurrentPage(1);
    // Filtering logic is already handled in the useEffect
  };

  // State for InfoBA modal
  const [isInfoBAOpen, setIsInfoBAOpen] = useState(false);
  const [selectedBPAData, setSelectedBPAData] = useState(null);

  // State for InfoAset modal
  const [isInfoAsetOpen, setIsInfoAsetOpen] = useState(false);
  const [selectedAsetData, setSelectedAsetData] = useState(null);

  // Function to open InfoBA modal
  const openInfoBA = (bpaData) => {
    setSelectedBPAData(bpaData);
    setIsInfoBAOpen(true);
  };

  // Function to close InfoBA modal
  const closeInfoBA = () => {
    setIsInfoBAOpen(false);
  };

  // Function to open InfoAset modal
  const openInfoAset = (asetData) => {
    setSelectedAsetData(asetData);
    setIsInfoAsetOpen(true);
  };

  // Function to close InfoAset modal
  const closeInfoAset = () => {
    setIsInfoAsetOpen(false);
  };

  const exportToExcel = () => {
    // Create a workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare the data for export
    const exportData = filteredData.map((item, index) => {
      // Format the price for export
      let price = typeof item.harga === 'string' && item.harga.includes('Rp.') 
        ? item.harga 
        : `Rp. ${parseInt(item.harga || 0).toLocaleString('id-ID')}`;
      
      return {
        'No': (index + 1),
        'Kode Barang': item.kode_barang || item.kodeBarang || '',
        'Nama Barang': item.nama_barang || item.namaBarang || '',
        'Merk Barang': item.merk_barang || item.merkBarang || '',
        'Jumlah': item.jumlah || 0,
        'Satuan': item.satuan || '',
        'Harga': price,
        'Kondisi': item.kondisi || 'Tidak diketahui',
        'Lokasi': item.lokasi || '',
        'Tanggal': item.tanggal_pembelian || item.tanggal || '',
        'Kode Rekening Belanja': item.kode_rekening_belanja || item.bpaData?.kodeRekeningBelanja || '',
        'No SPK/Faktur/Kuitansi': item.no_spk_faktur_kuitansi || item.bpaData?.noSPK || '',
        'No BAST': item.no_bast || item.bpaData?.noBAST || '',
        'Sumber Perolehan': item.sumber_perolehan || item.bpaData?.sumberPerolehan || 'N/A',
        'Kode Rekening Aset': item.kode_rekening_aset || item.asetData?.kodeRekeningAset || '',
        'Nama Rekening Aset': item.nama_rekening_aset || item.asetData?.namaRekeningAset || '',
        'Umur Ekonomis': item.umur_ekonomis || item.asetData?.umurEkonomis || '',
        'Nilai Perolehan': item.nilai_perolehan || item.asetData?.nilaiPerolehan || '',
        'Beban Penyusutan': item.beban_penyusutan || item.asetData?.bebanPenyusutan || ''
      };
    });
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },   // No
      { wch: 20 },  // Kode Barang
      { wch: 30 },  // Nama Barang
      { wch: 20 },  // Merk Barang
      { wch: 10 },  // Jumlah
      { wch: 10 },  // Satuan
      { wch: 20 },  // Harga
      { wch: 15 },  // Kondisi
      { wch: 15 },  // Lokasi
      { wch: 12 },  // Tanggal
      { wch: 20 },  // Kode Rekening Belanja
      { wch: 20 },  // No SPK/Faktur/Kuitansi
      { wch: 15 },  // No BAST
      { wch: 20 },  // Sumber Perolehan
      { wch: 20 },  // Kode Rekening Aset
      { wch: 25 },  // Nama Rekening Aset
      { wch: 15 },  // Umur Ekonomis
      { wch: 15 },  // Nilai Perolehan
      { wch: 15 },  // Beban Penyusutan
    ];
    ws['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Report');
    
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create an export filename
    const fileName = `asset_report_${timestamp}.xlsx`;
    
    // Export the file
    XLSX.writeFile(wb, fileName);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Function to handle month selection
  const handleMonthSelect = (month) => {
    console.log("Selected month:", month);
    setSelectedMonth(month);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  // Function to handle year selection
  const handleYearSelect = (year) => {
    console.log("Selected year:", year);
    setSelectedYear(year);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  // Add these new state variables
  const [isDeleting, setIsDeleting] = useState(false);
  const [borrowingSuccess, setBorrowingSuccess] = useState(false);

  // Add this new function to handle delete all functionality
  const handleDeleteAll = async () => {
    // Show a confirmation dialog with strong warning
    const confirmResult = window.confirm(
      'WARNING: This will permanently delete ALL assets. This action cannot be undone. Are you absolutely sure?'
    );
    
    if (confirmResult) {
      // Double-check with a more specific confirmation
      const secondConfirm = window.confirm(
        `You are about to delete ${filteredData.length} assets. Please confirm once more to proceed.`
      );
      
      if (secondConfirm) {
        try {
          setIsDeleting(true);
          
          // Call the API to delete all assets
          await deleteAllAssets();
          
          // Success message
          alert('All assets have been successfully deleted.');
          
          // Refresh the asset list
          await fetchAssets();
          
        } catch (error) {
          console.error("Error deleting all assets:", error);
          alert(`Failed to delete all assets: ${error.response?.data?.message || error.message}`);
        } finally {
          setIsDeleting(false);
        }
      }
    }
  };

  // Handler for borrow submit
  const handlePinjamSubmit = async (borrowData) => {
    try {
      // No need to call API here, as PinjamModal already does it
      // Just show a success message
      setBorrowingSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setBorrowingSuccess(false);
      }, 3000);
      
      // Refresh assets to update quantities
      fetchAssets();
    } catch (error) {
      console.error("Error processing borrow request:", error);
      alert(`Failed to process borrow request: ${error.message}`);
    }
  };

  return (
    <div className="asset-home-container">
      <Sidebar />

      <div className="main-content">
        {isLoading ? (
          <div className="loading">Loading assets...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="header">
              <h2 style={{ marginRight: "10px" }}>Asset</h2>
              
              <div className="header-buttons">
                <SearchBar
                  searchTerm={searchTerm}
                  handleSearchChange={handleSearchChange} />

                <button 
                  className={`filter-button ${activeFilters > 0 ? 'active' : ''}`} 
                  onClick={openFilterModal}
                >
                  <img src={filterIcon} alt="Filter" />
                  Filter
                  {activeFilters > 0 && (
                    <span className="filter-badge">{activeFilters}</span>
                  )}
                </button>

                <button 
                  className="main-button export-button" 
                  onClick={exportToExcel}
                  disabled={isLoading || filteredData.length === 0}
                >
                  <FaDownload style={{ marginRight: '5px' }} /> Export 
                </button>

                <button className="main-button" onClick={() => openModal()}>
                  <img src={addIcon} alt="Add" className="icon" /> Add
                </button>
              </div>
            </div>

            {borrowingSuccess && (
              <div className="success-message" style={{ 
                color: 'green', 
                background: '#e7f7e7', 
                padding: '10px', 
                borderRadius: '5px',
                marginBottom: '15px',
                textAlign: 'center'
              }}>
                Peminjaman asset berhasil dicatat. Lihat di halaman Peminjaman.
              </div>
            )}

            <AssetTable 
              paginatedData={paginatedData}
              openInfoBA={openInfoBA}
              openInfoAset={openInfoAset}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onPinjamSubmit={handlePinjamSubmit}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage} // Make sure itemsPerPage is defined in your component state
            />

            <div className="pagination-total-container">
              
              <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
              <div className="delete-all-container">
                <button 
                  className={`delete-all-button ${isDeleting ? 'deleting' : ''}`}
                  onClick={handleDeleteAll}
                  disabled={isDeleting || isLoading || filteredData.length === 0}
                >
                  <FaTrash className="icon" /> 
                  {isDeleting ? 'Deleting...' : 'Delete All'}
                </button>
              </div>
              <div className="total-value">Total: Rp. {totalValue.toLocaleString("id-ID")}</div>
            </div>

            <ModalAssetPage
              isOpen={isModalOpen}
              closeModal={closeModal}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              handleSubmit={handleSubmit}
              assetData={selectedAsset}
              isEditMode={isEditMode}
            />

            <FilterModal
              isOpen={isFilterModalOpen}
              closeModal={closeFilterModal}
              months={months}
              years={years}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              handleMonthSelect={handleMonthSelect}
              handleYearSelect={handleYearSelect}
              applyFilters={applyFilters}
            />

            <InfoBA
              isOpen={isInfoBAOpen}
              closeModal={closeInfoBA}
              bpaData={selectedBPAData}
            />

            <InfoAset
              isOpen={isInfoAsetOpen}
              closeModal={closeInfoAset}
              asetData={selectedAsetData}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default AssetPage;