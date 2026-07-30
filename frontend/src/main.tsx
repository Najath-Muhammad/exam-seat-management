import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
// Removing strict mode double rendering which can cause double-refresh calls during development
// Though Axios interceptors and queue handle it, it's cleaner for token refresh flow observation.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
