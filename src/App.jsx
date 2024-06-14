// src/App.js
import React from 'react';
import {Routes, Route } from 'react-router-dom';
import Home from './components/home/home';
import Patients from './components/patients/patients';


function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients" element={<Patients />} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </div>

  );
}

export default App;
