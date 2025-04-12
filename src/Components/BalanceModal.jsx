import React, { useState } from 'react';
import '../CSS/Asset.css';

const BalanceModal = ({ isOpen, closeModal, currentBalance, onUpdateBalance, isLoading }) => {
    const [activeTab, setActiveTab] = useState('edit');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    if (!isOpen) return null;
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            setError('Please enter a valid positive number');
            return;
        }
        
        try {
            setIsSubmitting(true);
            setError(''); // Clear previous errors
            
            // Log action
            console.log(`${activeTab === 'add' ? 'Adding' : 'Setting'} balance: ${parseFloat(amount)}`);
            
            // Call the parent component's update function which now uses the API
            await onUpdateBalance(parseFloat(amount), activeTab === 'add');
            
            // Reset form
            setAmount('');
            setError('');
        } catch (error) {
            console.error('Error in balance modal:', error);
            setError(error.response?.data?.message || 'Failed to update balance. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h3>Balance Management</h3>
                    <button className="close-button" onClick={closeModal}>×</button>
                </div>
                
                <div className="modal-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'edit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('edit')}
                    >
                        Edit Balance
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        Add Balance
                    </button>
                </div>
                
                <div className="modal-content">
                    <div className="balance-info">
                        {isLoading ? (
                            <p>Loading balance...</p>
                        ) : (
                            <p>Current Balance: <strong>Rp. {currentBalance.toLocaleString('id-ID')}</strong></p>
                        )}
                    </div>
                    
                    {activeTab === 'edit' ? (
                        <div className="balance-form">
                            <p className="balance-description">
                                Ubah Jumlah Saldo Saat Ini Menjadi Jumlah Saldo yang Diinginkan
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="edit-balance">Edit Balance</label>
                                    <input
                                        id="edit-balance"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter new balance amount"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {error && <p className="error-message">{error}</p>}
                                <div className="form-buttons">
                                    <button 
                                        type="button" 
                                        className="cancel-button" 
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '' : 'Update Balance'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="balance-form">
                            <p className="balance-description">
                            Menambahkan Saldo Tambahan. Jumlah yang dimasukan akan Ditambahkan ke Saldo yang Sekarang
                            </p>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="add-balance">Amount to Add (Rp)</label>
                                    <input
                                        id="add-balance"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount to add"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                {error && <p className="error-message">{error}</p>}
                                <div className="form-buttons">
                                    <button 
                                        type="button" 
                                        className="cancel-button" 
                                        onClick={closeModal}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '' : 'Add to Balance'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BalanceModal;