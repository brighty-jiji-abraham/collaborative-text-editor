// src/components/Layout/Layout.jsx
import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import { Outlet } from 'react-router-dom';  // Use this to render child routes dynamically
import PropTypes from 'prop-types';

//Adding display name for better debugging
const Layout = React.memo(({ userData }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header userData={userData} />
        <Outlet /> {/* This renders the page's content */}
      </div>
    </div>
  );
});
Layout.displayName = "Layout";

Layout.propTypes = {
  userData: PropTypes.object.isRequired,
};

export default Layout;
