// GedungDetails.js
import React, { useState, useEffect } from 'react';
import './Asset.css';
import Modal from 'react-modal';
import Pagination from './Components/Pagination'; // Assuming Pagination component is in components folder

function GedungDetails({ isOpen, closeModal, gedung = { name: 'Unknown' }  }) {
    const [assetData, setAssetData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10); // Set items per page
    const [totalItems, setTotalItems] = useState(0);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        // Fetch or simulate fetching asset data for the selected gedung
        const fetchAssetData = async () => {
            // Replace this with your actual data fetching logic (API call, etc.)
            // For now, let's use some dummy data based on the gedung name
            const dummyData = Array.from({ length: 635 }, (_, i) => ({
                no: i + 1,
                kodeBarang: `1.3.2.06.01.02.${126 + i}`,
                namaBarang: `CANON EOS 3000D KIT 18-55MM (Gedung ${gedung.name})`, // Include gedung name
                merkBarang: "Canon Eos",
                satuan: "Pcs",
                jumlah: 1,
                harga: "Rp. 9.743.000",
                infoBPA: "Some BPA Info", // Add dummy BPA info
                infoAsset: "Some Asset Info", // Add dummy Asset info
            }));

            setAssetData(dummyData);
            setTotalItems(dummyData.length);
            // Calculate total value (replace with your actual logic)
            const total = dummyData.reduce((sum, item) => {
                const price = parseFloat(item.harga.replace(/[^0-9]/g, '')); // Remove non-numeric chars
                return sum + price;
            }, 0);
            setTotalValue(total);
        };

        if (isOpen) { // Fetch only when the modal is open
            fetchAssetData();
        }
    }, [isOpen, gedung]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = assetData.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(totalItems / itemsPerPage);


    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1200px',
            height: '80%',
            maxHeight: '800px',
            overflow: 'auto',
            borderRadius: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.77)', // Glassmorphism background
            backdropFilter: 'blur(10px)', // Blur effect
            border: '1px solid rgba(255, 255, 255, 0.3)', // Subtle border
            boxShadow: '0 8px 32px 0 rgba(148, 163, 201, 0.7)', // Add a subtle shadow
        },
        overlay: {
            backgroundColor: 'rgba(83, 83, 83, 0.23)',

        },
    };
    

    if (!gedung) {
        return null; // or return a loading spinner
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Gedung Details Modal"
        >
           <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>{gedung.name} Details</h2> {/* Title on the left */}
                <button onClick={closeModal} className="close-button">
                    &times; {/* Close icon */}
                </button>
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
                            <th>Info BPA Penerimaan</th>
                            <th>Info Asset</th>
                            <th>Harga</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.map((item) => (
                            <tr key={item.no}>
                                <td>{item.no}</td>
                                <td>{item.kodeBarang}</td>
                                <td>{item.namaBarang}</td>
                                <td>{item.merkBarang}</td>
                                <td>{item.satuan}</td>
                                <td>{item.jumlah}</td>
                                <td>{item.infoBPA}</td>
                                <td>{item.infoAsset}</td>
                                <td>{item.harga}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pagination-total-container">
                <Pagination
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                />
                <div className="total-value">
                    Total: Rp. {totalValue.toLocaleString('id-ID')}
                </div>
            </div>
        </Modal>
    );
}

export default GedungDetails;