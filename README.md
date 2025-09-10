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
- **Event System** - Listen to editor mode changes and content modifications
- **Callback System** - onChange and onRender callbacks for content tracking
- **Font Customization** - Easy Google Fonts integration with copy-paste embed links
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
├── fonts.js                # Google Fonts configuration
├── custom-blocks.js        # Custom blocks configuration
├── custom-snippets.js      # Custom snippets configuration
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

# Serve built files on localhost:8000
npm run serve

# Serve development files on localhost:8000  
npm run serve:dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

#### Development Workflows

**Fast Development (Recommended):**
```bash
npm run serve:dev  # Serves source files directly with ES modules
# Edit source files, refresh browser to see changes immediately
```

**Production Testing:**
```bash
npm run build  # Build once
npm run serve  # Serve built files
# Test the production build
```

**Testing:**
```bash
npm test                # Run all tests once
npm run test:watch      # Run tests in watch mode (auto-rerun on file changes)
npm run test:coverage   # Generate test coverage report
```

DragonCMS includes a comprehensive test suite covering:
- Core editor functionality
- Font system and Google Fonts integration
- Custom blocks system and configuration
- Custom snippets system and configuration
- State management and history
- Modal components and UI interactions
- Callback system
- Error handling and edge cases

#### Build Output

The build process creates:

- `dist/dragon.js` - Development bundle (unminified)
- `dist/dragon.min.js` - Production bundle (minified, console logs removed)
- `dist/editor.css` - Editor styles (unminified)
- `dist/editor.min.css` - Editor styles (minified)
- `dist/snippets.js` - Components (unminified)
- `dist/snippets.min.js` - Components (minified)
- `dist/fonts.js` - Google Fonts configuration (copied from source)
- `dist/custom-blocks.js` - Custom blocks configuration (copied from source)
- `dist/custom-snippets.js` - Custom snippets configuration (copied from source)
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

### Font Customization

DragonCMS supports easy Google Fonts integration through the `fonts.js` configuration file. Users can simply copy and paste Google Fonts embed links to add custom typography to the formatting toolbar.

#### Adding Google Fonts

1. Visit [fonts.google.com](https://fonts.google.com) and select your desired fonts
2. Copy the `<link>` embed code provided by Google Fonts
3. Add it to the `googleFontLinks` array in `fonts.js`

```javascript
// In fonts.js
window.DragonFonts = {
    // Default system fonts (always available)
    systemFonts: [
        { name: "Arial", family: "Arial, sans-serif" },
        { name: "Georgia", family: "Georgia, serif" },
        // ... other system fonts
    ],

    // Google Fonts - just paste embed links here
    googleFontLinks: [
        '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400&display=swap" rel="stylesheet">',
        // Add your fonts here
    ]
};
```

#### Supported Font Formats

The font parser automatically handles various Google Fonts URL formats:

```javascript
// Simple single font
'<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap" rel="stylesheet">'

// Multiple weights
'<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">'

// Multiple fonts in one URL
'<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&family=Open+Sans:wght@300;400&display=swap" rel="stylesheet">'

// Complex variations with italics
'<link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;1,400&display=swap" rel="stylesheet">'
```

#### Font Fallback Assignment

The system automatically assigns appropriate fallbacks:

- **Serif fonts** (Playfair Display, Merriweather, etc.) → `serif`
- **Monospace fonts** (Fira Code, Source Code Pro, etc.) → `monospace` 
- **All other fonts** → `sans-serif`

#### Custom Font Integration

For production builds, ensure `fonts.js` is loaded before the Dragon library:

```html
<!-- Development -->
<script src="fonts.js"></script>
<script src="snippets.js"></script>
<script type="module" src="js/dragon.js"></script>

<!-- Production -->
<script src="fonts.js"></script>
<script src="snippets.min.js"></script>
<script src="dragon.min.js"></script>
```

#### Font Loading

Google Fonts are automatically loaded when the editor initializes. The system:

1. Parses font names from embed links
2. Injects `<link>` tags into the document head
3. Adds fonts to the formatting toolbar dropdown
4. Prevents duplicate font loading

#### Example: Adding Popular Fonts

```javascript
// Popular Google Fonts examples
googleFontLinks: [
    // Sans-serif fonts
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
    
    // Serif fonts
    '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">',
    
    // Monospace fonts
    '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400&display=swap" rel="stylesheet">'
]
```

### Custom Blocks

DragonCMS supports user-defined custom blocks through the `custom-blocks.js` configuration file. Custom blocks are container elements that can hold other content and appear in the editor's block panel alongside default blocks.

#### Adding Custom Blocks

Custom blocks are defined in the `custom-blocks.js` file. **Simply add your blocks to the `customBlocks` array - that's all you need to do!**

```javascript
// In custom-blocks.js - This is ALL you need to edit:
window.DragonBlocks = {
    customBlocks: [
        // Just add your blocks here:
        {
            id: 'custom-card-block',
            name: 'Card Block',
            type: 'block',
            preview: 'text',
            description: 'A card-style container with shadow and padding',
            category: 'layout',
            html: `
                <div class="editor-block card-block" style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                ">
                    <div class="card-content">
                        <h3>Card Title</h3>
                        <p>This is a custom card block. Add your content here.</p>
                    </div>
                </div>
            `
        },
        // Add more blocks here...
    ]
    
    // Note: Management methods are automatically provided by DragonCMS
    // You don't need to implement these - they're built-in!
};
```

**That's it!** Include the script tag and your blocks automatically appear:

```html
<script src="custom-blocks.js"></script>
<script src="custom-snippets.js"></script>
<script src="snippets.js"></script>
<script type="module" src="js/dragon.js"></script>
```

#### Block Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier for the block |
| `name` | string | ✓ | Display name in the editor panel |
| `type` | string | ✓ | Must be 'block' for container elements |
| `html` | string | ✓ | The HTML structure of the block |
| `preview` | string | ✓ | 'text' or 'image' - how to display in panel |
| `description` | string | ✗ | Tooltip description |
| `category` | string | ✗ | Category for organization (e.g., 'layout', 'marketing') |
| `previewImage` | string | ✗ | SVG data URL for image preview |

#### Built-in Custom Blocks

DragonCMS includes several pre-configured custom blocks:

**Layout Blocks:**
- **Card Block** - Card-style container with shadow and padding
- **Feature Grid** - Multi-column grid layout for features

**Marketing Blocks:**
- **CTA Section** - Call-to-action container with centered content
- **Testimonial Block** - Customer testimonial with avatar layout
- **Pricing Table** - Multi-tier pricing comparison

**Content Blocks:**
- Various content-focused containers with predefined styling

#### Creating Custom Blocks

1. **Basic Block Structure:**
   ```javascript
   {
       id: 'my-custom-block',
       name: 'My Custom Block',
       type: 'block',
       preview: 'text',
       category: 'layout',
       html: `
           <div class="editor-block my-custom-block">
               <h2>Custom Block Title</h2>
               <p>Add your content here</p>
           </div>
       `
   }
   ```

2. **Advanced Block with Styling:**
   ```javascript
   {
       id: 'hero-section-block',
       name: 'Hero Section',
       type: 'block',
       preview: 'text',
       description: 'Full-width hero section with gradient background',
       category: 'marketing',
       html: `
           <div class="editor-block hero-section" style="
               background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
               color: white;
               text-align: center;
               padding: 80px 20px;
               min-height: 400px;
               display: flex;
               align-items: center;
               justify-content: center;
           ">
               <div>
                   <h1 style="font-size: 48px; margin-bottom: 20px;">Hero Title</h1>
                   <p style="font-size: 20px; margin-bottom: 30px;">Your compelling message here</p>
                   <button style="
                       background: white;
                       color: #667eea;
                       border: none;
                       padding: 15px 40px;
                       font-size: 18px;
                       border-radius: 30px;
                       cursor: pointer;
                   ">Get Started</button>
               </div>
           </div>
       `
   }
   ```

#### Block Categories

Organize blocks using categories:

- **layout** - Structural containers and layout blocks
- **marketing** - CTA, testimonial, pricing blocks
- **content** - Content-focused containers
- **media** - Image galleries, video containers
- **custom** - User-specific blocks

#### Integration with Editor

Custom blocks automatically integrate with the editor:

- **Block Panel** - Appear in left sidebar with "Custom Blocks" separator
- **Drag & Drop** - Full drag and drop functionality
- **Block Settings** - Access to gear icon settings (layout, columns, background)
- **Content Editing** - All text elements are editable
- **Column Management** - Support for adding/removing columns
- **Responsive Design** - Blocks adapt to tablet/mobile preview modes

#### Block Loading

For production builds, ensure both custom files are loaded before the Dragon library:

```html
<!-- Development -->
<script src="fonts.js"></script>
<script src="custom-blocks.js"></script>
<script src="custom-snippets.js"></script>
<script src="snippets.js"></script>
<script type="module" src="js/dragon.js"></script>

<!-- Production -->
<script src="fonts.js"></script>
<script src="custom-blocks.js"></script>
<script src="custom-snippets.js"></script>
<script src="snippets.min.js"></script>
<script src="dragon.min.js"></script>
```

#### Dynamic Block Management (Advanced)

**Note: These methods are automatically provided by DragonCMS - you don't need to implement them!** They're available for advanced runtime management:

```javascript
// Built-in methods available on window.DragonBlocks:

// Get all custom blocks
const blocks = window.DragonBlocks.getAllCustomBlocks();

// Get blocks by category
const layoutBlocks = window.DragonBlocks.getBlocksByCategory('layout');

// Get specific block
const cardBlock = window.DragonBlocks.getBlockById('custom-card-block');

// Get all available categories
const categories = window.DragonBlocks.getCategories();

// Add new block dynamically (advanced usage)
const success = window.DragonBlocks.addCustomBlock({
    id: 'new-block',
    name: 'New Block',
    type: 'block',
    html: '<div class="editor-block">New content</div>'
});
```

**For most users: Just edit the `customBlocks` array in custom-blocks.js - these methods are only needed for advanced programmatic manipulation.**

#### Best Practices

1. **Use semantic HTML structure** with proper accessibility
2. **Include responsive design patterns** (flexbox, grid, percentages)
3. **Provide meaningful descriptions** for better user experience
4. **Use consistent naming conventions** for IDs and classes
5. **Test blocks across devices** using preview modes
6. **Avoid inline scripts** for security (use external initialization if needed)
7. **Use appropriate categories** for better organization

### Custom Snippets

DragonCMS supports user-defined custom snippets through the `custom-snippets.js` configuration file. Custom snippets are content elements like text, images, buttons, or custom HTML components that can be dragged into blocks.

#### Adding Custom Snippets

Custom snippets are defined in the `custom-snippets.js` file. **Simply add your snippets to the `customSnippets` array - that's all you need to do!**

```javascript
// In custom-snippets.js - This is ALL you need to edit:
window.DragonSnippets = {
    customSnippets: [
        // Just add your snippets here:
        {
            id: 'custom-alert-box',
            name: 'Alert Box',
            type: 'snippet',
            snippetType: 'content',
            preview: 'text',
            description: 'A styled alert box with icon and message',
            category: 'content',
            html: `
                <div class="alert-box" style="
                    background: #dbeafe;
                    border: 1px solid #3b82f6;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                ">
                    <p>This is an important message for your visitors.</p>
                </div>
            `
        },
        // Add more snippets here...
    ]
    
    // Note: Management methods are automatically provided by DragonCMS
    // You don't need to implement these - they're built-in!
};
```

**That's it!** Include the script tag and your snippets automatically appear in the "Custom Snippets" section:

```html
<script src="custom-blocks.js"></script>
<script src="custom-snippets.js"></script>
<script src="snippets.js"></script>
<script type="module" src="js/dragon.js"></script>
```

#### Snippet Configuration Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | ✓ | Unique identifier for the snippet |
| `name` | string | ✓ | Display name in the editor panel |
| `type` | string | ✓ | Must be 'snippet' for content elements |
| `html` | string | ✓ | The HTML structure of the snippet |
| `preview` | string | ✓ | 'text' or 'image' - how to display in panel |
| `description` | string | ✗ | Tooltip description |
| `category` | string | ✗ | Category for organization (e.g., 'content', 'marketing') |
| `snippetType` | string | ✗ | Sub-type (e.g., 'text', 'media', 'button') |
| `previewImage` | string | ✗ | SVG data URL for image preview |

#### Built-in Custom Snippets

DragonCMS includes several pre-configured custom snippets:

**Content Snippets:**
- **Alert Box** - Styled notification box with icon and message
- **Feature Highlight** - Feature showcase with icon and description
- **Code Block** - Syntax-highlighted code display with terminal styling

**Marketing Snippets:**
- **Testimonial Card** - Customer testimonial with avatar and star rating
- **Stat Counter** - Statistics display with large number and description

#### Creating Custom Snippets

1. **Basic Snippet Structure:**
   ```javascript
   {
       id: 'my-custom-snippet',
       name: 'My Custom Snippet',
       type: 'snippet',
       preview: 'text',
       category: 'content',
       html: `
           <div class="my-custom-snippet">
               <h3>Custom Content</h3>
               <p>Add your content here</p>
           </div>
       `
   }
   ```

2. **Advanced Snippet with Rich Styling:**
   ```javascript
   {
       id: 'pricing-card',
       name: 'Pricing Card',
       type: 'snippet',
       snippetType: 'marketing',
       preview: 'text',
       description: 'A pricing card with features and call-to-action',
       category: 'marketing',
       html: `
           <div class="pricing-card" style="
               background: white;
               border: 2px solid #e5e7eb;
               border-radius: 12px;
               padding: 32px;
               text-align: center;
               max-width: 300px;
               margin: 20px auto;
               box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
           ">
               <h3 style="color: #1f2937; margin: 0 0 16px 0;">Pro Plan</h3>
               <div style="font-size: 48px; font-weight: 700; color: #3b82f6; margin-bottom: 16px;">
                   $29<span style="font-size: 18px; color: #6b7280;">/month</span>
               </div>
               <ul style="list-style: none; padding: 0; margin: 0 0 24px 0; text-align: left;">
                   <li style="padding: 8px 0; color: #374151;">✓ All features included</li>
                   <li style="padding: 8px 0; color: #374151;">✓ Priority support</li>
                   <li style="padding: 8px 0; color: #374151;">✓ Advanced analytics</li>
               </ul>
               <button style="
                   background: #3b82f6;
                   color: white;
                   border: none;
                   border-radius: 8px;
                   padding: 12px 32px;
                   font-size: 16px;
                   font-weight: 600;
                   cursor: pointer;
                   width: 100%;
               ">
                   Get Started
               </button>
           </div>
       `
   }
   ```

#### Snippet Categories

Organize snippets using categories:

- **content** - Text elements, alerts, highlights
- **marketing** - Testimonials, pricing cards, CTAs
- **media** - Image galleries, video players
- **navigation** - Breadcrumbs, pagination, menus
- **social** - Social media widgets, share buttons

#### Integration with Editor

Custom snippets automatically integrate with the editor:

- **Snippet Panel** - Appear in left sidebar with "Custom Snippets" separator
- **Drag & Drop** - Full drag and drop functionality into blocks
- **Text Editing** - All text elements become editable when dropped
- **Formatting Toolbar** - Rich text formatting available for text content
- **Content Flexibility** - Can be placed in any block or column

#### Dynamic Snippet Management (Advanced)

**Note: These methods are automatically provided by DragonCMS - you don't need to implement them!** They're available for advanced runtime management:

```javascript
// Built-in methods available on window.DragonSnippets:

// Get all custom snippets
const snippets = window.DragonSnippets.getAllCustomSnippets();

// Get snippets by category
const contentSnippets = window.DragonSnippets.getSnippetsByCategory('content');

// Get specific snippet
const alertBox = window.DragonSnippets.getSnippetById('custom-alert-box');

// Get all available categories
const categories = window.DragonSnippets.getCategories();

// Add new snippet dynamically (advanced usage)
const success = window.DragonSnippets.addCustomSnippet({
    id: 'new-snippet',
    name: 'New Snippet',
    type: 'snippet',
    html: '<div class="new-snippet">New content</div>'
});
```

**For most users: Just edit the `customSnippets` array in custom-snippets.js - these methods are only needed for advanced programmatic manipulation.**

#### Best Practices

1. **Keep snippets focused** on single components or content types
2. **Use inline styles** for better portability and self-containment
3. **Provide clear descriptions** to help users understand the purpose
4. **Test across devices** to ensure responsive behavior
5. **Use semantic HTML** with proper accessibility attributes
6. **Avoid complex JavaScript** - keep snippets simple and reliable
7. **Category organization** helps users find snippets quickly

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
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Open `index.html` in a browser or use `npm run serve:dev`
5. Make changes to the JavaScript modules
6. Run tests again to ensure no regressions
7. Test across different browsers
8. Submit a pull request

### Testing

DragonCMS uses Jest for unit and integration testing. Tests are located in the `tests/` directory.

**Running Tests:**
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/fonts.test.js

# Run tests in watch mode (recommended for development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Structure:**
- `tests/fonts.test.js` - Google Fonts system tests
- `tests/blocks.test.js` - Custom blocks system tests
- `tests/custom-snippets.test.js` - Custom snippets system tests
- `tests/callbacks.test.js` - onChange/onRender callback tests  
- `tests/editor-core.test.js` - Core editor functionality tests
- `tests/modals.test.js` - Modal component tests
- `tests/[component].test.js` - Individual component tests

**Writing Tests:**
Follow the existing test patterns. All tests should:
- Use descriptive test names
- Test both success and error scenarios
- Mock external dependencies appropriately
- Maintain good coverage of critical functionality

### Testing Checklist

- [ ] Run `npm test` and ensure all tests pass
- [ ] Test drag and drop in Chrome, Firefox, Safari
- [ ] Verify responsive preview modes
- [ ] Test HTML editor functionality
- [ ] Check undo/redo behavior
- [ ] Test font customization with Google Fonts
- [ ] Test custom blocks functionality and integration
- [ ] Test custom snippets functionality and integration
- [ ] Verify save/load if configured
- [ ] Test custom snippets
- [ ] Test callback functionality (onChange/onRender)
- [ ] Validate mobile touch events

## License

MIT License - see [LICENSE.md](LICENSE.md) file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/tsawler/dragoncms)
