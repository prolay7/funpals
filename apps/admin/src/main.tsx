import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// react-admin manages its own QueryClient internally; no need to wrap separately
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
