import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'; // pastikan ini ada
import App from './App';
import Callback from './callback';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/callback" element={<Callback />} />
    </Routes>
  </BrowserRouter>
);
