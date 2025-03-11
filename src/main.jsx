// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './Pages/App';
import './CSS/index.css'; // or ./index.scss

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);