import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { Routermain } from './router/Routermain';  // Import Routermain component

function App() {
  return (
    <BrowserRouter>  {/* Ensure BrowserRouter wraps the entire app */}
      <Routermain />  {/* Routermain is now inside BrowserRouter */}
    </BrowserRouter>
  );
}

export default App;
