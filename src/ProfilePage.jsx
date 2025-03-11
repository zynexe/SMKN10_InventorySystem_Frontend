// pages/ProfilePage.js
import React from 'react';
import PPBackground from './assets/PPBackground.png'; // Adjust path as needed
import ProfilePic from './assets/ProfileImage.png'; // Place your profile pic in assets
import Sidebar from './Layout/Sidebar';
import './Asset.css'; // Import the CSS file
const ProfilePage = () => {
    return (
        <div className="asset-home-container">
            <Sidebar />
            <div className="main-content">
                <div className="profile-page-container">
                    <div className="profile-page-header" style={{ backgroundImage: `url(${PPBackground})` }}>
                        {/* Header content can go here if needed */}
                    </div>

                    <div className="profile-page-content">
                        <div className="profile-image-name-wrapper"> {/* New wrapper div */}
                            <div className="profile-page-image">
                                <img src={ProfilePic} alt="Profile" />
                            </div>
                            <h2 className="profile-page-name">Mamank Asep</h2>
                        </div>

                        <div className="profile-page-section">
                            <h3>Profile</h3>
                            <div className="section-divider"></div> {/* Add the divider here */}
                            <div className="profile-page-input">
                                <input type="text" value="Mamank Asep" />
                                <button className="change-name-button">Change Name</button>
                            </div>
                            
                        </div>

                        <div className="password-page-section">
                            <h3>Password</h3>
                             <div className="section-divider"></div> {/* Add the divider here */}
                            <div className="password-page-inputs">
                                <input type="password" placeholder="Current Password" />
                                <input type="password" placeholder="New Password" />
                                <input type="password" placeholder="Confirm Password" />
                                <button className="reset-password-button">Reset Password</button>
                            </div>
                           
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;