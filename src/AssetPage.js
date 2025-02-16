import React, { useState, useEffect } from "react";
import "./Asset.css";
import logo from "./logo.png";
import homeIcon from "./assets/home.png";
import assetIcon from "./assets/asset.png";
import kodeRekeningIcon from "./assets/kode-rekening.png";
import gedungIcon from "./assets/gedung.png";
import profileIcon from "./assets/profile.png";
import switchIcon from "./assets/switch.png";
import calendarMonth from "./assets/calenderMonth.png";
import calendarYear from "./assets/calenderYear.png";
import addIcon from "./assets/add.png";
import { useNavigate } from "react-router-dom";
import Modal from 'react-modal';

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
  
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [filteredData, setFilteredData] = useState(assetData); // State for filtered data

    useEffect(() => {
        // Filter data based on search term
        const filtered = assetData.filter(item => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            return (
                item.kodeBarang.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.namaBarang.toLowerCase().includes(lowerCaseSearchTerm) ||
                item.merkBarang.toLowerCase().includes(lowerCaseSearchTerm) // Add more fields if needed
            );
        });
        setFilteredData(filtered);
    }, [searchTerm]); // Re-filter when searchTerm changes

  
    const paginatedData = filteredData.slice( // Use filteredData for pagination
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

  const renderPagination = () => {
    let pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => setCurrentPage(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis">...</span>);
      }
      pages.push(
        <button key={totalPages} onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  const [totalValue, setTotalValue] = useState(0); // State for total value

    useEffect(() => {
        // Calculate total value for the current page's items
        let pageTotal = 0;
        paginatedData.forEach(item => {
            // Remove "Rp." and any thousands separators before converting to number
            const price = parseFloat(item.harga.replace("Rp.", "").replace(/\./g, ""));
            pageTotal += price * item.jumlah;
        });
        setTotalValue(pageTotal);
    }, [paginatedData]); // Recalculate when paginatedData changes

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // Track current step (1, 2, or 3)

    const openModal = () => {
        setIsModalOpen(true);
        setCurrentStep(1); // Reset step to 1 when modal opens
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit(e); // Submit on the last step
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission here (e.g., send data to API)
      console.log("Form submitted!");
      closeModal(); // Close the modal after submit
    };

    const renderBreadcrumbs = () => {
        const steps = [
            { label: '1. Info Barang', step: 1 },
            { label: '2. Info BPA Penerimaan', step: 2 },
            { label: '3. Info Barang', step: 3 },
        ];

        return (
            <div className="breadcrumb">
                {steps.map((s) => (
                    <div key={s.step} className={`breadcrumb-item ${currentStep >= s.step ? 'active' : ''}`}>
                        {s.label}
                    </div>
                ))}
            </div>
        );
    };

  const customStyles = { // Custom styles for the modal (optional)
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '580px', // Adjust as needed
        maxWidth: '90vw', // For smaller screens
         // Optional: Add border radius to the modal
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        zIndex: 1000, // Ensure it's on top
    },
};
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };



  return (
    <div className="asset-home-container">
      <div className="sidebar">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <ul className="nav-links">
          <li>
            <a href="#" onClick={() => navigate("/asset-home")}>
              <img src={homeIcon} alt="Home" className="icon" />
              Home
            </a>
          </li>
          <li>
            <a href="#" className="active" onClick={() => navigate("/asset-page")}>
              <img src={assetIcon} alt="Asset" className="icon" />
              Asset
            </a>
          </li>
          <li>
            <a href="#">
              <img src={kodeRekeningIcon} alt="Kode Rekening" className="icon" />
              Kode Rekening
            </a>
          </li>
          <li>
          <a href="#" onClick={() => navigate("/gedung")}>
              <img src={gedungIcon} alt="Gedung" className="icon" />
              Gedung
          </a>
          </li>
          <li>
            <a href="#">
              <img src={profileIcon} alt="Profile" className="icon" />
              Profile
            </a>
          </li>
        </ul>
        <div className="switch-system">
          <button onClick={() => navigate("/choose-system")}>
            <img src={switchIcon} alt="Switch System" className="icon" />
            Switch System
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h2 style={{ marginRight: '10px' }}>Asset</h2>
          
          <div className="header-buttons">
          <div className="search-container"> {/* Container for search bar */}
              <input
                  type="text"
                  placeholder="Cari Item / Kode Barang"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
              />
          </div>
            <button className="secondary-button">
              <img src={calendarMonth} alt="CalendarMonth" /> Januari
            </button>
            <button className="secondary-button">
              <img src={calendarYear} alt="CalendarYear" /> 2025
            </button>
            <button className="main-button" onClick={openModal}> {/* Open modal on click */}
              <img src={addIcon} alt="Add" className="icon" /> Add
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="asset-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode Barang</th>
                <th>Nama Barang</th>
                <th>Merk Barang</th>
                <th>Satuan</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Lokasi</th>
                <th>Info BPA Penerimaan</th>
                <th>Info Asset</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => (
                <tr key={item.no}>
                  <td>{item.no}</td>
                  <td>{item.kodeBarang}</td>
                  <td>{item.namaBarang}</td>
                  <td>{item.merkBarang}</td>
                  <td>{item.satuan}</td>
                  <td>{item.jumlah}</td>
                  <td>{item.harga}</td>
                  <td>{item.lokasi}</td>
                  <td><button className="more-info">More Info</button></td>
                  <td><button className="more-info">More Info</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        

        <div className="pagination-total-container">  {/* New container */}
                    <div className="pagination">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>❮</button>
                      {renderPagination()} 
                      <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>❯</button>
                    </div>
                    <div className="total-value">
                        Total: Rp. {totalValue.toLocaleString('id-ID')}
                    </div>
                </div>
        {/* React Modal */}
        <Modal // React Modal component
                    isOpen={isModalOpen}
                    onRequestClose={closeModal} // Handles closing on overlay click or Esc key
                    style={customStyles} // Apply custom styles if needed
                    contentLabel="Add Asset Modal" // For accessibility
                >
                    <h2 style={{ textAlign: 'center' }}>Add Asset</h2>
                    {renderBreadcrumbs()} {/* Render breadcrumbs */}
                    
                  <form onSubmit={currentStep === 3 ? handleSubmit : handleNext}> {/* Conditionally handle submit or next */}
                      {/* Conditionally render form content based on currentStep */}
                      {currentStep === 1 && (
                          <div>
                              {/* ... Step 1 form fields */}
                              <div className="form-group">
                                  <label htmlFor="kodeBarang">Kode Barang (ID)</label>
                                  <input type="text" id="kodeBarang" name="kodeBarang"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="namaBarang">Nama Barang</label>
                                  <input type="text" id="namaBarang" name="namaBarang"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="merkBarang">Merk Barang</label>
                                  <input type="text" id="merkBarang" name="merkBarang"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="jumlah">Jumlah</label>
                                  <input type="number" id="jumlah" name="jumlah"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="satuan">Satuan</label>
                                  <input type="text" id="satuan" name="satuan"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="harga">Harga (Rupiah)</label>
                                  <input type="number" id="harga" name="harga"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="lokasi">Lokasi</label>
                                  <input type="text" id="lokasi" name="lokasi"  />
                              </div>
                          </div>
                      )}
                      {currentStep === 2 && (
                          <div>
                              {/* ... Step 2 form fields */}
                              <div className="form-group">
                                  <label htmlFor="Tanggal">Tanggal</label>
                                  <input type="date" id="Tanggal" name="Tanggal"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="SumberPerolehan">Sumber Perolehan </label>
                                  <input type="text" id="SumberPerolehan" name="SumberPerolehan"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="KoderingBelanja">Kodering Belanja</label>
                                  <input type="text" id="KoderingBelanja" name="KoderingBelanja"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="No.SPKFakturKuitansi">No.SPK /Faktur / Kuitansi</label>
                                  <input type="text" id="No.SPKFakturKuitansi" name="No.SPKFakturKuitansi"  />
                              </div>
                              <div className="form-group">
                                  <label htmlFor="NoBAPenerimaan">No BA Penerimaan</label>
                                  <input type="number" id="NoBAPenerimaan" name="NoBAPenerimaan"  />
                              </div>
                        
                             
                          </div>
                      )}
                      {currentStep === 3 && (
                          <div>
                              {/* ... Step 3 form fields */}
                              <p>Step 3 content</p> {/* Replace with your form fields */}
                          </div>
                      )}

                        <div className="modal-buttons">
                            {currentStep > 1 ? ( // If currentStep is greater than 1, show "Back" button
                                <button type="button" className="secondary-button" onClick={handleBack}>
                                    Back
                                </button>
                            ) : ( // Otherwise, show a "Close" button
                                <button type="button" className="secondary-button" onClick={closeModal}>
                                    Close
                                </button>
                            )}
                            <button type="submit" className="main-button">
                                {currentStep === 3 ? 'Submit' : 'Next'}
                            </button>
                        </div>
                  </form>
                </Modal>
      </div>
    </div>
  );
}

export default AssetPage;
