/**
 * Template functions for DragonCMS HTML generation
 * Separates HTML structure from logic for better maintainability
 */

// Configuration for default fonts
const DEFAULT_FONTS = [
    { name: "Arial", family: "Arial, sans-serif" },
    { name: "Georgia", family: "Georgia, serif" },
    { name: "Times New Roman", family: "'Times New Roman', serif" },
    { name: "Courier New", family: "'Courier New', monospace" },
    { name: "Helvetica", family: "Helvetica, sans-serif" },
    { name: "Verdana", family: "Verdana, sans-serif" }
];

// Font sizes configuration
const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

/**
 * Generate the editor header HTML
 */
export function createEditorHeader() {
    return `
        <div class="editor-header">
            <div class="editor-controls">
                <button id="toggle-mode-btn" class="btn btn-primary">Switch to Display Mode</button>
                <button id="undo-btn" class="btn" title="Undo">↶</button>
                <button id="redo-btn" class="btn" title="Redo">↷</button>
                <button id="save-btn" class="btn btn-success">Save</button>
                <button id="load-btn" class="btn">Load</button>
                <button id="publish-btn" class="btn btn-warning btn-hidden" title="Publish to URL">Publish</button>
                <button id="load-from-url-btn" class="btn btn-info btn-hidden" title="Load from URL">Load from URL</button>
                <button id="export-html-btn" class="btn">Export HTML</button>
                <button id="page-settings-btn" class="btn" title="Page Settings">⚙️</button>
            </div>
        </div>
    `;
}

/**
 * Generate the icon strip HTML
 */
export function createIconStrip() {
    return `
        <div class="icon-strip">
            <button class="icon-strip-button" data-tab="sections" title="Sections">📋</button>
            <button class="icon-strip-button" data-tab="blocks" title="Blocks">🧱</button>
            <button class="icon-strip-button" data-tab="snippets" title="Snippets">⚡</button>
        </div>
    `;
}

/**
 * Generate the snippet panel HTML
 */
export function createSnippetPanel() {
    return `
        <aside id="snippet-panel" class="snippet-panel">
            <div class="panel-header">
                <h2 id="panel-title" class="panel-title">Sections</h2>
                <div class="panel-filter">
                    <span class="filter-icon">🔍</span>
                    <input type="text" id="filter-input" class="filter-input" placeholder="Search...">
                </div>
            </div>
            <div id="snippet-list" class="snippet-list">
                <!-- Filtered content will be loaded here -->
            </div>
        </aside>
    `;
}

/**
 * Generate the main editable area HTML
 */
export function createEditableArea() {
    return `
        <main id="editable-area" class="editable-area" data-mode="edit">
            <div class="drop-zone-placeholder">
                <p>Drag blocks and snippets here to start building</p>
            </div>
        </main>
    `;
}

/**
 * Generate the viewport controls HTML
 */
export function createViewportControls() {
    return `
        <div class="viewport-controls">
            <button id="mobile-viewport" class="viewport-btn" data-width="375px" title="Mobile (375px)">📱</button>
            <button id="tablet-viewport" class="viewport-btn" data-width="768px" title="Tablet (768px)">📟</button>
            <button id="desktop-viewport" class="viewport-btn active" data-width="100%" title="Desktop (Full)">🖥️</button>
        </div>
    `;
}

/**
 * Generate font options for the dropdown
 */
export function generateFontOptions() {
    // Use DragonFonts if available, otherwise fallback to default fonts
    const fonts = (typeof window.DragonFonts !== 'undefined' && window.DragonFonts.getAllFonts)
        ? window.DragonFonts.getAllFonts()
        : DEFAULT_FONTS;

    return fonts.map(font =>
        `<option value="${font.family}">${font.name}</option>`
    ).join('');
}

/**
 * Generate font size options
 */
export function generateFontSizeOptions() {
    return FONT_SIZES.map(size =>
        `<option value="${size}">${size}</option>`
    ).join('');
}

/**
 * Generate the formatting toolbar HTML
 */
export function createFormattingToolbar() {
    return `
        <div id="formatting-toolbar" class="formatting-toolbar toolbar-hidden">
            ${createFormatSection()}
            <div class="toolbar-divider"></div>
            ${createFontSection()}
            <div class="toolbar-divider"></div>
            ${createTextStyleSection()}
            <div class="toolbar-divider"></div>
            ${createColorSection()}
            <div class="toolbar-divider"></div>
            ${createAlignmentSection()}
            <div class="toolbar-divider"></div>
            ${createListSection()}
            <div class="toolbar-divider"></div>
            ${createActionSection()}
        </div>
    `;
}

/**
 * Create format selection section
 */
function createFormatSection() {
    return `
        <div class="toolbar-section">
            <select id="format-select" title="Format">
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="blockquote">Quote</option>
            </select>
        </div>
    `;
}

/**
 * Create font selection section
 */
function createFontSection() {
    return `
        <div class="toolbar-section">
            <select id="font-family" title="Font Family">
                ${generateFontOptions()}
            </select>
            <select id="font-size" title="Font Size">
                ${generateFontSizeOptions()}
            </select>
        </div>
    `;
}

/**
 * Create text style buttons section
 */
function createTextStyleSection() {
    return `
        <div class="toolbar-section">
            <button data-command="bold" title="Bold"><b>B</b></button>
            <button data-command="italic" title="Italic"><i>I</i></button>
            <button data-command="underline" title="Underline"><u>U</u></button>
            <button data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
        </div>
    `;
}

/**
 * Create color selection section
 */
function createColorSection() {
    return `
        <div class="toolbar-section">
            <input type="color" id="text-color" title="Text Color" value="#000000">
            <input type="color" id="background-color" title="Background Color" value="#ffffff">
        </div>
    `;
}

/**
 * Create alignment buttons section
 */
function createAlignmentSection() {
    return `
        <div class="toolbar-section">
            <button data-command="justifyLeft" title="Align Left">←</button>
            <button data-command="justifyCenter" title="Align Center">↔</button>
            <button data-command="justifyRight" title="Align Right">→</button>
            <button data-command="justifyFull" title="Justify">⟷</button>
        </div>
    `;
}

/**
 * Create list buttons section
 */
function createListSection() {
    return `
        <div class="toolbar-section">
            <button data-command="insertUnorderedList" title="Bullet List">
                ${createBulletListIcon()}
            </button>
            <button data-command="insertOrderedList" title="Numbered List">
                ${createNumberedListIcon()}
            </button>
            <button data-command="outdent" title="Decrease Indent">
                ${createOutdentIcon()}
            </button>
            <button data-command="indent" title="Increase Indent">
                ${createIndentIcon()}
            </button>
        </div>
    `;
}

/**
 * Create action buttons section
 */
function createActionSection() {
    return `
        <div class="toolbar-section">
            <button data-command="insertImage" title="Insert Image">🖼️</button>
            <button data-command="createLink" title="Insert Link">🔗</button>
            <button data-command="unlink" title="Remove Link">✂️</button>
            <button data-command="removeFormat" title="Clear Formatting">⌫</button>
        </div>
    `;
}

/**
 * Create SVG icon for bullet list
 */
function createBulletListIcon() {
    return `
        <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
            <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
            <circle cx="3" cy="12" r="1.5" fill="currentColor"/>
            <rect x="6" y="3" width="8" height="2" fill="currentColor"/>
            <rect x="6" y="7" width="8" height="2" fill="currentColor"/>
            <rect x="6" y="11" width="8" height="2" fill="currentColor"/>
        </svg>
    `;
}

/**
 * Create SVG icon for numbered list
 */
function createNumberedListIcon() {
    return `
        <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="2" width="1" height="4" fill="currentColor"/>
            <rect x="0" y="5" width="3" height="1" fill="currentColor"/>
            <rect x="0" y="7" width="3" height="1" fill="currentColor"/>
            <rect x="2" y="8" width="1" height="1" fill="currentColor"/>
            <rect x="0" y="9" width="3" height="1" fill="currentColor"/>
            <rect x="0" y="11" width="3" height="1" fill="currentColor"/>
            <rect x="1" y="12" width="2" height="1" fill="currentColor"/>
            <rect x="0" y="13" width="3" height="1" fill="currentColor"/>
            <rect x="5" y="3" width="9" height="1.5" fill="currentColor"/>
            <rect x="5" y="7.5" width="9" height="1.5" fill="currentColor"/>
            <rect x="5" y="12" width="9" height="1.5" fill="currentColor"/>
        </svg>
    `;
}

/**
 * Create SVG icon for outdent
 */
function createOutdentIcon() {
    return `
        <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="4" y="2" width="10" height="2" fill="currentColor"/>
            <rect x="4" y="6" width="8" height="2" fill="currentColor"/>
            <rect x="4" y="10" width="10" height="2" fill="currentColor"/>
            <polygon points="0,8 3,6 3,10" fill="currentColor"/>
        </svg>
    `;
}

/**
 * Create SVG icon for indent
 */
function createIndentIcon() {
    return `
        <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="4" y="2" width="10" height="2" fill="currentColor"/>
            <rect x="6" y="6" width="8" height="2" fill="currentColor"/>
            <rect x="4" y="10" width="10" height="2" fill="currentColor"/>
            <polygon points="3,8 0,6 0,10" fill="currentColor"/>
        </svg>
    `;
}

/**
 * Create image alignment toolbar HTML
 */
export function createImageAlignmentToolbar() {
    return `
        <div id="image-alignment-toolbar" class="image-alignment-toolbar">
            <button data-align="left" title="Align Left">←</button>
            <button data-align="center" title="Align Center">↔</button>
            <button data-align="right" title="Align Right">→</button>
        </div>
    `;
}

/**
 * Create page settings modal HTML
 */
export function createPageSettingsModal() {
    return `
        <div id="page-settings-modal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Page Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${createModalTabs()}
                    ${createTabContent()}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-cancel">Cancel</button>
                    <button class="btn btn-primary" id="save-page-settings">Save Settings</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create modal tabs
 */
function createModalTabs() {
    return `
        <div class="modal-tabs">
            <button class="tab-btn active" data-tab="general">General</button>
            <button class="tab-btn" data-tab="css">CSS</button>
            <button class="tab-btn" data-tab="javascript">JavaScript</button>
        </div>
    `;
}

/**
 * Create tab content panels
 */
function createTabContent() {
    return `
        <div class="tab-content">
            ${createGeneralTab()}
            ${createCSSTab()}
            ${createJavaScriptTab()}
        </div>
    `;
}

/**
 * Create general settings tab
 */
function createGeneralTab() {
    return `
        <div id="general-tab" class="tab-panel active">
            <div class="form-group">
                <label for="page-name">Page Name</label>
                <input type="text" id="page-name" placeholder="Enter page name">
            </div>
            <div class="form-group">
                <label for="page-title">Page Title</label>
                <input type="text" id="page-title" placeholder="Enter page title (for &lt;title&gt; tag)">
            </div>
        </div>
    `;
}

/**
 * Create CSS settings tab
 */
function createCSSTab() {
    return `
        <div id="css-tab" class="tab-panel">
            <div class="form-group">
                <label for="page-css">Custom CSS</label>
                <textarea id="page-css" class="code-editor-textarea" placeholder="/* Enter custom CSS for this page */"></textarea>
            </div>
        </div>
    `;
}

/**
 * Create JavaScript settings tab
 */
function createJavaScriptTab() {
    return `
        <div id="javascript-tab" class="tab-panel">
            <div class="form-group">
                <label for="page-javascript">Custom JavaScript</label>
                <textarea id="page-javascript" class="code-editor-textarea" placeholder="// Enter custom JavaScript for this page"></textarea>
            </div>
        </div>
    `;
}

/**
 * Create the complete editor HTML structure
 */
export function createCompleteEditorHTML() {
    return `
        <div class="dragon-editor">
            <div class="editor-container">
                ${createEditorHeader()}
                <div class="editor-main">
                    ${createIconStrip()}
                    ${createSnippetPanel()}
                    ${createEditableArea()}
                </div>
            </div>
            ${createViewportControls()}
            ${createFormattingToolbar()}
            ${createImageAlignmentToolbar()}
            ${createPageSettingsModal()}
        </div>
    `;
}