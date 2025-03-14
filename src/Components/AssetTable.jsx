import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const AssetTable = ({ 
    paginatedData, 
    openInfoBA, 
    openInfoAset,
    onEditClick,
    onDeleteClick
}) => {
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

    return (
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
                        <th>Kondisi</th>
                        <th>Lokasi</th>
                        <th>Tanggal</th>
                        <th>Info BPA Penerimaan</th>
                        <th>Info Asset</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item) => (
                        <tr key={item.id || item.no}>
                            <td>{item.no || item.id}</td>
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
                            <td>{item.lokasi}</td>
                            <td>{item.tanggal}</td>
                            <td>
                                <button 
                                    className="more-info" 
                                    onClick={() => openInfoBA({
                                        kodeRekeningBelanja: item.kode_rekening_belanja || item.bpaData?.kodeRekeningBelanja,
                                        noSPK: item.no_spk || item.bpaData?.noSPK,
                                        noBAST: item.no_bast || item.bpaData?.noBAST,
                                    })}
                                    disabled={!item.kode_rekening_belanja && !item.bpaData}
                                >
                                    More Info
                                </button>
                            </td>
                            <td>
                                <button 
                                    className="more-info" 
                                    onClick={() => openInfoAset({
                                        kodeRekeningAset: item.kode_rekening_aset || item.asetData?.kodeRekeningAset,
                                        namaRekeningAset: item.nama_rekening_aset || item.asetData?.namaRekeningAset,
                                        umurEkonomis: item.umur_ekonomis || item.asetData?.umurEkonomis,
                                        nilaiPerolehan: item.nilai_perolehan || item.asetData?.nilaiPerolehan,
                                        bebanPenyusutan: item.beban_penyusutan || item.asetData?.bebanPenyusutan,
                                    })}
                                    disabled={!item.kode_rekening_aset && !item.asetData}
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
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AssetTable;