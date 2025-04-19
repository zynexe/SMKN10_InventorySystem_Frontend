import React from 'react';

function FilterModal({ 
  isOpen, 
  closeModal, 
  months = [], 
  years = [], 
  selectedMonth, 
  selectedYear, 
  handleMonthSelect, 
  handleYearSelect,
  applyFilters 
}) {
  console.log("FilterModal rendering, isOpen:", isOpen);
  console.log("Months:", months);
  console.log("Years:", years);
  console.log("Selected:", selectedMonth, selectedYear);
  
  if (!isOpen) return null;
  
  // Ensure months and years are arrays to prevent mapping errors
  const safeMonths = Array.isArray(months) ? months : ["All"];
  const safeYears = Array.isArray(years) ? years : ["All"];

  return (
    <div className="modal-overlay" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="modal-content filter-modal" style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px',
        padding: '20px',
        width: '80%',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h2>Filter Assets</h2>
        <button 
          className="close-button" 
          onClick={closeModal}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >×</button>
        
        <div className="filter-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          margin: '20px 0'
        }}>
          <div className="filter-section">
            <h3>Month</h3>
            <div className="filter-options" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '8px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {safeMonths.map(month => (
                <button
                  key={month}
                  className={`filter-option ${month === selectedMonth ? 'selected' : ''}`}
                  onClick={() => handleMonthSelect(month)}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #e2e2e2',
                    borderRadius: '4px',
                    backgroundColor: month === selectedMonth ? '#4A6FDC' : 'white',
                    color: month === selectedMonth ? 'white' : 'black',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {month === 'All' ? 'All Months' : month}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-section">
            <h3>Year</h3>
            <div className="filter-options" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
              gap: '8px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {safeYears.map(year => (
                <button
                  key={year}
                  className={`filter-option ${year === selectedYear ? 'selected' : ''}`}
                  onClick={() => handleYearSelect(year)}
                  style={{
                    padding: '8px 10px',
                    border: '1px solid #e2e2e2',
                    borderRadius: '4px',
                    backgroundColor: year === selectedYear ? '#4A6FDC' : 'white',
                    color: year === selectedYear ? 'white' : 'black',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {year === 'All' ? 'All Years' : year}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="modal-footer" style={{
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button 
            className="main-button" 
            onClick={() => {
              if (typeof applyFilters === 'function') {
                applyFilters();
              }
              closeModal();
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4A6FDC',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;