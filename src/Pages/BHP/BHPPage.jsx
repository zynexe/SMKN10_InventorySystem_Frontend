import React, { useState, useEffect } from "react";
import '../../CSS/Asset.css';
import filterIcon from "../../assets/filter_icon.svg";
import addIcon from "../../assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import ModalBHPPage from '../../Components/ModalBHPPage';
import SidebarBHP from '../../Layout/SidebarBHP';
import SearchBar from '../../Components/SearchBar';
import FilterModal from "../../Components/FilterModal";
import BHPTable from '../../Components/BHPTable';
import * as XLSX from 'xlsx';
import { FaDownload } from 'react-icons/fa';
import { getBHPs, addBHPManually, removeBHP } from "../../services/api";
import DecrementStockModal from '../../Components/DecrementStockModal';

function BHPPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Number of items per page
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [renderError, setRenderError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBHP, setSelectedBHP] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Add missing state variables
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  // Add state for stock decrement modal
  const [isDecrementModalOpen, setIsDecrementModalOpen] = useState(false);
  const [selectedItemForDecrement, setSelectedItemForDecrement] = useState(null);
  
  // Months array with "All" as the first option
  const months = ["All", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  // Years array with "All" as the first option
  const currentYear = new Date().getFullYear();
  const years = ["All", ...Array.from({ length: 30 }, (_, index) => currentYear - index)];

  // Change default values for selected month and year to "All"
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  // Fetch BHP items from API
  const fetchBHPItems = async () => {
    try {
      setIsLoading(true);
      const response = await getBHPs();
      console.log('Raw API Response:', response);
      
      // Process the data based on the API response structure
      let bhpItems = [];
      if (response && response.data) {
        console.log('Using response.data, length:', response.data.length);
        bhpItems = response.data;
      } else if (Array.isArray(response)) {
        console.log('Using response array, length:', response.length);
        bhpItems = response;
      } else {
        console.log('Response format unexpected:', typeof response);
      }
      
      console.log('Final bhpItems:', bhpItems);
      
      // Normalize stock values
      const normalizedBHPs = bhpItems.map(item => {
        // Get the highest stock value between both representations
        const stockAkhir = Math.max(
          parseInt(item.stock_akhir || 0),
          parseInt(item['Stock Akhir'] || 0)
        );
        
        // Update both representations to be consistent
        item.stock_akhir = stockAkhir;
        item['Stock Akhir'] = stockAkhir;
        
        return item;
      });

      // Always set assets to normalizedBHPs
      setAssets(normalizedBHPs);
      
      // Instead of directly setting filteredData, apply filters to ensure data formatting
      if (normalizedBHPs.length > 0) {
        // This is crucial - automatically apply filters on initial load
        setTimeout(() => applyFiltersWithData(normalizedBHPs), 0);
      } else {
        setFilteredData([]);
        setTotalPages(0);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch BHP items:', err);
      setError('Failed to load BHP items. Please try again later.');
      setAssets([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a helper function to apply filters with any data source
  const applyFiltersWithData = (dataToFilter) => {
    // Add debugging to see what's in the data
    console.log('Filtering data:', dataToFilter);
    
    // Apply date filters to the data
    const filtered = dataToFilter.filter(item => {
      // Skip filtering if both filters are set to "All"
      if (selectedMonth === "All" && selectedYear === "All") {
        return true;
      }
      
      // Debug the item's date field
      console.log('Item date field:', item.tanggal);
      
      // Extract date components from the item's tanggal
      let itemDate;
      try {
        // Handle different date formats
        if (item.tanggal) {
          // Try to parse date in different formats
          if (typeof item.tanggal === 'string' && item.tanggal.includes('/')) {
            // DD/MM/YYYY format
            const [day, month, year] = item.tanggal.split('/');
            itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else if (typeof item.tanggal === 'string' && item.tanggal.includes('-')) {
            // YYYY-MM-DD format
            itemDate = new Date(item.tanggal);
          } else {
            // Fallback - try direct parsing
            itemDate = new Date(item.tanggal);
          }
        } else if (item.created_at) {
          // Fallback to created_at if tanggal not available
          itemDate = new Date(item.created_at);
        } else {
          // No date available, include in results when not filtering
          return selectedMonth === "All" && selectedYear === "All";
        }
        
        // DEBUG: Log the parsed date
        console.log('Parsed date:', itemDate);
        
        if (isNaN(itemDate.getTime())) {
          console.error('Invalid date parsed:', item.tanggal);
          return false;
        }
        
      } catch (err) {
        console.error('Error parsing date:', item.tanggal, err);
        // Include items with unparseable dates when not filtering
        return selectedMonth === "All" && selectedYear === "All";
      }
      
      // Get month name in Indonesian
      const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      const itemMonth = monthNames[itemDate.getMonth()];
      const itemYear = itemDate.getFullYear();
      
      // DEBUG: Log the extracted month and year
      console.log(`Item date: ${itemMonth} ${itemYear}, Selected: ${selectedMonth} ${selectedYear}`);
      
      // Apply filters
      const monthMatch = selectedMonth === "All" || itemMonth === selectedMonth;
      const yearMatch = selectedYear === "All" || itemYear === parseInt(selectedYear);
      
      // DEBUG: Log the match results
      console.log(`Month match: ${monthMatch}, Year match: ${yearMatch}`);
      
      return monthMatch && yearMatch;
    });
    
    console.log(`Applied filters: Month=${selectedMonth}, Year=${selectedYear}, Results=${filtered.length}`);
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  // Initial data fetch
  useEffect(() => {
    fetchBHPItems();
  }, []);

  // Update the applyFilters function to use the helper
  const applyFilters = () => {
    setCurrentPage(1);
    closeFilterModal();
    applyFiltersWithData(assets);
  };

  // Update your search effect to preserve filter behavior
  useEffect(() => {
    if (assets.length > 0) {
      console.log('Search term changed to:', searchTerm);
      
      // If there's no search term, just apply existing filters
      if (!searchTerm.trim()) {
        applyFiltersWithData(assets);
        return;
      }
      
      // Otherwise, apply search first
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const searchFiltered = assets.filter((item) => {
        // Check multiple field names with fallbacks
        const namaBarang = (item.nama_barang || item['Nama Barang'] || '').toLowerCase();
        const kodeRekening = (item.kode_rekening || item['Kode Rekening'] || '').toLowerCase();
        const merk = (item.merk || item.Merk || '').toLowerCase();
        
        // Log what we're searching in
        console.log(`Searching "${lowerCaseSearchTerm}" in: ${namaBarang}, ${kodeRekening}, ${merk}`);
        
        return (
          namaBarang.includes(lowerCaseSearchTerm) ||
          kodeRekening.includes(lowerCaseSearchTerm) ||
          merk.includes(lowerCaseSearchTerm)
        );
      });
      
      console.log(`Search found ${searchFiltered.length} items from ${assets.length} total`);
      
      // Then apply date filters to the search results
      applyFiltersWithData(searchFiltered);
    }
  }, [searchTerm, assets]);

  // Update the handleSearchChange function
  const handleSearchChange = (e) => {
    console.log('Search input changed:', e.target.value);
    setSearchTerm(e.target.value);
    // Reset to the first page when searching
    setCurrentPage(1);
  };

  // Calculate total value
  useEffect(() => {
    let overallTotal = 0;
    
    filteredData.forEach((item) => {
      // Get stock akhir - use the highest value available
      const stockAkhir = Math.max(
        parseInt(item.stock_akhir || 0), 
        parseInt(item['Stock Akhir'] || 0)
      );
      
      // Get harga satuan with fallbacks
      const hargaSatuan = parseInt(item.harga_satuan || item['Harga Satuan'] || 0);
      
      // Calculate total value for this item
      const itemTotal = stockAkhir * hargaSatuan;
      
      // Add to overall total
      overallTotal += itemTotal;
      
      // Debug log to see what's being calculated
      console.log(`Item: ${item.nama_barang}, Stock: ${stockAkhir}, Harga: ${hargaSatuan}, Total: ${itemTotal}`);
    });
    
    console.log('Total value calculated:', overallTotal);
    setTotalValue(overallTotal);
  }, [filteredData]);

  // Function to open the modal
  const openModal = (bhpItem = null) => {
    if (bhpItem) {
      setSelectedBHP(bhpItem);
      setIsEditMode(true);
    } else {
      setSelectedBHP(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBHP(null);
    setIsEditMode(false);
  };

  // Handle form submission (both add and edit)
  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting BHP data:', formData);
      
      if (isEditMode && selectedBHP) {
        // Update existing BHP item
        // API endpoint for updating BHP isn't provided, so we'll use a placeholder
        // This would be replaced with an actual API call when available
        const updatedAssets = assets.map(item => {
          if (item.id === selectedBHP.id) {
            return {
              ...item,
              ...formData,
              // Ensure stock_akhir is set correctly
              stock_akhir: formData.stock_awal
            };
          }
          return item;
        });
        
        setAssets(updatedAssets);
        setFilteredData(updatedAssets);
        alert('BHP item updated successfully');
      } else {
        // Add new BHP item using the API
        const result = await addBHPManually(formData);
        console.log('Manual add result:', result);
        
        // Refresh the data to get the new item
        fetchBHPItems();
        alert('BHP item added successfully');
      }
      
      // Close modal
      closeModal();
      
    } catch (error) {
      console.error("Error saving BHP item:", error);
      alert(`Failed to save BHP item: ${error.message || 'Unknown error'}`);
    }
  };

  // Handle successful import
  const handleImportSuccess = (importedData) => {
    console.log('Import completed successfully', importedData);
    
    if (importedData && Array.isArray(importedData) && importedData.length > 0) {
      // If importedData is a non-empty array, update the assets directly
      setAssets(importedData);
      setFilteredData(importedData);
      setTotalPages(Math.ceil(importedData.length / itemsPerPage));
      alert('Import completed successfully');
    } else {
      // If the returned data isn't in the expected format, fetch all data again
      console.log("Import success but data format unexpected. Fetching all BHP items...");
      fetchBHPItems();
      alert('Import completed successfully. Refreshing data...');
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
        setIsLoading(true);
        await removeBHP(id);
        alert("BHP item deleted successfully");
        fetchBHPItems(); // Refresh the data after deletion
      } catch (error) {
        console.error("Error deleting BHP item:", error);
        alert(`Failed to delete BHP item: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Modify the handleDecrementStock function
  const handleDecrementStock = (itemId) => {
    // Find the item being decremented
    const item = assets.find(item => item.id === itemId);
    
    if (!item) {
      alert('Item not found');
      return;
    }
    
    // Look at both potential stock fields and use the highest value
    const currentStock = Math.max(
      parseInt(item.stock_akhir || 0), 
      parseInt(item['Stock Akhir'] || 0)
    );
    
    // Only proceed if stock is > 0
    if (currentStock <= 0) {
      alert('Stock is already 0');
      return;
    }
    
    // Set both fields to the same value to ensure consistency
    item.stock_akhir = currentStock;
    item['Stock Akhir'] = currentStock;
    
    // Open modal with this item
    setSelectedItemForDecrement(item);
    setIsDecrementModalOpen(true);
  };

  // New function to handle the confirmation from the modal
  const handleDecrementConfirm = async (formData) => {
    try {
      setIsLoading(true);
      
      // Send API request to remove items
      await removeBHP(selectedItemForDecrement.id, formData);
      
      // Success - refresh the data
      fetchBHPItems();
      
      // Show success message
      alert('Stock decreased successfully. The transaction has been recorded.');
    } catch (error) {
      console.error('Error decreasing stock:', error);
      alert(`Failed to decrease stock: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Update active filters count
  useEffect(() => {
    let count = 0;
    if (selectedMonth !== "All") count++;
    if (selectedYear !== "All") count++;
    setActiveFilters(count);
  }, [selectedMonth, selectedYear]);

  // Export to Excel function
  const exportToExcel = () => {
    try {
      // Debug check
      console.log("Exporting data:", filteredData);
      
      // Don't continue if there's no data
      if (!filteredData || filteredData.length === 0) {
        alert('No data to export');
        return;
      }
      
      // Create a workbook
      const wb = XLSX.utils.book_new();
      
      // Helper function to safely get a property value with multiple potential names
      const getProperty = (item, propertyNames, defaultValue = null) => {
        for (const name of propertyNames) {
          if (item[name] !== undefined && item[name] !== null) {
            return item[name];
          }
        }
        return defaultValue;
      };
      
      // Prepare the data for export
      const exportData = filteredData.map((item, index) => {
        // Extract all possible property values with fallbacks
        const namaBarang = getProperty(item, ['nama_barang', 'Nama Barang'], '');
        
        // Handle nested kode rekening
        let kodeRekening = getProperty(item, ['kode_rekening', 'Kode Rekening'], '');
        if (!kodeRekening && item.kodeRekening && item.kodeRekening.kode) {
          kodeRekening = item.kodeRekening.kode;
        }
        
        const merk = getProperty(item, ['merk', 'Merk'], '');
        const tanggal = getProperty(item, ['tanggal', 'Tanggal', 'created_at'], '');
        
        // Handle numeric values safely
        const stockAwal = parseInt(getProperty(
          item, 
          ['stock_awal', 'Stock_Awal', 'volume', 'Volume', 'initial_volume'], 
          0
        )) || 0;
        
        const stockAkhir = parseInt(getProperty(
          item, 
          ['stock_akhir', 'Stock_Akhir', 'final_volume', 'volume_akhir', 'total_volume'],
          stockAwal
        )) || 0;
        
        const hargaSatuan = parseInt(getProperty(
          item, 
          ['harga_satuan', 'Harga_Satuan', 'harga', 'price'], 
          0
        )) || 0;
        
        const satuan = getProperty(item, ['satuan', 'Satuan'], 'Pcs');
        
        // Calculate values
        const jumlahAwal = stockAwal * hargaSatuan;
        const jumlahAkhir = stockAkhir * hargaSatuan;
        
        // Create export row
        return {
          'No': (index + 1),
          'Nama Barang': namaBarang,
          'Kode Rekening': kodeRekening,
          'Merk': merk,
          'Tanggal': tanggal,
          'Stock Awal': stockAwal,
          'Satuan': satuan,
          'Stock Akhir': stockAkhir,
          'Harga Satuan': `Rp. ${hargaSatuan.toLocaleString('id-ID')}`,
          'Jumlah Awal': `Rp. ${jumlahAwal.toLocaleString('id-ID')}`,
          'Jumlah Akhir': `Rp. ${jumlahAkhir.toLocaleString('id-ID')}`
        };
      });
      
      // Log the export data to verify
      console.log("Data to export:", exportData);
      
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
        { wch: 10 },  // Satuan
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
      alert('Export successful!');
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const debugData = () => {
    console.log("Current assets:", assets);
    console.log("Filtered data:", filteredData);
    
    // Check the first item's date structure 
    if (assets.length > 0) {
      const firstItem = assets[0];
      console.log("Sample item:", firstItem);
      console.log("Date field:", firstItem.tanggal);
      
      // Try to parse the date
      if (firstItem.tanggal) {
        try {
          const date = new Date(firstItem.tanggal);
          console.log("Parsed date:", date);
          console.log("Month:", date.getMonth());
          console.log("Year:", date.getFullYear());
        } catch (e) {
          console.error("Failed to parse date:", e);
        }
      }
    }
  };

  useEffect(() => {
    if (assets.length > 0) {
      debugData();
    }
  }, [assets]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Safe render function to catch errors
  const renderContent = () => {
    try {
      if (isLoading) {
        return <div className="loading">Loading BHP items...</div>;
      } 
      
      if (error) {
        return (
          <div className="error">
            {error}
            <button 
              className="retry-button" 
              onClick={fetchBHPItems}
              style={{ marginLeft: '10px', padding: '5px 10px' }}
            >
              Retry
            </button>
          </div>
        );
      }
      
      return (
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
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />

          {filteredData.length > 0 && (
            <div className="pagination-total-container">
              <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
              <div className="total-value">Total: Rp. {totalValue.toLocaleString("id-ID")}</div>
            </div>
          )}

          <ModalBHPPage
            isOpen={isModalOpen}
            closeModal={closeModal}
            handleSubmit={handleSubmit}
            bhpData={selectedBHP}
            isEditMode={isEditMode}
            onImportSuccess={handleImportSuccess}
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

          <DecrementStockModal
            isOpen={isDecrementModalOpen}
            closeModal={() => setIsDecrementModalOpen(false)}
            onConfirm={handleDecrementConfirm}
            item={selectedItemForDecrement}
          />
        </>
      );
    } catch (err) {
      console.error("Render error:", err);
      return (
        <div className="error-boundary">
          <h3>Something went wrong rendering the BHP page</h3>
          <p>Error: {err.message}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Reload Page
          </button>
        </div>
      );
    }
  };

  // Modify your return statement to use the safe render function
  return (
    <div className="asset-home-container">
      <SidebarBHP />
      <div className="main-content">
        {renderError ? (
          <div className="error-boundary">
            <h3>Error Loading BHP Page</h3>
            <p>{renderError.toString()}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Reload Page
            </button>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}

export default BHPPage;