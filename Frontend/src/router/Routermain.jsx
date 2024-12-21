import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../pages/Layout/Layout';
import LoginForm from '../pages/LoginForm/LoginForm';
import SignupForm from '../pages/SignUpForm/SignupForm';
import Dashboard from '../pages/Dashboard/Dashboard';
import Settings from '../pages/Dashboard/Settings';
import Profile from '../pages/Dashboard/Profile';
import Teams from '../pages/Teams/Teams';
import Documents from '../pages/Documents/Documents';

export const Routermain = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [userData, setUserData] = useState(null);
  const location = useLocation();  // Get the current route

  useEffect(() => {
    // Skip login check when the route is '/login' or '/signup'
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      checkLoginStatus();
    }
  }, [location.pathname]); // Depend on location.pathname to trigger on route change

  const checkLoginStatus = async () => {
    console.log('Checking login status...');
    try {
      const response = await axios.get('http://localhost:3000/api/user/check', {
        withCredentials: true,  // Ensure credentials (cookies/tokens) are sent with the request
      });
      console.log('Login status check response:', response);

      if (response.status === 200 && response.data.message === 'User is logged in') {
        setIsLoggedIn(true);
        console.log('User is logged in');
        // Check if user data is already in localStorage
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));  // Load from localStorage
        } else {
          fetchUserData();  // Fetch user data if not available in localStorage
        }
      } else {
        setIsLoggedIn(false);
        console.log('User is not logged in');
        localStorage.removeItem('userData');  // Clear userData from localStorage if not logged in
      }
    } catch (error) {
      // Explicitly handle 401 Unauthorized status
      if (error.response && error.response.status === 401) {
        setIsLoggedIn(false);
        console.log('User is not logged in (401 error)');
        localStorage.removeItem('userData');  // Clear userData from localStorage if not logged in
      } else {
        console.error('Error checking login status:', error);
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/user/data', {
        withCredentials: true,
      });
      console.log('Fetched user data:', response);
      if (response.status === 200) {
        const data = response.data.data;
        setUserData(data);  // Store in state
        localStorage.setItem('userData', JSON.stringify(data));  // Save to localStorage
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Show a loading state until we know if the user is logged in or not
  // Show only if not in auth pages
  if (location.pathname !== '/login' && location.pathname !== '/signup') {
    if (isLoggedIn === null) {
      console.log('Loading, checking login status...');
      return <div className='Loading'>Loading...</div>;
    }
  }

  // If the user is not logged in and trying to access protected routes, redirect to the login page
  if (isLoggedIn === false && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // If user data is not yet available, show a loading state
  if (userData === null && isLoggedIn === true) {
    console.log('Loading user data...');
    return <div className='Loading'>Loading user data...</div>;
  }

  return (
    <Routes>
      <Route element={<Layout userData={userData} />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/document/:id" element={<Documents />} />
      </Route>

      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignupForm />} />
    </Routes>
  );
};
