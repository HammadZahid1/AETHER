import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return <div className="min-h-screen bg-[#05070c] text-white p-8">AETHER initializing…</div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);