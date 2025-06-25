import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import PinjamModal from './PinjamModal';
import { getPeminjamanAset } from '../services/api';

const AssetTable = ({ 
    paginatedData, 
    openInfoBA, 
    openInfoAset,
    onEditClick,
    onDeleteClick,
    onPinjamSubmit,
    currentPage = 1,
    itemsPerPage = 25
}) => {
    // Add state for the pinjam modal
    const [isPinjamModalOpen, setIsPinjamModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [previousBorrowers, setPreviousBorrowers] = useState([]);
    const [isLoadingBorrowers, setIsLoadingBorrowers] = useState(false);
    
    // Debug log to check what data is being received
    console.log("AssetTable paginatedData:", paginatedData);
    
    // Load previous borrowers from the API
    useEffect(() => {
        const fetchPreviousBorrowers = async () => {
            setIsLoadingBorrowers(true);
            try {
                const response = await getPeminjamanAset();
                if (response && Array.isArray(response)) {
                    // Extract unique borrower names
                    const borrowers = [...new Set(response.map(item => item.nama_peminjam || item.nama_pengambil))];
                    setPreviousBorrowers(borrowers.filter(Boolean));
                }
            } catch (error) {
                console.error('Error loading previous borrowers:', error);
            } finally {
                setIsLoadingBorrowers(false);
            }
        };
        
        fetchPreviousBorrowers();
    }, []);
    
    // Function to handle pinjam button click
    const handlePinjamClick = (item) => {
        setSelectedAsset(item);
        setIsPinjamModalOpen(true);
    };
    
    // Function to handle pinjam form submission
    const handlePinjamSubmit = (borrowData) => {
        if (onPinjamSubmit) {
            onPinjamSubmit(borrowData);
        }
        
        // Add the new borrower to the list if not already included
        if (borrowData.nama_pengambil && !previousBorrowers.includes(borrowData.nama_pengambil)) {
            setPreviousBorrowers(prev => [...prev, borrowData.nama_pengambil]);
        }
    };

    // Helper function to determine badge class based on condition
    const getKondisiBadgeClass = (kondisi) => {
        switch(kondisi?.toLowerCase()) {
            case 'baru':
            case 'baik':
                return 'badge badge-success';
            case 'pemakaian ringan':
                return 'badge badge-warning';
            case 'rusak':
                return 'badge badge-danger';
            default:
                return 'badge badge-secondary';
        }
    };

    // Helper function to safely get nested property values
    const getProperty = (item, keys, defaultValue = 'N/A') => {
        for (const key of keys) {
            if (item[key] !== undefined && item[key] !== null && item[key] !== '') {
                return item[key];
            }
        }
        return defaultValue;
    };

    const hasBPAData = (item) => {
        const hasBPA = !!(
            item.kode_rekening_belanja || 
            item.no_spk_faktur_kuitansi || 
            item.no_bast || 
            item.sumber_perolehan ||
            (item.bpaData && (
                item.bpaData.kodeRekeningBelanja || 
                item.bpaData.noSPK || 
                item.bpaData.noBAST ||
                item.bpaData.sumberPerolehan
            ))
        );
        return hasBPA;
    };

    const hasAssetData = (item) => {
        const hasAset = !!(
            item.kode_rekening_aset || 
            item.nama_rekening_aset || 
            item.umur_ekonomis || 
            item.nilai_perolehan ||
            item.beban_penyusutan ||
            (item.asetData && (
                item.asetData.kodeRekeningAset || 
                item.asetData.namaRekeningAset || 
                item.asetData.umurEkonomis ||
                item.asetData.nilaiPerolehan ||
                item.asetData.bebanPenyusutan
            ))
        );
        return hasAset;
    };

    // Helper function to format price
    const formatPrice = (price) => {
        if (typeof price === 'string' && price.includes('Rp')) {
            return price;
        }
        const numPrice = parseInt(price) || 0;
        return `Rp. ${numPrice.toLocaleString('id-ID')}`;
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID');
        } catch (error) {
            return dateString; // Return original if parsing fails
        }
    };

    return (
        <>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Tanggal</th>
                            <th>Kode Barang</th>
                            <th>Nama Barang</th>
                            <th>Merk Barang</th>
                            <th>Jumlah</th>
                            <th>Satuan</th>
                            <th>Harga</th>
                            <th>Kondisi</th>
                            <th>Lokasi</th>
                            <th>Pinjam/Berikan</th>
                            <th>Info BPA Penerimaan</th>
                            <th>Info Asset</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData && paginatedData.length > 0 ? (
                            paginatedData.map((item, index) => {
                                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                const hasBPA = hasBPAData(item);
                                const hasAset = hasAssetData(item);
                                
                                // Extract data with multiple fallback options
                                const kodeBarang = getProperty(item, ['kode_barang', 'kodeBarang', 'kode']);
                                const namaBarang = getProperty(item, ['nama_barang', 'namaBarang', 'nama']);
                                const merkBarang = getProperty(item, ['merk_barang', 'merkBarang', 'merk']);
                                const jumlah = getProperty(item, ['jumlah', 'volume'], 0);
                                const satuan = getProperty(item, ['satuan'], 'Pcs');
                                const harga = getProperty(item, ['harga', 'harga_satuan'], 0);
                                const kondisi = getProperty(item, ['kondisi'], 'Tidak diketahui');
                                const lokasi = getProperty(item, ['lokasi', 'nama_gedung'], 'Tidak diketahui');
                                const tanggal = formatDate(getProperty(item, ['tanggal_pembelian', 'tanggal', 'created_at']));
                                
                                return (
                                    <tr key={item.id || item.aset || index}>
                                        <td>{rowNumber}</td>
                                        <td>{tanggal}</td>
                                        <td>{kodeBarang}</td>
                                        <td>{namaBarang}</td>
                                        <td>{merkBarang}</td>
                                        <td>{jumlah}</td>
                                        <td>{satuan}</td>
                                        <td>{formatPrice(harga)}</td>
                                        <td>
                                            <span className={getKondisiBadgeClass(kondisi)}>
                                                {kondisi}
                                            </span>
                                        </td>
                                        <td>{lokasi}</td>
                                        <td className="pinjam-column">
                                            <button 
                                                className="main-button pinjam-button"
                                                onClick={() => handlePinjamClick(item)}
                                                disabled={jumlah <= 0}
                                                title={jumlah <= 0 ? 'Stok tidak tersedia' : 'Pinjam/Berikan asset'}
                                                style={{ marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                                            >
                                                Pinjam
                                            </button>
                                        </td>
                                        <td>
                                            <button 
                                                className={`more-info ${!hasBPA ? 'disabled' : ''}`}
                                                onClick={() => openInfoBA({
                                                    kodeRekeningBelanja: item.kode_rekening_belanja || (item.bpaData?.kodeRekeningBelanja) || 'Tidak diketahui',
                                                    noSPK: item.no_spk_faktur_kuitansi || (item.bpaData?.noSPK) || 'Tidak diketahui',
                                                    noBAST: item.no_bast || (item.bpaData?.noBAST) || 'Tidak diketahui',
                                                    sumberPerolehan: item.sumber_perolehan || (item.bpaData?.sumberPerolehan) || 'Tidak diketahui',
                                                })}
                                                disabled={!hasBPA}
                                                title={hasBPA ? 'View BA Information' : 'No BA Information Available'}
                                            >
                                                More Info
                                            </button>
                                        </td>
                                        <td>
                                            <button 
                                                className={`more-info ${!hasAset ? 'disabled' : ''}`}
                                                onClick={() => openInfoAset({
                                                    kodeRekeningAset: item.kode_rekening_aset || (item.asetData?.kodeRekeningAset) || 'Tidak diketahui',
                                                    namaRekeningAset: item.nama_rekening_aset || (item.asetData?.namaRekeningAset) || 'Tidak diketahui',
                                                    umurEkonomis: item.umur_ekonomis || (item.asetData?.umurEkonomis) || 'Tidak diketahui',
                                                    nilaiPerolehan: item.nilai_perolehan || (item.asetData?.nilaiPerolehan) || 'Tidak diketahui',
                                                    bebanPenyusutan: item.beban_penyusutan || (item.asetData?.bebanPenyusutan) || 'Tidak diketahui',
                                                })}
                                                disabled={!hasAset}
                                                title={hasAset ? 'View Asset Information' : 'No Asset Information Available'}
                                            >
                                                More Info
                                            </button>
                                        </td>
                                        <td>
                                            <div className="actions-container">
                                                <button 
                                                    className="icon-button edit-button"
                                                    onClick={() => onEditClick(item)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    className="icon-button delete-button"
                                                    onClick={() => onDeleteClick(item.id || item.aset)}
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="14" className="no-data-cell" style={{ textAlign: 'center', padding: '20px' }}>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pinjam Modal */}
            <PinjamModal
                isOpen={isPinjamModalOpen}
                closeModal={() => setIsPinjamModalOpen(false)}
                assetData={selectedAsset}
                onSubmit={handlePinjamSubmit}
                previousBorrowers={previousBorrowers}
            />
        </>
    );
};

export default AssetTable;