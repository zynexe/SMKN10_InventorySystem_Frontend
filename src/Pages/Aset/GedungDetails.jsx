// GedungDetails.js
import React, { useState, useEffect } from 'react';
import '../../CSS/Asset.css';
import Modal from 'react-modal';
import Pagination from '../../Components/Pagination';
import AssetTable from '../../Components/AssetTable';
import InfoBA from '../../Components/InfoBA';
import InfoAset from '../../Components/InfoAset';
import { getAssets } from '../../services/api'; // Import the API function

function GedungDetails({ isOpen, closeModal, gedung = { name: 'Unknown', nama_gedung: 'Unknown', id: null } }) {
    const [assetData, setAssetData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalValue, setTotalValue] = useState(0);
    const [isInfoBAOpen, setIsInfoBAOpen] = useState(false);
    const [isInfoAsetOpen, setIsInfoAsetOpen] = useState(false);
    const [selectedBPAData, setSelectedBPAData] = useState(null);
    const [selectedAsetData, setSelectedAsetData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get the gedung name, accounting for different property names
    const gedungName = gedung?.nama_gedung || gedung?.name || 'Unknown';

    useEffect(() => {
        // Fetch asset data for the selected gedung
        const fetchAssetData = async () => {
            if (!isOpen || !gedung || (!gedung.id && !gedung.nama_gedung)) return;

            try {
                setLoading(true);
                setError(null);

                // Get all assets
                const response = await getAssets();

                // Filter assets by the selected gedung name or ID
                let filteredData = [];
                if (Array.isArray(response)) {
                    filteredData = response.filter(asset =>
                        asset.nama_gedung === gedungName ||
                        asset.lokasi === gedungName
                    );
                } else if (response && Array.isArray(response.data)) {
                    filteredData = response.data.filter(asset =>
                        asset.nama_gedung === gedungName ||
                        asset.lokasi === gedungName
                    );
                }

                console.log(`Filtered ${filteredData.length} assets for gedung: ${gedungName}`);

                // Format the data for the table
                const formattedData = filteredData.map((asset, index) => ({
                    no: index + 1,
                    id: asset.id,
                    kodeBarang: asset.kode || asset.kode_barang || '',
                    namaBarang: asset.nama_barang || '',
                    merkBarang: asset.merk_barang || '',
                    satuan: asset.satuan || '',
                    jumlah: asset.jumlah || 0,
                    harga: asset.harga ? `Rp. ${Number(asset.harga).toLocaleString('id-ID')}` : 'Rp. 0',
                    lokasi: asset.nama_gedung || asset.lokasi || '',
                    // BPA data
                    bpaData: {
                        noBAPenerimaan: asset.no_bast || '',
                        tanggal: asset.tanggal_pembelian || '',
                        sumberPerolehan: asset.sumber_perolehan || '',
                        no_spk_faktur_kuitansi: asset.no_spk_faktur_kuitansi || '',
                        kodeRekeningBelanja: asset.kode_rekening_belanja || ''
                    },
                    // Asset data
                    asetData: {
                        kondisi: asset.kondisi || '',
                        umurEkonomis: asset.umur_ekonomis || '',
                        nilaiPerolehan: asset.nilai_perolehan || '',
                        bebanPenyusutan: asset.beban_penyusutan || '',
                        kodeRekeningAset: asset.kode_rekening_aset || '',
                        namaRekeningAset: asset.nama_rekening_aset || ''
                    }
                }));

                setAssetData(formattedData);
                setTotalItems(formattedData.length);

                // Calculate total value
                const total = formattedData.reduce((sum, item) => {
                    const price = typeof item.harga === 'string' ?
                        parseFloat(item.harga.replace(/[^\d]/g, '')) :
                        (item.harga || 0);
                    return sum + price;
                }, 0);

                setTotalValue(total);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching asset data:', error);
                setError('Failed to load asset data. Please try again later.');
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchAssetData();
        }
    }, [isOpen, gedung, gedungName]);

    const openInfoBA = (bpaData) => {
        setSelectedBPAData(bpaData);
        setIsInfoBAOpen(true);
    };

    const openInfoAset = (asetData) => {
        setSelectedAsetData(asetData);
        setIsInfoAsetOpen(true);
    };

    const closeInfoBA = () => {
        setIsInfoBAOpen(false);
        setSelectedBPAData(null);
    };

    const closeInfoAset = () => {
        setIsInfoAsetOpen(false);
        setSelectedAsetData(null);
    };

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
            backgroundColor: 'rgba(255, 255, 255, 0.86)',
            backdropFilter: 'blur(8px)', 
            border: '1px solid rgba(255, 255, 255, 0.3)', 
            boxShadow: '0 8px 32px 0 rgba(148, 163, 201, 0.7)', 
            zIndex: 1501, // Add this line
        },
        overlay: {
            backgroundColor: 'rgba(83, 83, 83, 0.23)',
            zIndex: 1500, // Add this line
        },
    };

    if (!gedung) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Gedung Details Modal"
        >
            <div className="modal-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2>{gedungName} Details</h2>
                <button onClick={closeModal} className="close-button">
                    &times;
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <p>Loading assets...</p>
                </div>
            ) : error ? (
                <div className="error-container">
                    <p>{error}</p>
                </div>
            ) : assetData.length === 0 ? (
                <div className="no-data-container">
                    <p>No assets found for this building.</p>
                </div>
            ) : (
                <>
                    <AssetTable
                        paginatedData={currentItems}
                        openInfoBA={openInfoBA}
                        openInfoAset={openInfoAset}
                    />

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
                </>
            )}

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
        </Modal>
    );
}

export default GedungDetails;