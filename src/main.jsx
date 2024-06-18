// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';  // Updated import
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import 'antd/dist/reset.css';

const root = ReactDOM.createRoot(document.getElementById('root'));  // Create root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
