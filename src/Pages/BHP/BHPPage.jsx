import React, { useState, useEffect } from "react";
import '../../CSS/Asset.css';
import filterIcon from "../../assets/filter_icon.svg";
import addIcon from "../../assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import ModalAssetPage from "../../Components/ModalAssetPage";
import SidebarBHP from '../../Layout/SidebarBHP';
import SearchBar from '../../Components/SearchBar';
import FilterModal from "../../Components/FilterModal";
import BHPTable from '../../Components/BHPTable';
import * as XLSX from 'xlsx';
import { FaDownload } from 'react-icons/fa';

// Function to generate a random date within the last 3 years
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

// Generate random BHP data
const generateRandomBHPData = (count = 200) => {
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
    { name: "Amplop", kodeRekening: "5.2.2.01", merk: "Paperline" },
    { name: "Correction Pen", kodeRekening: "5.2.2.01", merk: "Kenko" },
    { name: "Tip-Ex", kodeRekening: "5.2.2.01", merk: "Joyko" },
    { name: "Folder File", kodeRekening: "5.2.2.01", merk: "Bantex" },
    { name: "Tinta Stempel", kodeRekening: "5.2.2.01", merk: "Artline" },
    { name: "Pembersih Laptop", kodeRekening: "5.2.2.11", merk: "Cling" }
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const randomItem = bhpItems[Math.floor(Math.random() * bhpItems.length)];
    const stockAwal = Math.floor(Math.random() * 100) + 10; // Random stock between 10-109
    const hargaSatuan = (Math.floor(Math.random() * 20) + 1) * 5000; // Random price between 5K-100K
    
    return {
      id: i + 1,
      nama_barang: randomItem.name,
      kode_rekening: randomItem.kodeRekening,
      merk: randomItem.merk,
      tanggal: generateRandomDate(), // Add random date
      stock_awal: stockAwal,
      stock_akhir: stockAwal, // Initially same as stock_awal
      harga_satuan: hargaSatuan
    };
  });
};

// Create dummy BHP data
const bhpDummyData = generateRandomBHPData();

function BHPPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Number of items per page
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(bhpDummyData);
  const [assets, setAssets] = useState(bhpDummyData);
  const [isLoading, setIsLoading] = useState(false); // Changed to false since we're using dummy data
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(Math.ceil(bhpDummyData.length / itemsPerPage));
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Add missing state variables
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);

  // Search functionality
  useEffect(() => {
    const filtered = assets.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        item.nama_barang?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.kode_rekening?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.merk?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, assets]);

  // Calculate total value
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let overallTotal = 0;
    filteredData.forEach((item) => {
      const stockAkhir = item.stock_akhir || item.stockAkhir || item.stock_awal || 0;
      const hargaSatuan = item.harga_satuan || 0;
      overallTotal += hargaSatuan * stockAkhir;
    });
    setTotalValue(overallTotal);
  }, [filteredData]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Function to open the modal
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

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAsset(null);
    setIsEditMode(false);
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting BHP data:', formData);
      
      // With dummy data, we'll just add to the asset state
      const newBhpItem = {
        id: assets.length + 1,
        nama_barang: formData.nama_barang || formData.namaBarang,
        kode_rekening: formData.kode_rekening || formData.kodeRekening,
        merk: formData.merk,
        stock_awal: parseInt(formData.stock_awal || formData.stockAwal || 0),
        stock_akhir: parseInt(formData.stock_awal || formData.stockAwal || 0),
        harga_satuan: parseInt(formData.harga_satuan || formData.hargaSatuan || 0)
      };
      
      const updatedAssets = [...assets, newBhpItem];
      setAssets(updatedAssets);
      setFilteredData(updatedAssets);
      
      // Close modal
      closeModal();
      
      // Show success message
      alert('BHP item added successfully.');
      
    } catch (error) {
      console.error("Error saving BHP item:", error);
      alert('Failed to add BHP item. Please try again.');
    }
  };

  // Handle edit button click in table
  const handleEditClick = (asset) => {
    openModal(asset);
  };

  // Handle delete button click in table
  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this BHP item?")) {
      try {
        // With dummy data, we'll just filter the array
        const updatedAssets = assets.filter(item => (item.id || item.no) !== id);
        setAssets(updatedAssets);
        setFilteredData(updatedAssets);
        alert("BHP item deleted successfully");
      } catch (error) {
        console.error("Error deleting BHP item:", error);
        alert("Failed to delete BHP item. Please try again.");
      }
    }
  };

  // Months array with "All" as the first option
  const months = ["All", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  // Years array with "All" as the first option
  const currentYear = new Date().getFullYear();
  const years = ["All", ...Array.from({ length: 30 }, (_, index) => currentYear - index)];

  // Change default values for selected month and year to "All"
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // Functions for filter modal
  const openFilterModal = () => {
    setIsFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    closeFilterModal();
  };

  // Update active filters count
  useEffect(() => {
    let count = 0;
    if (selectedMonth !== "All") count++;
    if (selectedYear !== "All") count++;
    setActiveFilters(count);
  }, [selectedMonth, selectedYear]);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add the missing handleDecrementStock function
  const handleDecrementStock = (itemId) => {
    setAssets(prevAssets => {
      return prevAssets.map(item => {
        if ((item.id || item.no) === itemId) {
          const stockAkhir = Math.max(0, (item.stock_akhir || item.stockAkhir || item.stock_awal || 0) - 1);
          return { ...item, stock_akhir: stockAkhir };
        }
        return item;
      });
    });
    
    // Update filtered data as well
    setFilteredData(prevFiltered => {
      return prevFiltered.map(item => {
        if ((item.id || item.no) === itemId) {
          const stockAkhir = Math.max(0, (item.stock_akhir || item.stockAkhir || item.stock_awal || 0) - 1);
          return { ...item, stock_akhir: stockAkhir };
        }
        return item;
      });
    });
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
        'Tanggal': item.tanggal || '', // Add tanggal to export
        'Stock Awal': item.stock_awal || 0,
        'Stock Akhir': item.stock_akhir || 0,
        'Harga Satuan': `Rp. ${parseInt(item.harga_satuan || 0).toLocaleString('id-ID')}`,
        'Jumlah Awal': `Rp. ${parseInt((item.stock_awal || 0) * (item.harga_satuan || 0)).toLocaleString('id-ID')}`,
        'Jumlah Akhir': `Rp. ${parseInt((item.stock_akhir || 0) * (item.harga_satuan || 0)).toLocaleString('id-ID')}`
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
      { wch: 12 },  // Tanggal
      { wch: 12 },  // Stock Awal
      { wch: 12 },  // Stock Akhir
      { wch: 15 },  // Harga Satuan
      { wch: 15 },  // Jumlah Awal
      { wch: 15 },  // Jumlah Akhir
    ];
    ws['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'BHP Report');
    
    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create an export filename
    const fileName = `bhp_report_${timestamp}.xlsx`;
    
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
        {isLoading ? (
          <div className="loading">Loading BHP items...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="header">
              <h2 style={{ marginRight: "10px" }}>BHP</h2>
              
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
            
            <BHPTable 
              paginatedData={paginatedData}
              onDecrementStock={handleDecrementStock}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            <div className="pagination-total-container">
              <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
              <div className="total-value">Total: Rp. {totalValue.toLocaleString("id-ID")}</div>
            </div>

            {/* Use the ModalAssetPage component with edit mode */}
            <ModalAssetPage
              isOpen={isModalOpen}
              closeModal={closeModal}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              handleSubmit={handleSubmit}
              assetData={selectedAsset}
              isEditMode={isEditMode}
            />
            
            {/* Add the FilterModal component */}
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
          </>
        )}
      </div>
    </div>
  );
}

export default BHPPage;