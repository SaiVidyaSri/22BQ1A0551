# URL Shortener Logging Middleware

A comprehensive logging middleware package designed specifically for URL shortener applications. This middleware provides advanced request logging, error tracking, analytics, and performance monitoring capabilities.

## Features

- **Request Logging**: Detailed logging of all HTTP requests with metadata
- **Error Tracking**: Comprehensive error logging with stack traces
- **Analytics Logging**: Specialized logging for URL shortener events
- **Performance Monitoring**: Detection and logging of slow requests
- **File & Console Output**: Configurable output to console and/or log files
- **Customizable Log Levels**: Support for debug, info, warn, and error levels
- **IP Tracking**: Request source tracking for analytics
- **User Agent Logging**: Browser and client information capture

## Installation

```bash
npm install
```

## Quick Start

```javascript
import express from 'express';
import { requestLogger, errorLogger, analyticsLogger } from './middleware/logging.js';

const app = express();

// Basic request logging
app.use(requestLogger({
  logLevel: 'info',
  logToFile: true,
  logDir: './logs'
}));

// Error logging
app.use(errorLogger({
  logLevel: 'error',
  logToFile: true
}));

// Analytics logging instance
const analytics = analyticsLogger();

// Use in your routes
app.post('/api/shorten', (req, res) => {
  // Your URL shortening logic here
  const urlData = { /* your url data */ };
  
  // Log URL creation
  analytics.logUrlCreated(urlData, req);
  
  res.json(urlData);
});
```

## Configuration Options

### RequestLogger Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `logLevel` | string | 'info' | Logging level (debug, info, warn, error) |
| `logToFile` | boolean | false | Enable file logging |
| `logDir` | string | './logs' | Directory for log files |
| `includeBody` | boolean | false | Include request body in logs |
| `excludePaths` | array | [] | Paths to exclude from logging |

### Example Configuration

```javascript
app.use(requestLogger({
  logLevel: 'debug',
  logToFile: true,
  logDir: './logs',
  includeBody: true,
  excludePaths: ['/health', '/favicon.ico']
}));
```

## Middleware Components

### 1. Request Logger

Logs all incoming HTTP requests with detailed metadata:

```javascript
import { requestLogger } from './middleware/logging.js';

app.use(requestLogger({
  logLevel: 'info',
  logToFile: true,
  includeBody: false
}));
```

**Logged Information:**
- HTTP method and URL
- Client IP address
- User Agent
- Request duration
- Response status code
- Referer information

### 2. Error Logger

Captures and logs all application errors:

```javascript
import { errorLogger } from './middleware/logging.js';

app.use(errorLogger({
  logLevel: 'error',
  logToFile: true
}));
```

**Logged Information:**
- Error message and stack trace
- Request details that caused the error
- Client information
- Request body (if enabled)

### 3. Analytics Logger

Specialized logging for URL shortener specific events:

```javascript
import { analyticsLogger } from './middleware/logging.js';

const analytics = analyticsLogger();

// Log URL creation
analytics.logUrlCreated(urlData, req);

// Log URL access
analytics.logUrlAccessed(urlData, req);

// Log URL deletion
analytics.logUrlDeleted(shortCode, req);
```

### 4. Performance Logger

Monitors and logs slow requests:

```javascript
import { performanceLogger } from './middleware/logging.js';

app.use(performanceLogger({
  slowRequestThreshold: 1000, // ms
  logAllRequests: false
}));
```

## Direct Logger Usage

You can also use the Logger class directly:

```javascript
import { Logger } from './middleware/logging.js';

const logger = new Logger({
  logLevel: 'debug',
  logToFile: true,
  logDir: './custom-logs'
});

logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred', { errorCode: 500 });
```

## Log Output Examples

### Console Output
```
[2025-08-01T12:36:30.123Z] INFO: Incoming POST request to /api/shorten
{
  "method": "POST",
  "url": "/api/shorten",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0..."
}

[2025-08-01T12:36:30.145Z] INFO: URL shortened
{
  "event": "url_created",
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "customCode": false,
  "ip": "127.0.0.1"
}
```

### File Output
Log files are created daily in JSON format:
```json
{"timestamp":"2025-08-01T12:36:30.123Z","level":"INFO","message":"Incoming POST request to /api/shorten","method":"POST","url":"/api/shorten","ip":"127.0.0.1"}
{"timestamp":"2025-08-01T12:36:30.145Z","level":"INFO","message":"URL shortened","event":"url_created","shortCode":"abc123","originalUrl":"https://example.com"}
```

## Integration with URL Shortener

This middleware is designed to integrate seamlessly with your URL shortener application:

1. **Request Tracking**: Monitor all API calls
2. **URL Analytics**: Track URL creation, access, and deletion
3. **Error Monitoring**: Catch and log application errors
4. **Performance Insights**: Identify slow endpoints


