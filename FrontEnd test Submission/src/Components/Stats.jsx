const Stats = ({ urls }) => {
  const totalUrls = urls.length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks, 0);
  const averageClicks = totalUrls > 0 ? (totalClicks / totalUrls).toFixed(1) : 0;
  
  // Find most clicked URL
  const mostClicked = urls.length > 0 
    ? urls.reduce((max, url) => url.clicks > max.clicks ? url : max, urls[0])
    : null;

  // Recent activity (URLs created in last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentUrls = urls.filter(url => new Date(url.createdAt) > oneDayAgo);

  return (
    <div className="stats">
      <div className="card">
        <h2>📊 Analytics</h2>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{totalUrls}</div>
            <div className="stat-label">Total URLs</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{totalClicks}</div>
            <div className="stat-label">Total Clicks</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{averageClicks}</div>
            <div className="stat-label">Avg Clicks</div>
          </div>
          
          <div className="stat-item">
            <div className="stat-value">{recentUrls.length}</div>
            <div className="stat-label">Last 24h</div>
          </div>
        </div>

        {mostClicked && (
          <div className="top-performer">
            <h3>🏆 Top Performer</h3>
            <div className="top-url">
              <div className="top-url-code">
                /{mostClicked.shortCode}
              </div>
              <div className="top-url-clicks">
                {mostClicked.clicks} clicks
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div className="action-buttons">
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary btn-small"
            >
              🔄 Refresh Data
            </button>
            <button 
              onClick={() => {
                const data = JSON.stringify(urls, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'urls-export.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="btn btn-secondary btn-small"
              disabled={urls.length === 0}
            >
              📥 Export Data
            </button>
          </div>
        </div>

        {urls.length > 0 && (
          <div className="recent-activity">
            <h3>🕒 Recent Activity</h3>
            <div className="activity-list">
              {urls.slice(0, 3).map(url => (
                <div key={url.shortCode} className="activity-item">
                  <div className="activity-code">/{url.shortCode}</div>
                  <div className="activity-clicks">{url.clicks} clicks</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
