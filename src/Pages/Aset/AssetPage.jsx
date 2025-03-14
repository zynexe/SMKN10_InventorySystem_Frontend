// AssetPage.js
import React, { useState, useEffect, useRef } from "react";
import '../../CSS/Asset.css';
import calendarMonth from "../../assets/calenderMonth.png";
import calendarYear from "../../assets/calenderYear.png";
import addIcon from "../../assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "../../Components/Pagination";
import ModalAssetPage from "../../Components/ModalAssetPage";

import Sidebar from '../../Layout/Sidebar';
import SearchBar from '../../Components/SearchBar';
import Dropdown from "../../Components/Dropdown";
import InfoBA from "../../Components/InfoBA";
import InfoAset from "../../Components/InfoAset";
import AssetTable from '../../Components/AssetTable';

// Import the API functions
import { getAssets, addAsset, updateAsset, deleteAsset } from '../../services/api';

// Keep the dummy data generation functions for fallback
const generateRandomNamaBarang = () => {
  const prefixes = ["CANON", "NIKON", "SONY", "FUJIFILM", "OLYMPUS"];
  const models = ["EOS 3000D", "Alpha a7 III", "X100V", "OM-D E-M10 Mark IV", "D3500"];
  const suffixes = ["KIT 18-55MM", "KIT 16-50MM", "BODY ONLY", "WITH LENS", "LENS 50MM"];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomModel = models[Math.floor(Math.random() * models.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

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
  const itemsPerPage = 10;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState(null); // For edit functionality
  const [isEditMode, setIsEditMode] = useState(false);

  // Fetch assets from API
  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await getAssets();
      
      // If we got valid data, use it
      if (response && response.data && Array.isArray(response.data)) {
        setAssets(response.data);
        setFilteredData(response.data);
        setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      } else {
        // Fallback to dummy data
        console.warn("No valid data received from API, using fallback data");
        setAssets(assetData);
        setFilteredData(assetData);
        setTotalPages(Math.ceil(assetData.length / itemsPerPage));
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
      setError("Failed to load assets. Using fallback data.");
      // Fallback to dummy data on error
      setAssets(assetData);
      setFilteredData(assetData);
      setTotalPages(Math.ceil(assetData.length / itemsPerPage));
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    const filtered = assets.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        item.kode_barang?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.nama_barang?.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.merk_barang?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  }, [searchTerm, assets]);

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
      // Convert form data to API format
      const assetPayload = {
        kode_barang: formData.kodeBarang,
        nama_barang: formData.namaBarang,
        merk_barang: formData.merkBarang,
        jumlah: parseInt(formData.jumlah),
        satuan: formData.satuan,
        harga: parseInt(formData.harga),
        lokasi: formData.lokasi,
        tanggal: formData.Tanggal,
        
        // BPA data
        sumber_perolehan: formData.SumberPerolehan,
        kode_rekening_belanja: formData.KoderingBelanja,
        no_spk: formData.No_SPKFakturKuitansi,
        no_bast: formData.NoBAPenerimaan,
        
        // Aset data
        kode_rekening_aset: formData.KodeRekeningAset,
        nama_rekening_aset: formData.NamaRekeningAset,
        umur_ekonomis: parseInt(formData.UmurEkonomis),
        nilai_perolehan: parseInt(formData.NilaiPerolehan),
        beban_penyusutan: parseInt(formData.BebanPenyusutan),
      };

      let response;
      
      if (isEditMode && selectedAsset) {
        // Update existing asset
        response = await updateAsset(selectedAsset.id, assetPayload);
        console.log("Asset updated:", response);
      } else {
        // Add new asset
        response = await addAsset(assetPayload);
        console.log("Asset added:", response);
      }

      // Refresh the asset list
      await fetchAssets();
      
      // Close modal
      closeModal();
    } catch (error) {
      console.error("Error saving asset:", error);
      alert(`Failed to ${isEditMode ? 'update' : 'add'} asset. Please try again.`);
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

  // State for dropdown visibility
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Months array
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  // Years array (adjust as needed)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, index) => currentYear - index);

  // State for selected month and year
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Function to toggle month dropdown
  const toggleMonthDropdown = (isOpen) => {
    setIsMonthDropdownOpen(isOpen !== undefined ? isOpen : !isMonthDropdownOpen);
    setIsYearDropdownOpen(false); // Close year dropdown when month is opened
  };

  // Function to toggle year dropdown
  const toggleYearDropdown = (isOpen) => {
    setIsYearDropdownOpen(isOpen !== undefined ? isOpen : !isYearDropdownOpen);
    setIsMonthDropdownOpen(false); // Close month dropdown when year is opened
  };

  // Function to handle month selection
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    console.log("Selected month:", month);
  };

  // Function to handle year selection
  const handleYearSelect = (year) => {
    setSelectedYear(year);
    console.log("Selected year:", year);
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
                  handleSearchChange={handleSearchChange}  ></SearchBar>

                <Dropdown
                  options={months}
                  isOpen={isMonthDropdownOpen}
                  toggleDropdown={toggleMonthDropdown}
                  handleSelect={handleMonthSelect}
                  buttonContent={<><img src={calendarMonth} alt="CalendarMonth" /> {selectedMonth || "Januari"}</>}
                />

                <Dropdown
                  options={years}
                  isOpen={isYearDropdownOpen}
                  toggleDropdown={toggleYearDropdown}
                  handleSelect={handleYearSelect}
                  buttonContent={<><img src={calendarYear} alt="CalendarYear" /> {selectedYear || currentYear}</>}
                />

                <button className="main-button" onClick={() => openModal()}>
                  <img src={addIcon} alt="Add" className="icon" /> Add
                </button>
              </div>
            </div>

            <AssetTable 
              paginatedData={paginatedData}
              openInfoBA={openInfoBA}
              openInfoAset={openInfoAset}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
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

            {/* InfoBA Modal */}
            <InfoBA
              isOpen={isInfoBAOpen}
              closeModal={closeInfoBA}
              bpaData={selectedBPAData}
            />

            {/* InfoAset Modal */}
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