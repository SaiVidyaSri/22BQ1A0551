# URL Shortener Backend API

A lightweight Express.js backend server for the URL shortener application.

## 🚀 Features

- **RESTful API** - Clean REST endpoints for URL operations
- **CORS Enabled** - Cross-origin requests supported
- **In-Memory Storage** - Fast Map-based data storage
- **Analytics Tracking** - Click counting and user analytics
- **URL Validation** - Input validation and error handling
- **Redirect Service** - Direct short URL to original URL redirection

## 📡 API Endpoints

### URL Management
- `POST /api/shorten` - Create a short URL
- `GET /api/urls` - Get all shortened URLs
- `DELETE /api/urls/:shortCode` - Delete a specific URL
- `GET /api/analytics/:shortCode` - Get URL analytics

### Redirect Service
- `GET /:shortCode` - Redirect to original URL

### System
- `GET /api/health` - Health check endpoint

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Development mode:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## 📋 API Usage Examples

### Create Short URL
```bash
POST /api/shorten
Content-Type: application/json

{
  "url": "https://www.example.com",
  "customCode": "example" // optional
}
```

### Get All URLs
```bash
GET /api/urls
```

### Delete URL
```bash
DELETE /api/urls/abc123
```

### Get Analytics
```bash
GET /api/analytics/abc123
```

## 🔧 Dependencies

- **express** - Web framework for Node.js
- **cors** - Cross-Origin Resource Sharing middleware
- **nanoid** - Unique ID generator for short codes

## 🌟 Key Features

### URL Shortening
- Automatic short code generation (8 characters)
- Custom short code support
- URL format validation
- Duplicate prevention

### Analytics & Tracking
- Click counting
- Timestamp tracking
- User agent logging
- IP address tracking

### Error Handling
- Comprehensive error responses
- Input validation
- 404 handling for missing URLs

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description"
}
```

