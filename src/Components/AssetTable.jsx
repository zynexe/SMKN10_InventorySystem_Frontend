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
                return 'badge badge-success';
            case 'pemakaian ringan':
                return 'badge badge-warning';
            case 'rusak':
                return 'badge badge-danger';
            default:
                return 'badge badge-secondary';
        }
    };

    const hasBPAData = (item) => {
        // existing function implementation
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
        // existing function implementation
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item, index) => {
                            const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                            const hasBPA = hasBPAData(item);
                            const hasAset = hasAssetData(item);
                            
                            return (
                                <tr key={item.id || item.no || index}>
                                    <td>{rowNumber}</td>
                                    <td>{item.tanggal_pembelian || item.tanggal}</td>
                                    <td>{item.kode_barang || item.kodeBarang}</td>
                                    <td>{item.nama_barang || item.namaBarang}</td>
                                    <td>{item.merk_barang || item.merkBarang}</td>
                                    <td>{item.jumlah}</td>
                                    <td>{item.satuan}</td>
                                    <td>{typeof item.harga === 'string' && item.harga.includes('Rp') ? 
                                        item.harga : 
                                        `Rp. ${parseInt(item.harga).toLocaleString('id-ID')}`}</td>
                                    <td>
                                        <span className={getKondisiBadgeClass(item.kondisi)}>
                                            {item.kondisi || 'Tidak diketahui'}
                                        </span>
                                    </td>
                                    <td>{item.lokasi || item.nama_gedung}</td>
                                    <td className="pinjam-column">
                                        <button 
                                            className="main-button pinjam-button"
                                            onClick={() => handlePinjamClick(item)}
                                            disabled={item.jumlah <= 0}
                                            title={item.jumlah <= 0 ? 'Stok tidak tersedia' : 'Pinjam/Berikan asset'}
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
                                                onClick={() => onDeleteClick(item.id || item.no)}
                                            >
                                                <FaTrashAlt />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
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