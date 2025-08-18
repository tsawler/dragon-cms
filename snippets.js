// Snippet definitions for the drag-and-drop editor
// Each snippet can have either a text label or an image preview
//
// SUPPORTED PREVIEW IMAGE FORMATS:
// - SVG (inline or data URL)
// - PNG (file path or data URL) 
// - JPEG/JPG (file path or data URL)
// - WebP (file path or data URL)
// - GIF (file path or data URL)
// - Any web-compatible image format
//
// PREVIEW IMAGE OPTIONS:
// 1. File path: './images/my-preview.png'
// 2. Absolute URL: 'https://example.com/preview.jpg'
// 3. Data URL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
// 4. SVG data URL: svgToDataUrl('<svg>...</svg>')
//
// EXAMPLE USAGE:
// {
//     id: 'my-snippet',
//     name: 'My Custom Snippet',
//     type: 'snippet',
//     preview: 'image',
//     previewImage: './assets/my-preview.png',  // Any image format!
//     html: '<div>My content</div>'
// }

// Helper function to safely encode SVG to base64
function svgToDataUrl(svgString) {
    // Clean the SVG string to ensure it's properly encoded
    const cleanSvg = svgString.trim().replace(/\s+/g, ' ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cleanSvg);
}

const SNIPPET_LIBRARY = {
    blocks: [
        {
            id: 'container-block',
            name: 'Container Block',
            type: 'block',
            preview: 'text', // 'text' or 'image'
            html: '<div class="content-container"></div>'
        },
        {
            id: 'two-column-block',
            name: 'Two Column Block',
            type: 'block',
            preview: 'text',
            html: '<div class="two-column-container" style="display: flex; gap: 20px;"><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div></div>'
        },
        {
            id: 'three-column-block',
            name: 'Three Column Block',
            type: 'block',
            preview: 'text',
            html: '<div class="three-column-container" style="display: flex; gap: 20px;"><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div></div>'
        },
        {
            id: 'hero-block',
            name: 'Hero Block',
            type: 'block',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea"/>
                            <stop offset="100%" style="stop-color:#764ba2"/>
                        </linearGradient>
                    </defs>
                    <rect width="200" height="100" fill="url(#heroGrad)" rx="4"/>
                    <text x="100" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Hero Title</text>
                    <text x="100" y="60" text-anchor="middle" fill="white" font-size="12">Hero subtitle goes here</text>
                </svg>
            `),
            html: '<div class="hero-container" style="padding: 60px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><h1 style="color: white; font-size: 3rem; margin-bottom: 1rem;" contenteditable="true">Hero Title</h1><p style="color: white; font-size: 1.25rem;" contenteditable="true">Hero subtitle goes here</p></div>'
        }
    ],
    
    snippets: [
        {
            id: 'heading-snippet',
            name: 'Heading',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="40" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <text x="10" y="25" fill="#1f2937" font-size="18" font-weight="bold">Your Heading</text>
                </svg>
            `),
            html: '<h2 contenteditable="true">Your Heading Here</h2>'
        },
        {
            id: 'paragraph-snippet',
            name: 'Paragraph',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <line x1="10" y1="15" x2="140" y2="15" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="25" x2="120" y2="25" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="35" x2="135" y2="35" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="45" x2="90" y2="45" stroke="#6b7280" stroke-width="2"/>
                </svg>
            `),
            html: '<p contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
        },
        {
            id: 'button-snippet',
            name: 'Button',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="30" x="10" y="5" fill="#3b82f6" rx="4"/>
                    <text x="50" y="22" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Click Me</text>
                </svg>
            `),
            html: '<button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Click Me</button>'
        },
        {
            id: 'list-snippet',
            name: 'List',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <circle cx="15" cy="15" r="3" fill="#6b7280"/>
                    <circle cx="15" cy="30" r="3" fill="#6b7280"/>
                    <circle cx="15" cy="45" r="3" fill="#6b7280"/>
                    <line x1="25" y1="15" x2="100" y2="15" stroke="#6b7280" stroke-width="2"/>
                    <line x1="25" y1="30" x2="90" y2="30" stroke="#6b7280" stroke-width="2"/>
                    <line x1="25" y1="45" x2="95" y2="45" stroke="#6b7280" stroke-width="2"/>
                </svg>
            `),
            html: '<ul><li contenteditable="true">First item</li><li contenteditable="true">Second item</li><li contenteditable="true">Third item</li></ul>'
        },
        {
            id: 'quote-snippet',
            name: 'Quote',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <rect x="5" y="10" width="4" height="40" fill="#3b82f6"/>
                    <text x="15" y="25" fill="#374151" font-size="11" font-style="italic">"Beautiful quote that</text>
                    <text x="15" y="38" fill="#374151" font-size="11" font-style="italic">inspires people"</text>
                    <text x="15" y="52" fill="#6b7280" font-size="9">— Author Name</text>
                </svg>
            `),
            html: '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic;" contenteditable="true">"This is a beautiful quote that inspires people."<footer style="margin-top: 0.5rem; font-style: normal; color: #666;">— Author Name</footer></blockquote>'
        },
        {
            id: 'card-snippet',
            name: 'Card',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="80" fill="white" stroke="#e2e8f0" rx="8"/>
                    <rect x="5" y="5" width="140" height="70" fill="#fafafa" rx="4"/>
                    <text x="15" y="25" fill="#1f2937" font-size="14" font-weight="bold">Card Title</text>
                    <line x1="15" y1="35" x2="130" y2="35" stroke="#9ca3af" stroke-width="1"/>
                    <line x1="15" y1="45" x2="120" y2="45" stroke="#9ca3af" stroke-width="1"/>
                    <text x="15" y="65" fill="#3b82f6" font-size="10">Learn more →</text>
                </svg>
            `),
            html: '<div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><h3 style="margin-bottom: 0.5rem;" contenteditable="true">Card Title</h3><p style="color: #666;" contenteditable="true">Card content goes here. This is a simple card component.</p><a href="#" style="color: #3b82f6; text-decoration: none;" contenteditable="true">Learn more →</a></div>'
        },
        {
            id: 'image-snippet',
            name: 'Image',
            type: 'snippet',
            snippetType: 'image',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="80" fill="#f3f4f6" stroke="#d1d5db" rx="4"/>
                    <circle cx="30" cy="25" r="8" fill="#9ca3af"/>
                    <polygon points="15,50 45,30 75,45 105,25 105,65 15,65" fill="#9ca3af"/>
                    <text x="60" y="45" text-anchor="middle" fill="#6b7280" font-size="10">Image</text>
                </svg>
            `),
            html: '<div class="image-container" style="position: relative; display: inline-block;"><img src="assets/images/vase.jpg" alt="Default Image" style="max-width: 100%; height: auto; display: block;" class="editable-image"><div class="image-upload-zone" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); color: white; display: none; align-items: center; justify-content: center; cursor: pointer; font-size: 14px;">Click to change image</div></div>'
        },
        {
            id: 'video-snippet',
            name: 'Video',
            type: 'snippet',
            snippetType: 'video',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="80" fill="#000" rx="4"/>
                    <polygon points="45,30 45,50 70,40" fill="white"/>
                    <text x="60" y="65" text-anchor="middle" fill="#9ca3af" font-size="10">Video</text>
                </svg>
            `),
            html: '<div class="video-placeholder"></div>'
        },
        {
            id: 'divider-snippet',
            name: 'Divider',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10" y1="10" x2="140" y2="10" stroke="#e2e8f0" stroke-width="2"/>
                </svg>
            `),
            html: '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">'
        },
        {
            id: 'spacer-snippet',
            name: 'Spacer',
            type: 'snippet',
            snippetType: 'text',
            preview: 'text',
            html: '<div style="height: 40px;"></div>'
        }
        
        // Example snippets showing different image formats:
        // 
        // PNG example:
        // {
        //     id: 'custom-png-snippet',
        //     name: 'Custom PNG Block',
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: 'https://example.com/preview.png',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // WebP example:
        // {
        //     id: 'custom-webp-snippet', 
        //     name: 'Custom WebP Block',
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: 'data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAkAAAAvAQAAAAD+p5aEAA==',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // GIF example:
        // {
        //     id: 'custom-gif-snippet',
        //     name: 'Custom GIF Block', 
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: './assets/my-preview.gif',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // JPEG example:
        // {
        //     id: 'custom-jpg-snippet',
        //     name: 'Custom JPEG Block',
        //     type: 'snippet', 
        //     preview: 'image',
        //     previewImage: './images/snippet-preview.jpg',
        //     html: '<div>Custom content here</div>'
        // }
        
    ]
};

// Function to get all blocks
window.getBlocks = function() {
    return SNIPPET_LIBRARY.blocks;
};

// Function to get all snippets
window.getSnippets = function() {
    return SNIPPET_LIBRARY.snippets;
};

// Function to add a custom snippet
window.addCustomSnippet = function(snippet) {
    SNIPPET_LIBRARY.snippets.push(snippet);
};

// Function to get snippet by ID
window.getSnippetById = function(id) {
    const allItems = [...SNIPPET_LIBRARY.blocks, ...SNIPPET_LIBRARY.snippets];
    return allItems.find(item => item.id === id);
};

// Make SNIPPET_LIBRARY available globally
window.SNIPPET_LIBRARY = SNIPPET_LIBRARY;

// Export for use in the main editor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SNIPPET_LIBRARY, getBlocks, getSnippets, addCustomSnippet, getSnippetById };
}