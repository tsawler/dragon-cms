# Dragon Editor - URL Integration Guide

## Overview

The Dragon Editor now supports publishing pages to remote URLs and loading pages from remote URLs. This allows you to integrate the editor with your backend API for saving and retrieving page content.

## Features

- **Publish to URL**: POST page content and settings to a specified endpoint
- **Load from URL**: GET page content and settings from a specified endpoint
- **Automatic button visibility**: Buttons only appear when URLs are configured
- **Loading states**: Visual feedback during network operations
- **Error handling**: User-friendly error messages for failed requests
- **Complete data transfer**: Includes HTML, raw content, and page settings

## Configuration

### Basic Setup

To enable URL integration, provide the URLs when initializing the editor:

```javascript
const editor = dragon.New('my-editor-container', {
    title: 'My Website Builder',
    publishUrl: 'https://api.example.com/pages/save',
    loadUrl: 'https://api.example.com/pages/load'
});
```

### Configuration Options

| Option | Type | Description | Required |
|--------|------|-------------|----------|
| `publishUrl` | string | URL endpoint for publishing pages | No |
| `loadUrl` | string | URL endpoint for loading pages | No |

- If `publishUrl` is provided, a "Publish" button will appear in the editor header
- If `loadUrl` is provided, a "Load from URL" button will appear in the editor header
- You can provide one or both URLs as needed

## Publish to URL

### How It Works

When the user clicks the "Publish" button:

1. The editor serializes the current page content and settings
2. A POST request is sent to the configured `publishUrl`
3. The button shows "Publishing..." during the request
4. Success/error feedback is displayed to the user

### Request Format

**Method**: `POST`
**Content-Type**: `application/json`

**Request Body**:
```json
{
    "html": "<!DOCTYPE html><html>...</html>",
    "content": "<div class=\"editor-block\">...</div>",
    "pageSettings": {
        "pageTitle": "My Awesome Page",
        "pageName": "homepage",
        "customCSS": "body { background: #f0f0f0; }",
        "customJavaScript": "console.log('Page loaded');"
    },
    "timestamp": 1692123456789
}
```

### Data Structure

| Field | Type | Description |
|-------|------|-------------|
| `html` | string | Clean HTML output (without editor controls) |
| `content` | string | Raw editor content (with drag handles, etc.) |
| `pageSettings` | object | Page configuration from Page Settings modal |
| `pageSettings.pageTitle` | string | Page title |
| `pageSettings.pageName` | string | Page name/identifier |
| `pageSettings.customCSS` | string | Custom CSS code |
| `pageSettings.customJavaScript` | string | Custom JavaScript code |
| `timestamp` | number | Unix timestamp when published |

### Server Implementation Example

**Node.js/Express**:
```javascript
app.post('/api/pages/save', express.json(), (req, res) => {
    const { html, content, pageSettings, timestamp } = req.body;
    
    try {
        // Save to database
        const pageId = savePageToDatabase({
            html,
            content,
            settings: pageSettings,
            publishedAt: new Date(timestamp)
        });
        
        res.json({ 
            success: true, 
            pageId,
            message: 'Page published successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
```

**PHP Example**:
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    $html = $data['html'];
    $content = $data['content'];
    $pageSettings = $data['pageSettings'];
    $timestamp = $data['timestamp'];
    
    // Save to database
    $pageId = savePageToDatabase($html, $content, $pageSettings, $timestamp);
    
    if ($pageId) {
        echo json_encode(['success' => true, 'pageId' => $pageId]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Failed to save page']);
    }
}
?>
```

## Load from URL

### How It Works

When the user clicks the "Load from URL" button:

1. A GET request is sent to the configured `loadUrl`
2. The button shows "Loading..." during the request
3. The response data is used to populate the editor
4. Page settings are restored and applied
5. The current state is saved to undo/redo history

### Request Format

**Method**: `GET`
**Accept**: `application/json`

### Response Format

The server should return JSON data in the same format as the publish request:

```json
{
    "html": "<!DOCTYPE html><html>...</html>",
    "content": "<div class=\"editor-block\">...</div>",
    "pageSettings": {
        "pageTitle": "My Awesome Page",
        "pageName": "homepage",
        "customCSS": "body { background: #f0f0f0; }",
        "customJavaScript": "console.log('Page loaded');"
    },
    "timestamp": 1692123456789
}
```

### Server Implementation Example

**Node.js/Express**:
```javascript
app.get('/api/pages/load', (req, res) => {
    try {
        // Get page ID from query params or use latest
        const pageId = req.query.id || 'latest';
        
        // Load from database
        const pageData = loadPageFromDatabase(pageId);
        
        if (pageData) {
            res.json({
                html: pageData.html,
                content: pageData.content,
                pageSettings: pageData.settings,
                timestamp: pageData.publishedAt.getTime()
            });
        } else {
            res.status(404).json({ 
                error: 'Page not found' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            error: error.message 
        });
    }
});
```

**PHP Example**:
```php
<?php
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $pageId = $_GET['id'] ?? 'latest';
    
    // Load from database
    $pageData = loadPageFromDatabase($pageId);
    
    if ($pageData) {
        echo json_encode([
            'html' => $pageData['html'],
            'content' => $pageData['content'],
            'pageSettings' => json_decode($pageData['settings'], true),
            'timestamp' => strtotime($pageData['published_at']) * 1000
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Page not found']);
    }
}
?>
```

## Complete Integration Example

### Frontend Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website Builder</title>
</head>
<body>
    <div id="website-builder"></div>
    
    <script type="module">
        import { dragon } from './js/dragon.js';
        
        // Initialize editor with URL integration
        const editor = dragon.New('website-builder', {
            title: 'My Website Builder',
            publishUrl: 'https://api.mysite.com/pages/publish',
            loadUrl: 'https://api.mysite.com/pages/load?id=homepage'
        });
        
        // Optional: Access editor instance for custom functionality
        window.myEditor = editor;
    </script>
</body>
</html>
```

### Backend API Routes

**Express.js Route Handler**:
```javascript
const express = require('express');
const router = express.Router();

// Publish page
router.post('/pages/publish', async (req, res) => {
    try {
        const { html, content, pageSettings } = req.body;
        
        // Validate required fields
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        
        // Save to database
        const page = await Page.create({
            html,
            content,
            title: pageSettings.pageTitle || 'Untitled',
            custom_css: pageSettings.customCSS || '',
            custom_js: pageSettings.customJavaScript || '',
            published_at: new Date()
        });
        
        // Optionally deploy to CDN/static hosting
        await deployToStaticHost(page.html, page.id);
        
        res.json({ 
            success: true, 
            pageId: page.id,
            deployUrl: `https://cdn.mysite.com/pages/${page.id}.html`
        });
        
    } catch (error) {
        console.error('Publish error:', error);
        res.status(500).json({ error: 'Failed to publish page' });
    }
});

// Load page
router.get('/pages/load', async (req, res) => {
    try {
        const pageId = req.query.id;
        
        // Load latest page if no ID specified
        const page = pageId ? 
            await Page.findById(pageId) : 
            await Page.findOne({ order: [['published_at', 'DESC']] });
        
        if (!page) {
            return res.status(404).json({ error: 'Page not found' });
        }
        
        res.json({
            html: page.html,
            content: page.content,
            pageSettings: {
                pageTitle: page.title,
                customCSS: page.custom_css,
                customJavaScript: page.custom_js
            },
            timestamp: page.published_at.getTime()
        });
        
    } catch (error) {
        console.error('Load error:', error);
        res.status(500).json({ error: 'Failed to load page' });
    }
});

module.exports = router;
```

## Error Handling

### Client-Side Errors

The editor handles various error scenarios:

- **Network errors**: Connection issues, timeouts
- **HTTP errors**: 404, 500, etc.
- **Invalid responses**: Non-JSON responses, missing data
- **Configuration errors**: Missing URLs

All errors are displayed to the user via alert dialogs and logged to the console.

### Server-Side Error Responses

Your server should return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad request (invalid data)
- **401**: Unauthorized
- **404**: Page not found
- **500**: Server error

Example error response:
```json
{
    "error": "Page not found",
    "code": "PAGE_NOT_FOUND"
}
```

## Security Considerations

### Authentication

The current implementation doesn't include authentication. For production use, consider:

```javascript
// Add authentication headers
const editor = dragon.New('editor', {
    publishUrl: 'https://api.example.com/pages/save',
    loadUrl: 'https://api.example.com/pages/load',
    // Custom headers for authentication
    headers: {
        'Authorization': 'Bearer ' + userToken,
        'X-User-ID': userId
    }
});
```

### CORS Configuration

Ensure your server allows cross-origin requests:

```javascript
// Express CORS configuration
app.use(cors({
    origin: ['https://mysite.com', 'https://admin.mysite.com'],
    credentials: true
}));
```

### Input Validation

Always validate and sanitize incoming data:

```javascript
// Validate HTML content
const validator = require('validator');

if (!validator.isLength(content, { min: 1, max: 1000000 })) {
    return res.status(400).json({ error: 'Content length invalid' });
}

// Sanitize HTML if needed
const sanitizedHtml = sanitizeHtml(html, {
    allowedTags: ['div', 'p', 'h1', 'h2', /* ... */],
    allowedAttributes: {
        'div': ['class', 'style'],
        // ...
    }
});
```

## Troubleshooting

### Common Issues

1. **Buttons don't appear**: Ensure URLs are provided in constructor
2. **CORS errors**: Configure server to allow cross-origin requests
3. **Network errors**: Check server is running and accessible
4. **Invalid JSON**: Ensure server returns valid JSON responses

### Debugging

Enable console logging to see request/response data:

```javascript
// The editor automatically logs to console
// Check browser dev tools Network tab for request details
```

### Testing

Test your integration with curl:

```bash
# Test publish endpoint
curl -X POST https://api.example.com/pages/save \
  -H "Content-Type: application/json" \
  -d '{"html":"<html></html>","content":"<div></div>","pageSettings":{},"timestamp":1692123456789}'

# Test load endpoint  
curl https://api.example.com/pages/load
```

## Advanced Usage

### Custom Error Handling

Override default error handling:

```javascript
const editor = dragon.New('editor', {
    publishUrl: 'https://api.example.com/save',
    onPublishSuccess: (response) => {
        console.log('Published successfully:', response);
        showCustomNotification('Page published!');
    },
    onPublishError: (error) => {
        console.error('Publish failed:', error);
        showCustomErrorDialog(error.message);
    }
});
```

### Multiple Save Destinations

Save to multiple endpoints:

```javascript
const editor = dragon.New('editor', {
    publishUrl: 'https://primary-api.com/save',
    // Custom publish handler
    onPublish: async (pageData) => {
        // Save to primary
        await fetch('https://primary-api.com/save', {
            method: 'POST',
            body: JSON.stringify(pageData)
        });
        
        // Save backup
        await fetch('https://backup-api.com/save', {
            method: 'POST', 
            body: JSON.stringify(pageData)
        });
    }
});
```

This completes the URL integration guide for the Dragon Editor. The system provides a robust foundation for integrating with any backend API while maintaining a simple and intuitive user experience.