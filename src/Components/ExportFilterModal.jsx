import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const ExportFilterModal = ({ isOpen, onClose, onConfirm }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate years (current year and previous 5 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const years = generateYears();

  // Reset to defaults when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMonth('all');
      setSelectedYear(new Date().getFullYear());
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm({
      month: selectedMonth,
      year: selectedYear
    });
  };

  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '400px',
      padding: '20px',
      borderRadius: '8px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1000,
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Export Filter Modal"
    >
      <div className="export-filter-modal">
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Pilih Bulan dan Tahun Export</h3>
        
        <div className="form-group" style={{ marginBottom: '15px' }}>
          <label htmlFor="month" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Month:
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label htmlFor="year" style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Year:
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button 
            type="button" 
            className="secondary-button" 
            onClick={onClose}
            style={{ padding: '8px 16px' }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="main-button" 
            onClick={handleConfirm}
            style={{ padding: '8px 16px' }}
          >
            Export
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExportFilterModal;