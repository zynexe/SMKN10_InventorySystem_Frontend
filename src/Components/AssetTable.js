import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const AssetTable = ({ 
    paginatedData, 
    openInfoBA, 
    openInfoAset 
}) => {
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
                        <th>Lokasi</th>
                        <th>Tanggal</th> {/* Add new column header */}
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
                            <td>{item.tanggal}</td> {/* Add new column data */}
                            <td>
                                <button 
                                    className="more-info" 
                                    onClick={() => openInfoBA(item.bpaData)}
                                >
                                    More Info
                                </button>
                            </td>
                            <td>
                                <button 
                                    className="more-info" 
                                    onClick={() => openInfoAset(item.asetData)}
                                >
                                    More Info
                                </button>
                            </td>
                            <td>
                                <div className="actions-container">
                                    <button className="icon-button edit-button">
                                        <FaEdit />
                                    </button>
                                    <button className="icon-button delete-button">
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