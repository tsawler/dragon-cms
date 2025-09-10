# DragonCMS - Drag & Drop Website Builder

A powerful, pure JavaScript drag-and-drop website builder with zero dependencies. Create responsive websites visually by dragging blocks and snippets onto a canvas, with real-time editing, custom styling, and HTML code access.

![DragonCMS](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Pure JavaScript](https://img.shields.io/badge/pure-javascript-yellow.svg)
![No Dependencies](https://img.shields.io/badge/dependencies-none-green.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Advanced Examples](#advanced-examples)
- [API Reference](#api-reference)
- [Customization](#customization)
- [Components](#components)
- [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Capabilities
- **Pure JavaScript** - No frameworks, no dependencies, just vanilla JavaScript
- **Drag & Drop Interface** - Intuitive visual building with blocks and snippets
- **Responsive Design** - Built-in viewport preview modes (Desktop, Tablet, Mobile)
- **Real-time Editing** - In-place text editing with rich formatting toolbar
- **Custom Styling** - Visual style editor for every element
- **HTML Access** - Direct HTML code editing for advanced users
- **Undo/Redo** - Complete state history management
- **Import/Export** - Save and load designs as JSON or HTML

### Advanced Features
- **Block System** - Container-based layout with column management
- **Rich Text Editing** - Full formatting toolbar with fonts, colors, alignment
- **Image Management** - Upload, resize, and position images with visual handles
- **Video Embedding** - YouTube and video file support
- **Button Customization** - Style, URL, and target configuration
- **Page Settings** - Custom CSS and JavaScript injection
- **Full-width Blocks** - Edge-to-edge viewport spanning containers
- **Background Images** - Upload and position background images for blocks
- **Column Resizing** - Visual column width adjustment

### Developer Features
- **Programmatic API** - Full control via JavaScript
- **Custom Snippets** - Create your own components
- **Event System** - Listen to editor mode changes
- **Flexible Configuration** - Customize paths, assets, and behavior
- **Save/Load Integration** - Connect to your backend API

## Quick Start

### Minimal Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DragonCMS Example</title>
</head>
<body>
    <div id="editor"></div>

    <script src="snippets.js"></script>
    <script type="module">
        import dragon from './js/dragon.js';
        
        const editor = dragon.New({
            containerId: 'editor',
            cssPath: 'editor.css',
            showCodeIcon: true
        });
    </script>
</body>
</html>
```

## Installation

### Option 1: Use Built Files (Recommended for Production)

1. Download or clone the repository:
```bash
git clone https://github.com/tsawler/dragon-cms.git
cd dragon-cms
```

2. Install dependencies and build:
```bash
npm install
npm run build
```

3. Use the built files from the `dist/` folder in your project:
```html
<!-- For production (minified) -->
<link rel="stylesheet" href="path/to/dist/editor.min.css">
<script src="path/to/dist/snippets.min.js"></script>
<script src="path/to/dist/dragon.min.js"></script>

<!-- For development (unminified) -->
<link rel="stylesheet" href="path/to/dist/editor.css">
<script src="path/to/dist/snippets.js"></script>
<script src="path/to/dist/dragon.js"></script>
```

### Option 2: Use Source Files (Development)

1. Clone the repository:
```bash
git clone https://github.com/tsawler/dragon-cms.git
cd dragon-cms
```

2. Use the source files directly:
```html
<link rel="stylesheet" href="path/to/editor.css">
<script src="path/to/snippets.js"></script>
<script type="module" src="path/to/js/dragon.js"></script>
```

### File Structure

```
dragoncms/
├── index.html              # Example implementation
├── editor.css              # Editor styles
├── snippets.js             # Block and snippet definitions
├── assets/                 # Images and resources
│   └── images/
└── js/                     # Core JavaScript modules
    ├── dragon.js           # Main entry point
    ├── editor-core.js      # Core editor class
    ├── modals.js           # Modal components
    ├── formatting-toolbar.js
    ├── snippet-panel.js
    ├── state-history.js
    ├── image-uploader.js
    ├── column-resizer.js
    └── [other modules]
```

## Development

### Build System

DragonCMS uses Rollup and Babel for building and bundling. The build system creates both development and production versions.

#### Available Scripts

```bash
# Install dependencies
npm install

# Build for production (creates dist/ folder)
npm run build

# Build and watch for changes
npm run build:watch

# Serve built files on localhost:8000
npm run serve

# Serve development files on localhost:8000  
npm run serve:dev

# Build and serve (complete development workflow)
npm run dev
```

#### Build Output

The build process creates:

- `dist/dragon.js` - Development bundle (unminified)
- `dist/dragon.min.js` - Production bundle (minified, console logs removed)
- `dist/editor.css` - Editor styles (unminified)
- `dist/editor.min.css` - Editor styles (minified)
- `dist/snippets.js` - Components (unminified)
- `dist/snippets.min.js` - Components (minified)
- `dist/index.html` - Example page (copied from source)
- `dist/assets/` - Static assets (copied from source)

#### Using Built Files

For production, use the minified bundles:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Website Builder</title>
    <link rel="stylesheet" href="dist/editor.min.css">
</head>
<body>
    <div id="editor"></div>
    
    <script src="dist/snippets.min.js"></script>
    <script src="dist/dragon.min.js"></script>
    <script>
        // Note: Built version creates global 'dragon' object
        const editor = dragon.New({
            containerId: 'editor'
        });
    </script>
</body>
</html>
```

#### Build Configuration

The build is configured through:

- `rollup.config.js` - Rollup bundling configuration for JavaScript
- `postcss.config.js` - PostCSS configuration for CSS minification
- `.babelrc` - Babel transpilation settings (ES6+ to ES5)
- `package.json` - Build scripts and dependencies

Target browsers: `> 1%`, `last 2 versions`, `not dead`, `IE 11`

**Minification:**
- JavaScript: Terser (removes console logs in production)
- CSS: cssnano (optimizes and minifies styles)

## Basic Usage

### Simple Implementation

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website Builder</title>
    <style>
        body { margin: 0; padding: 0; }
        #my-editor { width: 100vw; height: 100vh; }
    </style>
</head>
<body>
    <div id="my-editor"></div>
    
    <script src="snippets.js"></script>
    <script type="module" src="js/dragon.js"></script>
    
    <script>
        window.addEventListener('load', function() {
            const editor = dragon.New({
                containerId: 'my-editor',
                cssPath: 'editor.css',
                showCodeIcon: true,
                snippetsPath: 'snippets.js',
                assetsPath: 'assets/'
            });
        });
    </script>
</body>
</html>
```

### With Existing Content

```javascript
const editor = dragon.New({
    containerId: 'my-editor',
    cssPath: 'editor.css',
    initialContent: `
        <div class="editor-block">
            <h1>Welcome to My Site</h1>
            <p>This content was loaded from HTML</p>
        </div>
    `
});
```

### Display Mode with Edit Button

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Website with Edit Mode</title>
    <style>
        #edit-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        #edit-btn.editing { display: none; }
    </style>
</head>
<body>
    <div id="content"></div>
    <button id="edit-btn" title="Edit Page">✏️</button>
    
    <script src="snippets.js"></script>
    <script type="module" src="js/dragon.js"></script>
    
    <script>
        window.addEventListener('load', function() {
            const editor = dragon.New({
                containerId: 'content',
                cssPath: 'editor.css'
            });
            
            // Start in display mode
            editor.setMode('display');
            
            // Edit button functionality
            document.getElementById('edit-btn').addEventListener('click', function() {
                editor.setMode('edit');
                this.classList.add('editing');
            });
            
            // Listen for mode changes
            window.addEventListener('dragonModeChanged', function(e) {
                document.getElementById('edit-btn').classList.toggle('editing', 
                    e.detail.mode === 'edit');
            });
        });
    </script>
</body>
</html>
```

## Advanced Examples

### Save to Backend API

```javascript
const editor = dragon.New({
    containerId: 'editor',
    cssPath: 'editor.css',
    publishUrl: 'https://api.example.com/pages/save',
    loadUrl: 'https://api.example.com/pages/load'
});

// Save button is automatically connected to publishUrl
// Load button is automatically connected to loadUrl

// Manual save
document.getElementById('custom-save').addEventListener('click', async () => {
    const content = editor.exportHTML();
    
    const response = await fetch('/api/save', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            html: content,
            timestamp: new Date().toISOString()
        })
    });
    
    if (response.ok) {
        alert('Saved successfully!');
    }
});
```

### Custom Snippet Creation

Add custom components to `snippets.js`:

```javascript
// In snippets.js
window.getSnippets = function() {
    return [
        // Custom hero section
        {
            id: 'custom-hero',
            name: 'Hero Section',
            type: 'block',
            preview: 'text',
            html: `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                            padding: 80px 40px; text-align: center; color: white;">
                    <h1 style="font-size: 48px; margin: 0;">Amazing Hero Title</h1>
                    <p style="font-size: 20px; margin: 20px 0;">Your compelling subtitle here</p>
                    <button style="background: white; color: #667eea; border: none; 
                                   padding: 15px 40px; font-size: 18px; 
                                   border-radius: 30px; cursor: pointer;">
                        Get Started
                    </button>
                </div>
            `
        },
        
        // Custom testimonial card
        {
            id: 'testimonial',
            name: 'Testimonial',
            type: 'snippet',
            preview: 'text',
            html: `
                <div style="background: white; padding: 30px; border-radius: 10px; 
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 20px 0;">
                    <div style="display: flex; align-items: center; margin-bottom: 20px;">
                        <img src="https://via.placeholder.com/60" 
                             style="border-radius: 50%; margin-right: 15px;">
                        <div>
                            <h4 style="margin: 0;">Customer Name</h4>
                            <p style="margin: 0; color: #666;">CEO, Company</p>
                        </div>
                    </div>
                    <p style="font-style: italic; color: #333; line-height: 1.6;">
                        "This is an amazing product that has transformed our business..."
                    </p>
                </div>
            `
        },
        
        // Existing snippets...
        ...window.getDefaultSnippets()
    ];
};
```

### Using Callbacks for Custom Behavior

```javascript
const editor = dragon.New({
    containerId: 'editor',
    cssPath: 'editor.css',
    onChange: (event) => {
        // Auto-save on changes
        if (event.type.includes('added') || event.type.includes('deleted')) {
            autoSave(event.html);
        }
        
        // Track analytics
        analytics.track('editor_change', {
            action: event.type,
            timestamp: event.timestamp
        });
    },
    onRender: (event) => {
        // Apply custom enhancements to rendered elements
        if (event.type === 'block') {
            // Add animation classes
            event.element.classList.add('fade-in');
        }
        
        // Initialize third-party libraries
        if (event.element.querySelector('.chart-container')) {
            initializeCharts(event.element);
        }
    }
});
```

### Programmatic Content Manipulation

```javascript
const editor = dragon.New({
    containerId: 'editor',
    cssPath: 'editor.css'
});

// Switch modes programmatically
editor.setMode('edit');  // or 'display'

// Get current mode
const currentMode = editor.getMode();

// Export HTML
const htmlContent = editor.exportHTML();

// Load content dynamically
async function loadTemplate(templateId) {
    const response = await fetch(`/templates/${templateId}.html`);
    const html = await response.text();
    
    // Clear current content and load new
    document.getElementById('editable-area').innerHTML = html;
    
    // Re-initialize editable elements
    editor.makeExistingBlocksEditable();
}

// Listen for mode changes
window.addEventListener('dragonModeChanged', (e) => {
    console.log('Mode changed to:', e.detail.mode);
    
    if (e.detail.mode === 'display') {
        // Auto-save when switching to display mode
        autoSave();
    }
});
```

## API Reference

### dragon.New(options)

Creates a new DragonCMS editor instance.

#### Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `containerId` | string | `'dragon-editor'` | ID of the container element |
| `cssPath` | string | `'editor.css'` | Path to the editor CSS file |
| `showCodeIcon` | boolean | `true` | Show HTML editor icon |
| `snippetsPath` | string | `'snippets.js'` | Path to snippets definition file |
| `assetsPath` | string | `'assets/'` | Path to assets folder |
| `initialContent` | string | `null` | Initial HTML content to load |
| `publishUrl` | string | `null` | API endpoint for saving |
| `loadUrl` | string | `null` | API endpoint for loading |
| `onChange` | function | `null` | Callback when content changes (add/delete/move) |
| `onRender` | function | `null` | Callback when element is rendered |

#### Returns
An `Editor` instance with the following methods:

### Editor Methods

#### editor.setMode(mode)
Sets the editor mode.

```javascript
editor.setMode('edit');   // Enable editing mode
editor.setMode('display'); // Enable display mode
```

#### editor.getMode()
Returns the current mode ('edit' or 'display').

```javascript
const mode = editor.getMode();
console.log(mode); // 'edit' or 'display'
```

#### editor.exportHTML()
Exports the current content as HTML.

```javascript
const html = editor.exportHTML();
// Returns complete HTML with styles
```

#### editor.exportData()
Exports the current state as JSON.

```javascript
const data = editor.exportData();
// Returns: { html: '...', pageSettings: {...} }
```

#### editor.makeExistingBlocksEditable()
Re-initializes editing capabilities for dynamically loaded content.

```javascript
// After loading new HTML content
document.getElementById('editable-area').innerHTML = newContent;
editor.makeExistingBlocksEditable();
```

### Events

#### dragonModeChanged
Fired when the editor mode changes.

```javascript
window.addEventListener('dragonModeChanged', (e) => {
    console.log('New mode:', e.detail.mode);
    // e.detail.mode is 'edit' or 'display'
});
```

### Callbacks

#### onChange Callback
Triggered when content changes (blocks/snippets added, deleted, or moved).

```javascript
const editor = dragon.New({
    containerId: 'editor',
    onChange: (event) => {
        console.log('Content changed:', event);
        // event.type: 'block-added', 'block-deleted', 'block-moved',
        //             'snippet-added', 'snippet-deleted', 'snippet-moved'
        // event.element: The affected element (null for deletions)
        // event.html: Current HTML content of the editor
        // event.timestamp: ISO timestamp of the change
    }
});
```

#### onRender Callback
Triggered when a new block or snippet is rendered.

```javascript
const editor = dragon.New({
    containerId: 'editor',
    onRender: (event) => {
        console.log('Element rendered:', event);
        // event.type: 'block' or 'snippet'
        // event.element: The rendered DOM element
        // event.timestamp: ISO timestamp of the render
        
        // Example: Add custom initialization
        if (event.type === 'snippet') {
            // Initialize any custom JavaScript for the snippet
            initializeCustomSnippet(event.element);
        }
    }
});
```

## Customization

### Custom Styles

Override default styles by adding CSS after the editor.css:

```css
/* Custom theme */
.dragon-editor .editor-header {
    background: linear-gradient(90deg, #4a90e2, #7b68ee);
}

.dragon-editor .btn-primary {
    background: #7b68ee;
    border-color: #7b68ee;
}

.dragon-editor .editor-block {
    border-color: #e0e0e0;
}

/* Custom snippet styles */
.dragon-editor .custom-snippet {
    background: #f8f9fa;
    padding: 20px;
    border-left: 4px solid #7b68ee;
}
```

### Custom Snippets

Create rich, interactive snippets:

```javascript
// Advanced snippet with JavaScript
{
    id: 'countdown-timer',
    name: 'Countdown Timer',
    type: 'snippet',
    preview: 'text',
    html: `
        <div class="countdown-widget" data-target="2024-12-31T23:59:59">
            <div style="text-align: center; padding: 40px; background: #f0f0f0; border-radius: 10px;">
                <h2>Countdown to New Year</h2>
                <div class="countdown-display" style="font-size: 36px; font-weight: bold;">
                    <span class="days">00</span> days
                    <span class="hours">00</span> hours
                    <span class="minutes">00</span> minutes
                    <span class="seconds">00</span> seconds
                </div>
            </div>
        </div>
    `,
    script: `
        document.querySelectorAll('.countdown-widget').forEach(widget => {
            const target = new Date(widget.dataset.target);
            
            setInterval(() => {
                const now = new Date();
                const diff = target - now;
                
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                widget.querySelector('.days').textContent = days;
                widget.querySelector('.hours').textContent = hours;
                widget.querySelector('.minutes').textContent = minutes;
                widget.querySelector('.seconds').textContent = seconds;
            }, 1000);
        });
    `
}
```

### Custom Block Templates

```javascript
// Multi-column responsive block
{
    id: 'three-column-block',
    name: 'Three Column Layout',
    type: 'block',
    preview: 'text',
    html: `
        <div class="editor-block three-columns" style="display: flex; gap: 20px; padding: 40px;">
            <div class="column" style="flex: 1; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3>Column 1</h3>
                <p>Content for the first column</p>
            </div>
            <div class="column" style="flex: 1; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3>Column 2</h3>
                <p>Content for the second column</p>
            </div>
            <div class="column" style="flex: 1; background: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3>Column 3</h3>
                <p>Content for the third column</p>
            </div>
        </div>
    `
}
```

## Components

### Available Blocks

1. **Container Block** - Basic container with columns
2. **Hero Container** - Full-width hero sections
3. **Two Column Block** - Side-by-side layout
4. **Three Column Block** - Three equal columns
5. **Card Container** - Content card with shadow

### Available Snippets

1. **Text Elements**
   - Heading (H1-H6)
   - Paragraph
   - Blockquote
   - Lists (ordered/unordered)

2. **Media Elements**
   - Image
   - Video (YouTube/file)
   - Image Gallery

3. **Interactive Elements**
   - Button
   - Link
   - Form elements

4. **Layout Elements**
   - Divider
   - Spacer
   - Custom HTML

## Browser Support

DragonCMS supports all modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Known Browser Issues

#### Firefox
- Cursor positioning in contentEditable elements requires special handling (implemented)
- Drag handle conflicts with contentEditable (resolved with workarounds)

#### Safari
- Some drag-and-drop behaviors may differ slightly
- Touch events on iOS require additional handling

## Troubleshooting

### Common Issues

#### Blocks not dragging
**Problem:** Blocks can only be dragged by the handle (⋮⋮)
**Solution:** Click and drag the dotted handle on the left side of each block

#### Text not editable
**Problem:** After using HTML editor, text becomes uneditable
**Solution:** The editor automatically re-initializes contentEditable. If issues persist, call:
```javascript
editor.makeExistingBlocksEditable();
```

#### Styles not applying
**Problem:** Custom styles not showing
**Solution:** Ensure CSS specificity is high enough:
```css
.dragon-editor .editor-block.custom-class {
    /* Your styles */
}
```

#### Save/Load not working
**Problem:** Save/Load buttons not functioning
**Solution:** Set the `publishUrl` and `loadUrl` options:
```javascript
const editor = dragon.New({
    publishUrl: '/api/save',
    loadUrl: '/api/load'
});
```

### Performance Optimization

For large documents:

```javascript
// Disable state history for better performance
const editor = dragon.New({
    containerId: 'editor',
    enableHistory: false  // If this option is added
});

// Or limit history size
editor.stateHistory.maxStates = 10; // Limit undo states
```

### Debugging

Enable debug mode for detailed logging:

```javascript
// Add to your initialization
window.DEBUG_DRAGON = true;

const editor = dragon.New({
    containerId: 'editor',
    debug: true  // If debug option is implemented
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Clone the repository
2. Open `index.html` in a browser
3. Make changes to the JavaScript modules
4. Test across different browsers
5. Submit a pull request

### Testing Checklist

- [ ] Test drag and drop in Chrome, Firefox, Safari
- [ ] Verify responsive preview modes
- [ ] Test HTML editor functionality
- [ ] Check undo/redo behavior
- [ ] Verify save/load if configured
- [ ] Test custom snippets
- [ ] Validate mobile touch events

## License

MIT License - see [LICENSE.md](LICENSE.md) file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/tsawler/dragoncms)
