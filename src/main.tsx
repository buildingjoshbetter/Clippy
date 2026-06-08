import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

document.addEventListener('contextmenu', (e) => {
  if (!(e.target as HTMLElement).closest('[data-allow-context-menu]')) {
    e.preventDefault();
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
