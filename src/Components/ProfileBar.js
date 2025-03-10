import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileLogo from '../assets/profile.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { logoutUser } from '../services/api';

function ProfileBar() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleProfileClick = () => {
        // Implement navigation to the profile page
        console.log('Go to profile page');
        setIsOpen(false);
        navigate('/ProfilePage'); // Redirect to the profile page
    };

    const handleLogoutClick = async () => {
        try {
            await logoutUser();
            setIsOpen(false);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally show error message to user
            // If logout API fails, still clear local storage and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/', { replace: true });
        }
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

    return (
        <div className="profile-bar">
            <div className="profile-info" onClick={toggleDropdown}>
                <img src={profileLogo} alt="Profile" className="profile-logo" />
                <span className="profile-name">Mamank Asep</span>
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