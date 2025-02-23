// AssetPage.js
import React, { useState, useEffect, useRef } from "react";
import "./Asset.css";
import calendarMonth from "./assets/calenderMonth.png";
import calendarYear from "./assets/calenderYear.png";
import addIcon from "./assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "./Components/Pagination";
import ModalAssetPage from "./Components/ModalAssetPage";
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Sidebar from './Layout/Sidebar';
import SearchBar from './Components/SearchBar';
import Dropdown from "./Components/Dropdown";
import InfoBA from "./Components/InfoBA"; // Import InfoBA
import InfoAset from "./Components/InfoAset"; // Import InfoAset

const generateRandomNamaBarang = () => {
  const prefixes = ["CANON", "NIKON", "SONY", "FUJIFILM", "OLYMPUS"];
  const models = ["EOS 3000D", "Alpha a7 III", "X100V", "OM-D E-M10 Mark IV", "D3500"];
  const suffixes = ["KIT 18-55MM", "KIT 16-50MM", "BODY ONLY", "WITH LENS", "LENS 50MM"];

  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomModel = models[Math.floor(Math.random() * models.length)];
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  return `${randomPrefix} ${randomModel} ${randomSuffix}`;
};

const assetData = Array.from({ length: 635 }, (_, i) => ({
  no: i + 1,
  kodeBarang: `1.3.2.06.01.02.${126 + i}`,
  namaBarang: generateRandomNamaBarang(),
  merkBarang: "Canon Eos",
  satuan: "Pcs",
  jumlah: 1,
  harga: "Rp. 9.743.000",
  lokasi: "Gedung A",
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
  const totalPages = Math.ceil(assetData.length / itemsPerPage);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(assetData);

  useEffect(() => {
    const filtered = assetData.filter((item) => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
        item.kodeBarang.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.namaBarang.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.merkBarang.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
    setFilteredData(filtered);
  }, [searchTerm]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    let overallTotal = 0;
    filteredData.forEach((item) => {
      const price = parseFloat(item.harga.replace("Rp.", "").replace(/\./g, ""));
      overallTotal += price * item.jumlah;
    });
    setTotalValue(overallTotal);
  }, [filteredData]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted!");
    closeModal();
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
        
        <div className="header">
          <h2 style={{ marginRight: "10px" }}>Asset</h2>
          <div className="header-buttons">
            {/* Use SearchBar */}
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

            <button className="main-button" onClick={openModal}>
              <img src={addIcon} alt="Add" className="icon" /> Add
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Merk Barang</th>
                <th>Jumlah</th>
                <th>Satuan</th>
                <th>Harga</th>
                <th>Lokasi</th>
                <th>Info BPA Penerimaan</th>
                <th>Info Asset</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.kodeBarang}</td>
                  <td>{item.namaBarang}</td>
                  <td>{item.merkBarang}</td>
                  <td>{item.jumlah}</td>
                  <td>{item.satuan}</td>
                  <td>{item.harga}</td>
                  <td>{item.lokasi}</td>

                  <td>
                    <button className="more-info" onClick={() => openInfoBA(item.bpaData)}>More Info</button>
                  </td>
                  <td>
                    <button className="more-info" onClick={() => openInfoAset(item.asetData)}>More Info</button>
                  </td>
                  <td>
                    <div className="actions-container">
                      <button className="icon-button edit-button"> {/* Add icon-button class */}
                        <FaEdit /> {/* Use the edit icon */}
                      </button>
                      <button className="icon-button delete-button"> {/* Add icon-button class */}
                        <FaTrashAlt /> {/* Use the delete icon */}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        <div className="pagination-total-container">
          <Pagination currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
          <div className="total-value">Total: Rp. {totalValue.toLocaleString("id-ID")}</div>
        </div>

        {/* Use the ModalAssetPage component */}
        <ModalAssetPage
          isOpen={isModalOpen}
          closeModal={closeModal}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          handleSubmit={handleSubmit}
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
      </div>
    </div>
  );
}

export default AssetPage;