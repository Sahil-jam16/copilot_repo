import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';  // render App, not Home
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
