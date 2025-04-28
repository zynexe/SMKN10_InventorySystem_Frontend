import React from 'react';
import { FaMinus } from 'react-icons/fa';

const BHPTable = ({ 
    paginatedData, 
    onDecrementStock,
    currentPage = 1,
    itemsPerPage = 25
}) => {
    // Function to format number as Indonesian Rupiah
    const formatRupiah = (amount) => {
        if (!amount && amount !== 0) return '-';
        return `Rp. ${parseInt(amount).toLocaleString('id-ID')}`;
    };

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>Nama Barang</th>
                        <th>Kode Rekening</th>
                        <th>Merk</th>
                        <th>Tanggal</th> {/* New column */}
                        <th>Stock Awal</th>
                        <th>Pengurangan</th>
                        <th>Stock Akhir</th>
                        <th>Harga Satuan</th>
                        <th>Jumlah Awal</th>
                        <th>Jumlah Akhir</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((item, index) => {
                        // Calculate row number based on current page and index
                        const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                        
                        // Calculate values
                        const stockAwal = item.stock_awal || item.stockAwal || 0;
                        const stockAkhir = item.stock_akhir || item.stockAkhir || stockAwal;
                        const hargaSatuan = item.harga_satuan || item.hargaSatuan || 0;
                        const jumlahAwal = stockAwal * hargaSatuan;
                        const jumlahAkhir = stockAkhir * hargaSatuan;
                        
                        return (
                            <tr key={item.id || index}>
                                <td>{rowNumber}</td>
                                <td>{item.nama_barang || item.namaBarang}</td>
                                <td>{item.kode_rekening || item.kodeRekening}</td>
                                <td>{item.merk}</td>
                                <td>{item.tanggal || '-'}</td> {/* New column */}
                                <td>{stockAwal}</td>
                                <td>
                                    <button 
                                        className="icon-button decrease-button"
                                        onClick={() => onDecrementStock(item.id || index)}
                                        disabled={stockAkhir <= 0}
                                    >
                                        <FaMinus />
                                    </button>
                                </td>
                                <td>{stockAkhir}</td>
                                <td>{formatRupiah(hargaSatuan)}</td>
                                <td>{formatRupiah(jumlahAwal)}</td>
                                <td>{formatRupiah(jumlahAkhir)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BHPTable;