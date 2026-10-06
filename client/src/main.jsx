import React from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [apiStatus, setApiStatus] = React.useState('Connecting to server…');

  React.useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/health`)
      .then((response) => {
        if (!response.ok) throw new Error('Server returned an error');
        return response.json();
      })
      .then((data) => setApiStatus(data.message))
      .catch(() => setApiStatus('Backend not connected yet'));
  }, []);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div className="brand-mark" aria-hidden="true">P</div>
        <p className="eyebrow">ROBOTICS LAB INVENTORY</p>
        <h1>PartsPal</h1>
        <p className="intro">A simpler way to keep track of the parts that keep your robots moving.</p>
        <div className="status-card" role="status">
          <span className="status-dot" />
          <div>
            <strong>API status</strong>
            <p>{apiStatus}</p>
          </div>
        </div>
        <p className="next-step">Inventory tools are coming next.</p>
      </section>
      <footer>Built for the Robotics Club · VIT Chennai</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
