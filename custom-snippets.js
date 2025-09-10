/**
 * DragonCMS Custom Snippets Configuration
 * 
 * This file allows you to add custom snippets to the DragonCMS editor.
 * Snippets are content elements like text, images, buttons, or custom HTML components.
 * 
 * Usage:
 * 1. Add snippet definitions to the customSnippets array below
 * 2. The snippets will automatically appear in the editor's snippet panel
 * 3. Users can drag these snippets into blocks on the editor canvas
 * 
 * Snippet Configuration Properties:
 * - id: Unique identifier for the snippet
 * - name: Display name in the editor panel
 * - type: Must be 'snippet' for content elements
 * - snippetType: Optional sub-type (e.g., 'text', 'media', 'button')
 * - preview: 'text' or 'image' - how to display the preview
 * - previewImage: (optional) SVG data URL for image preview
 * - html: The HTML structure of the snippet
 * - description: (optional) Tooltip description
 * - category: (optional) Category for organization
 */

// Define custom snippets
window.DragonSnippets = {
    // Custom snippets defined by the user
    customSnippets: [
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
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    max-width: 100%;
                    box-sizing: border-box;
                ">
                    <div style="
                        background: #3b82f6;
                        color: white;
                        border-radius: 50%;
                        width: 24px;
                        height: 24px;
                        min-width: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: bold;
                        flex-shrink: 0;
                    ">i</div>
                    <p style="
                        margin: 0; 
                        color: #1e40af; 
                        font-weight: 500;
                        flex: 1;
                        word-wrap: break-word;
                        line-height: 1.5;
                    ">
                        This is an important message or alert for your visitors.
                    </p>
                </div>
            `
        },
        {
            id: 'custom-testimonial-card',
            name: 'Testimonial Card',
            type: 'snippet',
            snippetType: 'content',
            preview: 'text',
            description: 'A customer testimonial with avatar and rating',
            category: 'marketing',
            html: `
                <div class="testimonial-card" style="
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 24px;
                    margin: 16px 0;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    max-width: 100%;
                    box-sizing: border-box;
                ">
                    <div style="
                        display: flex; 
                        align-items: center; 
                        margin-bottom: 16px;
                        flex-wrap: wrap;
                        gap: 12px;
                    ">
                        <div style="
                            width: 48px; 
                            height: 48px; 
                            border-radius: 50%; 
                            background: #3b82f6;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                            font-size: 18px;
                            flex-shrink: 0;
                        ">
                            JS
                        </div>
                        <div style="min-width: 0; flex: 1;">
                            <h4 style="
                                margin: 0; 
                                font-size: 16px; 
                                font-weight: 600; 
                                color: #111827;
                                word-wrap: break-word;
                            ">
                                John Smith
                            </h4>
                            <p style="
                                margin: 0; 
                                font-size: 14px; 
                                color: #6b7280;
                                word-wrap: break-word;
                            ">
                                CEO, TechCorp
                            </p>
                        </div>
                    </div>
                    <div style="color: #fbbf24; margin-bottom: 12px; font-size: 18px;">
                        ★★★★★
                    </div>
                    <p style="
                        margin: 0; 
                        color: #374151; 
                        line-height: 1.6; 
                        font-style: italic;
                        word-wrap: break-word;
                    ">
                        "This product has completely transformed how we work. The team is more efficient and our customers are happier than ever!"
                    </p>
                </div>
            `
        },
        {
            id: 'custom-stat-counter',
            name: 'Stat Counter',
            type: 'snippet',
            snippetType: 'content',
            preview: 'text',
            description: 'A statistics counter with number and description',
            category: 'marketing',
            html: `
                <div class="stat-counter" style="
                    text-align: center;
                    padding: 24px;
                    margin: 16px 0;
                ">
                    <div style="
                        font-size: 48px;
                        font-weight: 700;
                        color: #3b82f6;
                        line-height: 1;
                        margin-bottom: 8px;
                    ">
                        100+
                    </div>
                    <h3 style="
                        font-size: 18px;
                        font-weight: 600;
                        color: #111827;
                        margin: 0 0 8px 0;
                    ">
                        Happy Customers
                    </h3>
                    <p style="
                        margin: 0;
                        color: #6b7280;
                        font-size: 14px;
                    ">
                        Satisfied clients worldwide
                    </p>
                </div>
            `
        },
        {
            id: 'custom-feature-highlight',
            name: 'Feature Highlight',
            type: 'snippet',
            snippetType: 'content',
            preview: 'text',
            description: 'A feature highlight with icon and description',
            category: 'content',
            html: `
                <div class="feature-highlight" style="
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 24px;
                    margin: 16px 0;
                ">
                    <div style="
                        background: #10b981;
                        color: white;
                        border-radius: 8px;
                        width: 48px;
                        height: 48px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 24px;
                        flex-shrink: 0;
                    ">
                        ✓
                    </div>
                    <div>
                        <h3 style="
                            margin: 0 0 8px 0;
                            font-size: 20px;
                            font-weight: 600;
                            color: #111827;
                        ">
                            Amazing Feature
                        </h3>
                        <p style="
                            margin: 0;
                            color: #6b7280;
                            line-height: 1.6;
                        ">
                            Describe your amazing feature and how it benefits your customers. Keep it concise and compelling.
                        </p>
                    </div>
                </div>
            `
        },
        {
            id: 'custom-code-block',
            name: 'Code Block',
            type: 'snippet',
            snippetType: 'content',
            preview: 'text',
            description: 'A styled code block for displaying code snippets',
            category: 'content',
            html: `
                <div class="code-block" style="
                    background: #1f2937;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 16px 0;
                    overflow-x: auto;
                ">
                    <div style="
                        display: flex;
                        align-items: center;
                        margin-bottom: 12px;
                        gap: 6px;
                    ">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></div>
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></div>
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
                    </div>
                    <pre style="
                        margin: 0;
                        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                        font-size: 14px;
                        line-height: 1.5;
                        color: #e5e7eb;
                    "><code>function hello() {
    console.log('Hello, World!');
}

hello();</code></pre>
                </div>
            `
        }
    ],

    // Built-in methods for managing custom snippets (automatically provided by DragonCMS)
    getAllCustomSnippets() {
        return this.customSnippets;
    },

    getSnippetsByCategory(category) {
        return this.customSnippets.filter(snippet => snippet.category === category);
    },

    getSnippetById(id) {
        return this.customSnippets.find(snippet => snippet.id === id);
    },

    getCategories() {
        const categories = this.customSnippets
            .map(snippet => snippet.category)
            .filter(Boolean);
        return [...new Set(categories)].sort();
    },

    addCustomSnippet(snippet) {
        // Validate required properties
        if (!snippet.id || !snippet.name || !snippet.html) {
            console.warn('Custom snippet must have id, name, and html properties');
            return false;
        }

        // Check for duplicate ID
        if (this.getSnippetById(snippet.id)) {
            console.warn(`Snippet with ID '${snippet.id}' already exists`);
            return false;
        }

        // Set default values
        snippet.type = 'snippet';
        if (!snippet.preview) {
            snippet.preview = 'text';
        }

        this.customSnippets.push(snippet);
        return true;
    }
};