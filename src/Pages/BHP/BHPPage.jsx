import React, { useState, useEffect } from "react";
import '../../CSS/Asset.css';
import addIcon from "../../assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import ModalBHPPage from '../../Components/ModalBHPPage';
import SidebarBHP from '../../Layout/SidebarBHP';
import SearchBar from '../../Components/SearchBar';
import BHPTable from '../../Components/BHPTable';
import { FaDownload } from 'react-icons/fa';
import { 
  getBHPs, 
  addBHPManually, 
  removeBHP, 
  exportBHP,
  decrementBHPStock
} from "../../services/api";
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

  // Add state for stock decrement modal
  const [isDecrementModalOpen, setIsDecrementModalOpen] = useState(false);
  const [selectedItemForDecrement, setSelectedItemForDecrement] = useState(null);
  
  // Total value state
  const [totalValue, setTotalValue] = useState(0);

  // Fetch BHP items from API
  const fetchBHPItems = async () => {
    try {
      setIsLoading(true);
      const response = await getBHPs();
      console.log('Raw API Response:', response);
      
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
      
      const normalizedBHPs = bhpItems.map(item => {
        const stockAkhir = Math.max(
          parseInt(item.stock_akhir || 0),
          parseInt(item['Stock Akhir'] || 0)
        );
        
        item.stock_akhir = stockAkhir;
        item['Stock Akhir'] = stockAkhir;
        
        return item;
      });

      setAssets(normalizedBHPs);
      setFilteredData(normalizedBHPs);
      setTotalPages(Math.ceil(normalizedBHPs.length / itemsPerPage));
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

  useEffect(() => {
    fetchBHPItems();
  }, []);

  useEffect(() => {
    if (assets.length > 0) {
      console.log('Search term changed to:', searchTerm);
      
      if (!searchTerm.trim()) {
        setFilteredData(assets);
        setTotalPages(Math.ceil(assets.length / itemsPerPage));
        return;
      }
      
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const searchFiltered = assets.filter((item) => {
        const namaBarang = (item.nama_barang || item['Nama Barang'] || '').toLowerCase();
        const kodeRekening = (item.kode_rekening || item['Kode Rekening'] || '').toLowerCase();
        const merk = (item.merk || item.Merk || '').toLowerCase();
        
        return (
          namaBarang.includes(lowerCaseSearchTerm) ||
          kodeRekening.includes(lowerCaseSearchTerm) ||
          merk.includes(lowerCaseSearchTerm)
        );
      });
      
      console.log(`Search found ${searchFiltered.length} items from ${assets.length} total`);
      
      setFilteredData(searchFiltered);
      setTotalPages(Math.ceil(searchFiltered.length / itemsPerPage));
    }
  }, [searchTerm, assets]);

  const handleSearchChange = (e) => {
    console.log('Search input changed:', e.target.value);
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    let overallTotal = 0;
    
    filteredData.forEach((item) => {
      const stockAkhir = Math.max(
        parseInt(item.stock_akhir || 0), 
        parseInt(item['Stock Akhir'] || 0)
      );
      
      const hargaSatuan = parseInt(item.harga_satuan || item['Harga Satuan'] || 0);
      
      const itemTotal = stockAkhir * hargaSatuan;
      
      overallTotal += itemTotal;
    });
    
    setTotalValue(overallTotal);
  }, [filteredData]);

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

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBHP(null);
    setIsEditMode(false);
  };

  const handleSubmit = async (formData) => {
    try {
      console.log('Submitting BHP data:', formData);
      
      if (isEditMode && selectedBHP) {
        const updatedAssets = assets.map(item => {
          if (item.id === selectedBHP.id) {
            return {
              ...item,
              ...formData,
              stock_akhir: formData.stock_awal
            };
          }
          return item;
        });
        
        setAssets(updatedAssets);
        setFilteredData(updatedAssets);
        alert('BHP item updated successfully');
      } else {
        const result = await addBHPManually(formData);
        console.log('Manual add result:', result);
        
        fetchBHPItems();
        alert('BHP item added successfully');
      }
      
      closeModal();
      
    } catch (error) {
      console.error("Error saving BHP item:", error);
      alert(`Failed to save BHP item: ${error.message || 'Unknown error'}`);
    }
  };

  const handleImportSuccess = (importedData) => {
    console.log('Import completed successfully', importedData);
    
    if (importedData && Array.isArray(importedData) && importedData.length > 0) {
      setAssets(importedData);
      setFilteredData(importedData);
      setTotalPages(Math.ceil(importedData.length / itemsPerPage));
      alert('Import completed successfully');
    } else {
      console.log("Import success but data format unexpected. Fetching all BHP items...");
      fetchBHPItems();
      alert('Import completed successfully. Refreshing data...');
    }
  };

  const handleEditClick = (asset) => {
    openModal(asset);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this BHP item?")) {
      try {
        setIsLoading(true);
        await removeBHP(id);
        alert("BHP item deleted successfully");
        fetchBHPItems(); // Refresh the item list after deletion
      } catch (error) {
        console.error("Error deleting BHP item:", error);
        alert(`Failed to delete BHP item: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDecrementStock = (itemId) => {
    const item = assets.find(item => item.id === itemId);
    
    if (!item) {
      alert('Item not found');
      return;
    }
    
    const currentStock = Math.max(
      parseInt(item.stock_akhir || 0), 
      parseInt(item['Stock Akhir'] || 0)
    );
    
    if (currentStock <= 0) {
      alert('Stock is already 0');
      return;
    }
    
    item.stock_akhir = currentStock;
    item['Stock Akhir'] = currentStock;
    
    setSelectedItemForDecrement(item);
    setIsDecrementModalOpen(true);
  };

  const handleDecrementConfirm = async (formData) => {
    try {
      setIsLoading(true);
      
      console.log('Decrementing stock for item:', selectedItemForDecrement);
      console.log('Decrement data:', formData);
      
      // Use the new decrementBHPStock function instead of removeBHP
      await decrementBHPStock(selectedItemForDecrement.id, {
        volume: formData.volume,
        taker_name: formData.taker_name
      });
      
      setIsDecrementModalOpen(false);
      fetchBHPItems(); // Refresh the items list
      
      alert('Stock decreased successfully. The transaction has been recorded.');
    } catch (error) {
      console.error('Error decreasing stock:', error);
      alert(`Failed to decrease stock: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      
      console.log("Initiating BHP export through API...");
      
      const response = await exportBHP();
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      let filename = `bhp_export_${timestamp}.xlsx`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Export completed successfully");
      alert('Export successful!');
    } catch (error) {
      console.error("Export error:", error);
      alert(`Export failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
            <h2 style={{ marginRight: "10px" }}>Barang Habis Pakai</h2>
            
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