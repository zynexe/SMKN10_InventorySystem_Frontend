// AssetPage.js
import React, { useState, useEffect } from "react";
import "./Asset.css";
import calendarMonth from "./assets/calenderMonth.png";
import calendarYear from "./assets/calenderYear.png";
import addIcon from "./assets/add.png";
import { useNavigate } from "react-router-dom";
import Pagination from "./Components/Pagination";
import ModalAssetPage from "./Components/ModalAssetPage"; // Import the new modal component
import { FaEdit, FaTrashAlt } from 'react-icons/fa'; // Import icons
import Sidebar from './Layout/Sidebar'; // Import Sidebar
import SearchBar from './Components/SearchBar'; // Import SearchBar

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
    let pageTotal = 0;
    paginatedData.forEach((item) => {
      const price = parseFloat(item.harga.replace("Rp.", "").replace(/\./g, ""));
      pageTotal += price * item.jumlah;
    });
    setTotalValue(pageTotal);
  }, [paginatedData]);

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

  return (
    <div className="asset-home-container">
      <Sidebar /> 

      <div className="main-content">
        <div className="header">
            <h2 style={{ marginRight: "10px" }}>Asset</h2>
            <div className="header-buttons">
                <SearchBar searchTerm={searchTerm} handleSearchChange={handleSearchChange} /> {/* Use SearchBar */}
                <button className="secondary-button">
                    <img src={calendarMonth} alt="CalendarMonth" /> Januari
                </button>
                <button className="secondary-button">
                    <img src={calendarYear} alt="CalendarYear" /> 2025
                </button>
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
                      <button className="more-info">More Info</button>
                    </td>
                    <td>
                      <button className="more-info">More Info</button>
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
      </div>
    </div>
  );
}

export default AssetPage;