import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CircularProgress from '@mui/material/CircularProgress';
import './style.css';


const Dashboard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);

    // Check if user is logged in
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/user/check`, {
                    withCredentials: true
                });

                if (response.status === 200 && response.data.message === 'User is logged in') {
                    setIsLoggedIn(true);
                    fetchUserData();  // Fetch user data after login check
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error(error);
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    // Fetch user data from the API
    const fetchUserData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/user/data`, {
                withCredentials: true
            });
            if (response.status === 200) {
                setUserData(response.data.data);  // Store user data in the state
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setError('Failed to fetch user data.');
        }
    };

    if (isLoggedIn === null) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    if (isLoggedIn === false) {
        return <Navigate to="/login" replace />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Ensure userData is not null before rendering user details
    if (!userData) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <Header userData={userData} />
                <div className="content">
                    <h1>Welcome, {userData.name.first_name} {userData.name.middle_name?userData.name.middle_name: ""} {userData.name.last_name}</h1>
                    <p>Email: {userData.email}</p>
                    <p>Bio: {userData.bio}</p>
                    {/* Optionally display avatar if available */}
                    {userData.avatar ? (
                        <img src={userData.avatar} alt="User Avatar" className="avatar" />
                    ) : (
                        <p>No avatar available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
