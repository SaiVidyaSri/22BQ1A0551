import express from 'express';
import cors from 'cors';
import { nanoid } from 'nanoid';

const app = express();
const PORT = 3001;

// In-memory storage for URLs
const urlDatabase = new Map();
const analytics = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Generate short URL
app.post('/api/shorten', (req, res) => {
  try {
    const { url, customCode } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Generate or use custom short code
    let shortCode = customCode;
    if (!shortCode) {
      shortCode = nanoid(8);
    } else if (urlDatabase.has(shortCode)) {
      return res.status(400).json({ error: 'Custom code already exists' });
    }

    // Store URL
    const urlData = {
      id: shortCode,
      originalUrl: url,
      shortCode,
      createdAt: new Date(),
      clicks: 0
    };

    urlDatabase.set(shortCode, urlData);
    analytics.set(shortCode, []);

    res.json({
      success: true,
      data: urlData,
      shortUrl: `http://localhost:${PORT}/${shortCode}`
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/urls', (req, res) => {
  try {
    const urls = Array.from(urlDatabase.values());
    res.json({ success: true, data: urls });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get URL analytics
app.get('/api/analytics/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = urlDatabase.get(shortCode);
    const clickData = analytics.get(shortCode) || [];

    if (!urlData) {
      return res.status(404).json({ error: 'URL not found' });
    }

    res.json({
      success: true,
      data: {
        ...urlData,
        clickHistory: clickData
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete URL
app.delete('/api/urls/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    
    if (!urlDatabase.has(shortCode)) {
      return res.status(404).json({ error: 'URL not found' });
    }

    urlDatabase.delete(shortCode);
    analytics.delete(shortCode);

    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect to original URL
app.get('/:shortCode', (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = urlDatabase.get(shortCode);

    if (!urlData) {
      return res.status(404).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>404 - Short URL Not Found</h1>
            <p>The short URL you're looking for doesn't exist.</p>
            <a href="http://localhost:5173" style="color: #3b82f6;">Go back to URL Shortener</a>
          </body>
        </html>
      `);
    }

    // Track click
    urlData.clicks++;
    const clickRecord = {
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    const clickHistory = analytics.get(shortCode) || [];
    clickHistory.push(clickRecord);
    analytics.set(shortCode, clickHistory);

    // Redirect to original URL
    res.redirect(urlData.originalUrl);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'URL Shortener API is running',
    stats: {
      totalUrls: urlDatabase.size,
      totalClicks: Array.from(urlDatabase.values()).reduce((sum, url) => sum + url.clicks, 0)
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 URL Shortener server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
