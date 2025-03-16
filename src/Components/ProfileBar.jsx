import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileLogo from '../assets/profile.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logout } from '../services/api';
import { useUser } from '../context/UserContext'; // Import the context hook

function ProfileBar() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const { user, loading } = useUser(); // Get user data from context

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleProfileClick = () => {
        setIsOpen(false);
        navigate('/ProfilePage');
    };

    const handleLogoutClick = async () => {
        await logout();
        setIsOpen(false);
        navigate('/');
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Display username from context, or fallback to localStorage or default
    const displayName = user?.name || 
                         (localStorage.getItem('user') ? 
                          JSON.parse(localStorage.getItem('user'))?.name : 
                          'User');

    return (
        <div className="profile-bar">
            <div className="profile-info" onClick={toggleDropdown}>
                <img src={profileLogo} alt="Profile" className="profile-logo" />
                <span className="profile-name">
                    {loading ? 'Loading...' : displayName}
                </span>
            </div>

            {isOpen && (
                <div className="dropdown" ref={dropdownRef}>
                    <button className="dropdown-item" onClick={handleProfileClick}>
                        Profile
                    </button>
                    <button className="dropdown-item logout-button" onClick={handleLogoutClick}>
                        <FontAwesomeIcon icon={faSignOutAlt} /> Log out
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileBar;