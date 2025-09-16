import { Editor } from './editor-core.js';
import { ModalDragger } from './modal-dragger.js';
import {
    createCompleteEditorHTML,
    generateFontOptions as generateFontOptionsTemplate
} from './dragon-templates.js';

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
        // Set default values for options
        const finalOptions = {
            assetsPath: 'assets/', // Default assets path
            ...options
        };
        const containerId = options.containerId || 'dragon-editor';

        // Check if an editor already exists for this container
        if (this.instances.has(containerId)) {
            return this.instances.get(containerId);
        }

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
        // Load Google Fonts if available
        this.loadGoogleFonts();

        // Create the main editor structure using template functions
        container.innerHTML = createCompleteEditorHTML();

        // Show/hide publish and load from URL buttons based on options
        this.configureUrlButtons();

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
     * Load Google Fonts from fonts.js if available
     */
    loadGoogleFonts() {
        // Check if fonts.js is loaded and DragonFonts is available
        if (typeof window.DragonFonts !== 'undefined' && window.DragonFonts.loadGoogleFonts) {
            // Use the new simplified loading system
            window.DragonFonts.loadGoogleFonts();
        }
    }

    /**
     * Configure URL buttons visibility based on options
     * The actual visibility is handled by Editor class based on publishUrl/loadUrl
     */
    configureUrlButtons() {
        // Buttons start hidden by default with btn-hidden class
        // Editor class will show them if URLs are provided
    }

    /**
     * Generate font options HTML for the font family dropdown
     * @deprecated Use template function instead
     */
    generateFontOptions() {
        return generateFontOptionsTemplate();
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