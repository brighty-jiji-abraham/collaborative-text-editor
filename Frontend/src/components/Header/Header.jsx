import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import { FaAngleDown, FaMagnifyingGlass, FaUser } from "react-icons/fa6";
import './Header.css';

const Header = ({ userData }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to control dropdown visibility

    // Toggle dropdown visibility
    const handleDropdownToggle = () => {
        setIsDropdownOpen(prevState => !prevState);
    };

    return (
        <div className="header">
        {/* <!-- search bar --> */}
        <div className="welcome-text">
            <div className='search'>
                <form>
                    <div className="fx fx-gap">
                        <div>
                        <input type="text" placeholder="Search" required />
                        </div>
                        <div id="search-icon">
                        <button type="submit">
                            <div id="search-icon-circle"></div>
                            <span></span>
                        </button>
                        </div>
                    </div>
                </form>   
            </div>
            {/* <div className="content">
                    <h1><FaUser /> Welcome, {userData.name.first_name} {userData.name.middle_name?userData.name.middle_name: ""} {userData.name.last_name}!</h1>
            </div> */}
        </div>
            <div className="user-info" onClick={handleDropdownToggle}>
                {userData ? (
                    <div className="user-details">
                        <div className="user-profile">
                            <p className="user-name">{userData.name.first_name} {userData.name.middle_name ? userData.name.middle_name : ""} {userData.name.last_name}</p>
                            <p className="user-email">{userData.email}</p>
                        </div>
                        {userData.avatar ? (
                            <img src={userData.avatar} alt="User Avatar" className="user-avatar" />
                        ) : (
                            <div className="no-avatar">No Avatar</div>
                        )}
                        <FaAngleDown className="white" />
                    </div>
                ) : (
                    <CircularProgress />
                )}

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div className="dropdown-menu">
                        <ul>
                            <li onClick={() => alert("Profile clicked")}>Profile</li>
                            <li onClick={() => alert("Settings clicked")}>Settings</li>
                            <li onClick={() => alert("Logout clicked")}>Logout</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

Header.propTypes = {
    userData: PropTypes.shape({
        name: PropTypes.shape({ first_name: PropTypes.string, middle_name: PropTypes.string, last_name: PropTypes.string }).isRequired,
        email: PropTypes.string.isRequired,
        avatar: PropTypes.string
    })
};

export default Header;
