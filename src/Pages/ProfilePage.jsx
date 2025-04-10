import React, { useState, useEffect } from 'react';
import PPBackground from '../assets/PPBackground.png';
import ProfilePic from '../assets/ProfileImage.png';
import Sidebar from '../Layout/Sidebar';
import '../CSS/Asset.css';
import { changeUsername, changePassword } from '../services/api';
import { useUser } from '../context/UserContext'; 

const ProfilePage = () => {
    const { user, loading: userLoading, updateUserInfo, fetchUser } = useUser(); // Get user data and update function
    const [newName, setNewName] = useState('');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Set initial name value when user data is loaded
    useEffect(() => {
        if (user?.name) {
            setNewName(user.name);
        }
    }, [user]);

    // Handle input change for password fields
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle username change
    const handleChangeName = async () => {
        if (!newName.trim()) {
            setError('Username cannot be empty');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await changeUsername(newName);
            
            // Update user context with new name
            updateUserInfo({ name: newName });
            
            setSuccess('Username updated successfully!');
            
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            console.error('Error changing username:', err);
            
            // Check for specific error types
            if (err.response) {
                if (err.response.status === 405) {
                    setError('This operation is not supported. Please contact support.');
                } else if (err.response.status === 422) {
                    // Validation errors
                    const validationErrors = err.response.data.errors;
                    if (validationErrors && validationErrors.name) {
                        setError(validationErrors.name.join('. '));
                    } else {
                        setError(err.response.data.message || 'Invalid username format');
                    }
                } else {
                    setError(err.response.data.message || 'Failed to update username. Please try again.');
                }
            } else {
                setError('Network error. Please check your connection and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle password change
    const handleResetPassword = async (e) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirmation do not match');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await changePassword(currentPassword, newPassword, confirmPassword);
            setSuccess('Password changed successfully!');
            
            // Reset password fields
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            
            setTimeout(() => {
                setSuccess(null);
            }, 3000);
        } catch (err) {
            console.error('Error resetting password:', err);
            if (err.response?.status === 422) {
                // Validation errors
                const validationErrors = err.response.data.errors;
                if (validationErrors) {
                    const errorMessages = Object.values(validationErrors).flat();
                    setError(errorMessages.join('. '));
                } else {
                    setError(err.response.data.message || 'Validation failed. Please check your inputs.');
                }
            } else {
                setError(err.response?.data?.message || 'Failed to change password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="asset-home-container">
            <Sidebar />
            <div className="main-content">
                <div className="profile-page-container">
                    <div className="profile-page-header" style={{ backgroundImage: `url(${PPBackground})` }}>
                        {/* Header content */}
                         {/* Notification display */}
                         {error && (
                            <div className="error-message">
                                {error}
                                <button className="close-message" onClick={() => setError(null)}>×</button>
                            </div>
                        )}
                          {success && (
                            <div className="success-message">
                                {success}
                                <button className="close-message" onClick={() => setSuccess(null)}>×</button>
                            </div>
                        )}
                    </div>

                    <div className="profile-page-content">
                       
                      

                        <div className="profile-image-name-wrapper">
                            <div className="profile-page-image">
                                <img src={ProfilePic} alt="Profile" />
                            </div>
                            <h2 className="profile-page-name">{userLoading ? 'Loading...' : user?.name}</h2>
                        </div>

                        <div className="profile-page-section">
                            <h3>Profile</h3>
                            <div className="section-divider"></div>
                            <div className="profile-page-input">
                                <input 
                                    type="text" 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)} 
                                    disabled={loading || userLoading}
                                />
                                <button 
                                    className="change-name-button" 
                                    onClick={handleChangeName}
                                    disabled={loading || userLoading || newName === user?.name}
                                >
                                    {loading ? 'Updating...' : 'Change Name'}
                                </button>
                            </div>
                        </div>

                        <div className="password-page-section">
                            <h3>Password</h3>
                            <div className="section-divider"></div>
                            <div className="password-page-inputs">
                                <input 
                                    type="password" 
                                    name="currentPassword"
                                    placeholder="Current Password" 
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                />
                                <input 
                                    type="password" 
                                    name="newPassword"
                                    placeholder="New Password" 
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    placeholder="Confirm Password" 
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    disabled={loading}
                                />
                                <button 
                                    className="reset-password-button"
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Reset Password'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;