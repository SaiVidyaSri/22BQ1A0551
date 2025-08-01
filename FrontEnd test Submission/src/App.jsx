import { useState, useEffect } from 'react';
import URLShortener from './components/URLShortener';
import URLList from './components/URLList';
import Stats from './components/Stats';
import './App.css';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch URLs on component mount
  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/urls');
      const data = await response.json();
      
      if (data.success) {
        setUrls(data.data);
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCreated = (newUrl) => {
    setUrls(prev => [newUrl, ...prev]);
  };

  const handleUrlDeleted = (shortCode) => {
    setUrls(prev => prev.filter(url => url.shortCode !== shortCode));
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">
            <span className="icon">🔗</span>
            QuickLink
          </h1>
          <p className="app-subtitle">Shorten URLs instantly with analytics</p>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="grid">
            <div className="main-section">
              <URLShortener onUrlCreated={handleUrlCreated} />
              
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading your URLs...</p>
                </div>
              ) : (
                <URLList 
                  urls={urls} 
                  onUrlDeleted={handleUrlDeleted}
                  onRefresh={fetchUrls}
                />
              )}
            </div>

            <div className="sidebar">
              <Stats urls={urls} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2025 QuickLink. Fast & Reliable URL Shortening.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
