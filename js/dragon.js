import { Editor } from './editor-core.js';
import { ModalDragger } from './modal-dragger.js';

class Dragon {
    constructor() {
        this.instances = new Map();
    }

    /**
     * Create a new Dragon editor instance
     * @param {Object} options - Configuration options including containerId
     * @returns {Editor} The editor instance
     */
    New(options = {}) {
        const finalOptions = options;
        const containerId = options.containerId || 'dragon-editor';
        
        // Get or create container element
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.querySelector(containerId);
        }
        if (!container) {
            throw new Error(`Container element '${containerId}' not found`);
        }

        // Clear the container
        container.innerHTML = '';

        // Create the editor HTML structure
        this.createEditorHTML(container, finalOptions);

        // Mark as dragon-initialized
        container.classList.add('dragon-initialized');

        // Initialize the editor
        const editor = new Editor(finalOptions);
        
        // Store the instance
        this.instances.set(containerId, editor);
        
        // Add close button handlers
        this.setupCloseHandlers();
        
        // Initialize modal dragging for this instance
        if (!this.modalDragger) {
            this.modalDragger = new ModalDragger();
        }
        
        return editor;
    }

    createEditorHTML(container, options = {}) {
        // Create the main editor structure
        container.innerHTML = `
            <div class="editor-container">
                <div class="editor-header">
                    <h1>${options.title || 'Drag & Drop Editor'}</h1>
                    <div class="editor-controls">
                        <button id="toggle-mode-btn" class="btn btn-primary">Switch to Display Mode</button>
                        <button id="undo-btn" class="btn">Undo</button>
                        <button id="redo-btn" class="btn">Redo</button>
                        <button id="save-btn" class="btn btn-success">Save</button>
                        <button id="load-btn" class="btn">Load</button>
                        <button id="publish-btn" class="btn btn-warning" title="Publish to URL" style="display: none;">Publish</button>
                        <button id="load-from-url-btn" class="btn btn-info" title="Load from URL" style="display: none;">Load from URL</button>
                        <button id="export-html-btn" class="btn">Export HTML</button>
                        <button id="page-settings-btn" class="btn" title="Page Settings">⚙️</button>
                    </div>
                </div>
                
                <div class="editor-main">
                    <aside id="snippet-panel" class="snippet-panel">
                        <div id="panel-handle" class="panel-handle">
                            <div class="handle-grip"></div>
                        </div>
                        <h2>Components</h2>
                        <div id="snippet-list" class="snippet-list">
                            <!-- Snippets will be loaded here -->
                        </div>
                    </aside>
                    
                    <main id="editable-area" class="editable-area" data-mode="edit">
                        <!-- Drop your blocks and snippets here -->
                        <div class="drop-zone-placeholder">
                            <p>Drag blocks and snippets here to start building</p>
                        </div>
                    </main>
                </div>
            </div>

            <!-- Viewport Controls -->
            <div class="viewport-controls">
                <button id="mobile-viewport" class="viewport-btn" data-width="375px" title="Mobile (375px)">📱</button>
                <button id="tablet-viewport" class="viewport-btn" data-width="768px" title="Tablet (768px)">📟</button>
                <button id="desktop-viewport" class="viewport-btn active" data-width="100%" title="Desktop (Full)">🖥️</button>
            </div>

            <!-- Formatting Toolbar -->
            <div id="formatting-toolbar" class="formatting-toolbar" style="display: none;">
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
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <select id="font-family" title="Font Family">
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Times New Roman', serif">Times New Roman</option>
                        <option value="'Courier New', monospace">Courier New</option>
                        <option value="Helvetica, sans-serif">Helvetica</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                    </select>
                    
                    <select id="font-size" title="Font Size">
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="28px">28px</option>
                        <option value="32px">32px</option>
                    </select>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <button data-command="bold" title="Bold"><b>B</b></button>
                    <button data-command="italic" title="Italic"><i>I</i></button>
                    <button data-command="underline" title="Underline"><u>U</u></button>
                    <button data-command="strikeThrough" title="Strikethrough"><s>S</s></button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <input type="color" id="text-color" title="Text Color" value="#000000">
                    <input type="color" id="background-color" title="Background Color" value="#ffffff">
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <button data-command="justifyLeft" title="Align Left">←</button>
                    <button data-command="justifyCenter" title="Align Center">↔</button>
                    <button data-command="justifyRight" title="Align Right">→</button>
                    <button data-command="justifyFull" title="Justify">⟷</button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <button data-command="insertUnorderedList" title="Bullet List">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <circle cx="3" cy="4" r="1.5" fill="currentColor"/>
                            <circle cx="3" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="3" cy="12" r="1.5" fill="currentColor"/>
                            <rect x="6" y="3" width="8" height="2" fill="currentColor"/>
                            <rect x="6" y="7" width="8" height="2" fill="currentColor"/>
                            <rect x="6" y="11" width="8" height="2" fill="currentColor"/>
                        </svg>
                    </button>
                    <button data-command="insertOrderedList" title="Numbered List">
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
                    </button>
                    <button data-command="outdent" title="Decrease Indent">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <rect x="4" y="2" width="10" height="2" fill="currentColor"/>
                            <rect x="4" y="6" width="8" height="2" fill="currentColor"/>
                            <rect x="4" y="10" width="10" height="2" fill="currentColor"/>
                            <polygon points="0,8 3,6 3,10" fill="currentColor"/>
                        </svg>
                    </button>
                    <button data-command="indent" title="Increase Indent">
                        <svg width="16" height="16" viewBox="0 0 16 16">
                            <rect x="4" y="2" width="10" height="2" fill="currentColor"/>
                            <rect x="6" y="6" width="8" height="2" fill="currentColor"/>
                            <rect x="4" y="10" width="10" height="2" fill="currentColor"/>
                            <polygon points="3,8 0,6 0,10" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
                
                <div class="toolbar-divider"></div>
                
                <div class="toolbar-section">
                    <button data-command="insertImage" title="Insert Image">🖼️</button>
                    <button data-command="createLink" title="Insert Link">🔗</button>
                    <button data-command="unlink" title="Remove Link">✂️</button>
                    <button data-command="removeFormat" title="Clear Formatting">⌫</button>
                </div>
            </div>

            <!-- Image Alignment Toolbar -->
            <div id="image-alignment-toolbar" class="image-alignment-toolbar">
                <button data-align="left" title="Align Left">←</button>
                <button data-align="center" title="Align Center">↔</button>
                <button data-align="right" title="Align Right">→</button>
            </div>

            <!-- Page Settings Modal -->
            <div id="page-settings-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Page Settings</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="modal-tabs">
                            <button class="tab-btn active" data-tab="general">General</button>
                            <button class="tab-btn" data-tab="css">CSS</button>
                            <button class="tab-btn" data-tab="javascript">JavaScript</button>
                        </div>
                        
                        <div class="tab-content">
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
                            
                            <div id="css-tab" class="tab-panel">
                                <div class="form-group">
                                    <label for="page-css">Custom CSS</label>
                                    <textarea id="page-css" class="code-editor-textarea" placeholder="/* Enter custom CSS for this page */"></textarea>
                                </div>
                            </div>
                            
                            <div id="javascript-tab" class="tab-panel">
                                <div class="form-group">
                                    <label for="page-javascript">Custom JavaScript</label>
                                    <textarea id="page-javascript" class="code-editor-textarea" placeholder="// Enter custom JavaScript for this page"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-cancel">Cancel</button>
                        <button class="btn btn-primary" id="save-page-settings">Save Settings</button>
                    </div>
                </div>
            </div>
        `;

        // Add CSS if not already loaded
        if (!document.querySelector('link[href*="editor.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = options.cssPath || 'editor.css';
            document.head.appendChild(link);
        }

        // Load snippets.js if not already loaded
        if (!window.getSnippets) {
            const script = document.createElement('script');
            script.src = options.snippetsPath || 'snippets.js';
            document.head.appendChild(script);
        }
    }

    /**
     * Get an existing editor instance
     * @param {string} containerId - The ID of the container element
     * @returns {Editor|undefined} The editor instance
     */
    get(containerId) {
        return this.instances.get(containerId);
    }

    setupCloseHandlers() {
        // Handle modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Handle cancel buttons
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Handle background clicks
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });
    }

    closeModal(modal) {
        // Hide the modal using class toggle for Edge compatibility
        modal.classList.remove('active');
        
        // Reset the modal content position if it was dragged
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent && this.modalDragger) {
            this.modalDragger.resetModalPosition(modalContent);
        }
    }

    /**
     * Destroy an editor instance
     * @param {string} containerId - The ID of the container element
     */
    destroy(containerId) {
        const editor = this.instances.get(containerId);
        if (editor) {
            // Call cleanup methods if they exist
            if (editor.destroy) {
                editor.destroy();
            }
            this.instances.delete(containerId);
        }
    }
}

// Create and export the global dragon instance
const dragon = new Dragon();

// Make it available globally
window.dragon = dragon;

export default dragon;