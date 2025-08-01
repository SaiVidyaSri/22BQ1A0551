import { useState } from 'react';

const URLShortener = ({ onUrlCreated }) => {
  const [formData, setFormData] = useState({
    url: '',
    customCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (result) setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: formData.url.trim(),
          customCode: formData.customCode.trim() || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
        setFormData({ url: '', customCode: '' });
        onUrlCreated(data.data);
      } else {
        setError(data.error || 'Failed to shorten URL');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard!');
    });
  };

  return (
    <div className="url-shortener">
      <div className="card">
        <h2>Shorten Your URL</h2>
        
        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="form-group">
            <label htmlFor="url">Enter URL to shorten</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com/very/long/url"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="customCode">Custom short code (optional)</label>
            <div className="custom-code-input">
              <span className="base-url">localhost:3001/</span>
              <input
                type="text"
                id="customCode"
                name="customCode"
                value={formData.customCode}
                onChange={handleInputChange}
                placeholder="my-link"
                disabled={loading}
                pattern="[a-zA-Z0-9_-]+"
                title="Only letters, numbers, underscores, and hyphens allowed"
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Shortening...
              </>
            ) : (
              <>
                <span className="icon">✂️</span>
                Shorten URL
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="result-section">
            <h3>✅ URL Shortened Successfully!</h3>
            <div className="result-card">
              <div className="result-item">
                <label>Short URL:</label>
                <div className="url-display">
                  <a 
                    href={result.shortUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="short-url"
                  >
                    {result.shortUrl}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(result.shortUrl)}
                    className="btn btn-secondary btn-small"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                </div>
              </div>
              
              <div className="result-item">
                <label>Original URL:</label>
                <div className="original-url">
                  {result.data.originalUrl}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default URLShortener;
