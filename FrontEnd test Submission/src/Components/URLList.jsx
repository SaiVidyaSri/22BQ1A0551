import { useState } from 'react';

const URLList = ({ urls, onUrlDeleted, onRefresh }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (shortCode) => {
    if (!confirm('Are you sure you want to delete this URL?')) return;

    setDeletingId(shortCode);

    try {
      const response = await fetch(`http://localhost:3001/api/urls/${shortCode}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        onUrlDeleted(shortCode);
      } else {
        alert('Failed to delete URL');
      }
    } catch (error) {
      alert('Failed to delete URL');
    } finally {
      setDeletingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could add a toast notification here
      console.log('Copied to clipboard!');
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (urls.length === 0) {
    return (
      <div className="url-list">
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">📝</span>
            <h3>No URLs yet</h3>
            <p>Create your first short URL above to get started!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="url-list">
      <div className="card">
        <div className="card-header">
          <h2>Your Short URLs</h2>
          <button onClick={onRefresh} className="btn btn-secondary btn-small">
            🔄 Refresh
          </button>
        </div>

        <div className="urls-container">
          {urls.map((url) => (
            <div key={url.shortCode} className="url-item">
              <div className="url-info">
                <div className="url-main">
                  <a 
                    href={`http://localhost:3001/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="short-url"
                  >
                    localhost:3001/{url.shortCode}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(`http://localhost:3001/${url.shortCode}`)}
                    className="btn btn-secondary btn-small"
                    title="Copy short URL"
                  >
                    📋
                  </button>
                </div>
                
                <div className="url-original">
                  <span className="label">Original:</span>
                  <a 
                    href={url.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="original-link"
                  >
                    {url.originalUrl}
                  </a>
                </div>

                <div className="url-meta">
                  <span className="meta-item">
                    <span className="icon">👆</span>
                    {url.clicks} clicks
                  </span>
                  <span className="meta-item">
                    <span className="icon">📅</span>
                    {formatDate(url.createdAt)}
                  </span>
                </div>
              </div>

              <div className="url-actions">
                <button 
                  onClick={() => copyToClipboard(url.originalUrl)}
                  className="btn btn-secondary btn-small"
                  title="Copy original URL"
                >
                  📄
                </button>
                
                <button
                  onClick={() => handleDelete(url.shortCode)}
                  className="btn btn-danger btn-small"
                  disabled={deletingId === url.shortCode}
                  title="Delete URL"
                >
                  {deletingId === url.shortCode ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default URLList;
