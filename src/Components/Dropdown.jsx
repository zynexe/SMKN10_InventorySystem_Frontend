import React, { useRef, useEffect } from 'react';

function Dropdown({ 
  options, 
  isOpen, 
  toggleDropdown, 
  handleSelect, 
  buttonContent,
  selected 
}) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                toggleDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [toggleDropdown]);

    return (
        <div className="dropdown-container" ref={dropdownRef}>
            <button 
              className={`secondary-button ${selected ? 'active' : ''}`} 
              onClick={toggleDropdown}
            >
                {buttonContent}
            </button>
            {isOpen && (
                <div className="dropdown-content">
                    {options.map((option) => (
                        <button
                            key={option}
                            onClick={() => { handleSelect(option); toggleDropdown(false); }}
                            className={`dropdown-item ${option === selected ? 'selected' : ''}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dropdown;