import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { FaUserAstronaut } from "react-icons/fa6";
import { BsKeyFill } from "react-icons/bs";
import { FaLinkedin, FaInstagram, FaWhatsapp, FaGithub, FaTwitter } from 'react-icons/fa';
import { Footer } from '../../components/Footer/Footer';
import Button from '../../components/Button/Button';

const LoginForm = () => {

  const navigate = useNavigate();  // Initialize useNavigate hook

  const [isLoggedIn, setIsLoggedIn] = useState(false);  // State to track if the user is logged in

  // Check if user is logged in on mount (only once)
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user/check', {
          withCredentials: true // Allow cookies to be sent with the request
        });

        if (response.status === 200 && response.data.message === "User is logged in") {
          setIsLoggedIn(true);  // Set logged in status to true
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkLoginStatus();
  }, []); // Empty dependency array means this will run only once, after the initial render

  // // Function to set a secure cookie (non-HttpOnly, as React can't set HttpOnly cookies)
  // const setTokenAsCookie = (token) => {
  //   // Set the cookie with secure attributes
  //   document.cookie = `authToken=${token}; path=/; secure; SameSite=Strict; max-age=3600`; // 1 hour expiry
  // };

  const setMessage = (message) => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
  };

  const [Username_focused, setUsernameFocused] = useState(false);
  const [password_focused, setPasswordFocused] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/user/login', {
        username,
        password
      }, {
        withCredentials: true // Allow cookies to be sent with the request
      });

      console.log('Login successful:', response.data);
      if (response.status === 200 && response.data.data.token) {
        // const token = response.data.data.token; // Get the token from the response
        // setTokenAsCookie(token); // Set the token as a cookie
        setMessage('Login successful!');
        navigate('/', { replace: true });
      } else {
        setMessage('Login failed');
      }
      // Optionally handle success (e.g., redirect or show a success message)
    } catch (error) {
      console.error('Error during login:', error);
      // Handle error (e.g., show error message)
    }
  };

  // If the user is logged in, redirect to the home page
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className='main-container-login'>
        <div className="login-form-container">
          <div className='form-title'>
            <h1>Login</h1>
            <p className='message' id='message'></p>
          </div>
          <div className='form-content'>
            <form onSubmit={handleSubmit}>
              <div className='form-inputs'>
                <FaUserAstronaut className={`form-icon ${Username_focused ? "focused" : ""}`} />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  required
                />
              </div>
              <div className='form-inputs'>
                <BsKeyFill className={`form-icon ${password_focused ? "focused" : ""}`} />
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                />
              </div>
              <Button text="Login" type="submit" />
            </form>
          </div>

          <div className='Signup'>
            Don&apos;t have an account? <a href='/signup'>Signup</a>
          </div>

          <div className="social-media-buttons">
            <a href="https://twitter.com/B_J_A_008" target="_blank" rel="noopener noreferrer" >
              <FaTwitter className="social-icon" />
            </a>
            <a href="https://www.linkedin.com/in/brightyjijiabraham/" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="social-icon" />
            </a>
            <a href="https://www.instagram.com/brighty.jiji.abraham/" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="social-icon" />
            </a>
            <a href="https://wa.me/+919207863690" target="_blank" rel="noopener noreferrer">
              <FaWhatsapp className="social-icon" />
            </a>
            <a href="https://github.com/Brighty-Jiji-Abraham" target="_blank" rel="noopener noreferrer">
              <FaGithub className="social-icon" />
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginForm;
