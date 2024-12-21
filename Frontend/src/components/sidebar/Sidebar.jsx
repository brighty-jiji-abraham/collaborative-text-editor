import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Use Link for client-side navigation
import logo from '../../assets/logo.png';
import './Sidebar.css';  // Ensure you have styles for your sidebar
import { Footer } from '../Footer/Footer';

const Sidebar = React.memo(function Sidebar() {
  const [activeLink, setActiveLink] = useState('/');  // Track the active link

  // Handle link click to update the active link
  const handleClick = (link) => {
    setActiveLink(link);  // Set the clicked link as active
  };

  return (
    <div className="sidebar">
      <div className="logo">
        <img src={logo} alt="Logo" className="logo-img" />
      </div>
      <div className="nav-links">
        <ul>
          {/* Update active link based on the state */}
          <li>
            <Link 
              to="/" 
              onClick={() => handleClick('/')}
              className={activeLink === '/' ? 'active' : ''}  // Conditionally add 'active' class
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/teams" 
              onClick={() => handleClick('/teams')}
              className={activeLink === '/teams' ? 'active' : ''}
            >
              Teams
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              onClick={() => handleClick('/profile')}
              className={activeLink === '/profile' ? 'active' : ''}
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>
      <Footer />
    </div>
  );
});

export default Sidebar;
