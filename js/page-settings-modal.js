export class PageSettingsModal {
    constructor(editor) {
        this.editor = editor;
        this.modal = document.getElementById('page-settings-modal');
        this.pageData = {
            pageName: '',
            pageTitle: '',
            customCSS: '',
            customJavaScript: ''
        };
        this.init();
    }

    init() {
        this.attachListeners();
        this.cleanupBadData();
        this.loadPageData();
    }

    cleanupBadData() {
        // Check for corrupted data and clean it up
        const stored = localStorage.getItem('pageSettings');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Check if customJavaScript contains HTML (likely corrupted)
                if (data.customJavaScript && data.customJavaScript.includes('<')) {
                    console.warn('Detected corrupted JavaScript data, clearing...');
                    data.customJavaScript = '';
                    localStorage.setItem('pageSettings', JSON.stringify(data));
                }
            } catch (e) {
                console.warn('Corrupted page settings detected, clearing...');
                localStorage.removeItem('pageSettings');
            }
        }
    }

    attachListeners() {
        // Gear button to open modal
        const pageSettingsBtn = document.getElementById('page-settings-btn');
        pageSettingsBtn.addEventListener('click', () => this.show());

        // Tab switching
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Save button
        const saveBtn = document.getElementById('save-page-settings');
        saveBtn.addEventListener('click', () => this.saveSettings());

        // Cancel button and close button (already have onclick in HTML)
        
        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.hide();
            }
        });
    }

    switchTab(tabName, targetModal = null) {
        const modal = targetModal || this.modal;
        
        // Remove active from all tabs and panels
        modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        modal.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Activate selected tab and panel
        modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        modal.querySelector(`#${tabName}-tab`).classList.add('active');
    }

    show() {
        // Edge compatibility - create a completely new modal
        const isEdge = window.navigator.userAgent.indexOf('Edge') > -1 || 
                      window.navigator.userAgent.indexOf('Edg') > -1 ||
                      window.navigator.userAgent.indexOf('EdgeHTML') > -1;
        
        if (isEdge) {
            // Hide the original modal
            this.modal.style.display = 'none';
            
            // Create a new, simple modal for Edge
            this.edgeModal = document.createElement('div');
            this.edgeModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 999999;
                display: block;
            `;
            
            const edgeContent = document.createElement('div');
            edgeContent.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 600px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -300px;
                margin-top: -200px;
                z-index: 1000000;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
                
                // Add syntax highlighting containers to textareas
                this.addSyntaxHighlightingToTextareas(edgeContent);
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal
            this.attachEdgeModalListeners(edgeContent);
            
            // Add simple drag functionality for Edge modal
            this.addEdgeDragFunctionality(edgeContent);
            
            // Load page data into Edge modal
            this.loadPageData();
            
        } else {
            // Normal browser behavior
            this.modal.offsetHeight;
            this.modal.classList.add('active');
            
            // Load page data into regular modal
            this.loadPageData();
        }
        
        // Focus the first input
        setTimeout(() => {
            const targetModal = this.edgeModal || this.modal;
            const firstInput = targetModal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    hide() {
        // Handle Edge modal
        if (this.edgeModal) {
            document.body.removeChild(this.edgeModal);
            this.edgeModal = null;
        }
        
        this.modal.classList.remove('active');
        // Clear any inline display style
        this.modal.style.display = '';
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }

    saveSettings() {
        // Get values from form
        this.pageData.pageName = document.getElementById('page-name').value;
        this.pageData.pageTitle = document.getElementById('page-title').value;
        this.pageData.customCSS = document.getElementById('page-css').value;
        this.pageData.customJavaScript = document.getElementById('page-javascript').value;

        // Store in localStorage
        localStorage.setItem('pageSettings', JSON.stringify(this.pageData));

        // Update document title if page title is set
        if (this.pageData.pageTitle) {
            document.title = this.pageData.pageTitle;
        }

        // Apply custom CSS
        this.applyCustomStyles();

        // Apply custom JavaScript
        this.applyCustomJavaScript();

        // Save state to history
        this.editor.stateHistory.saveState();

        this.hide();
    }

    loadPageData() {
        // Load from localStorage
        const stored = localStorage.getItem('pageSettings');
        if (stored) {
            try {
                this.pageData = JSON.parse(stored);
            } catch (e) {
                console.warn('Failed to parse stored page settings');
                this.pageData = {
                    pageName: '',
                    pageTitle: '',
                    customCSS: '',
                    customJavaScript: ''
                };
            }
        }

        // Populate form fields in the active modal
        const targetModal = this.edgeModal || document;
        const pageName = targetModal.querySelector('#page-name');
        const pageTitle = targetModal.querySelector('#page-title'); 
        const pageCSS = targetModal.querySelector('#page-css');
        const pageJS = targetModal.querySelector('#page-javascript');
        
        if (pageName) pageName.value = this.pageData.pageName || '';
        if (pageTitle) pageTitle.value = this.pageData.pageTitle || '';
        if (pageCSS) pageCSS.value = this.pageData.customCSS || '';
        if (pageJS) pageJS.value = this.pageData.customJavaScript || '';

        // Apply stored styles and scripts on load
        this.applyCustomStyles();
        this.applyCustomJavaScript();
    }

    applyCustomStyles() {
        // Remove existing custom styles
        const existingStyles = document.getElementById('custom-page-styles');
        if (existingStyles) {
            existingStyles.remove();
        }

        // Add new custom styles if they exist
        if (this.pageData.customCSS) {
            const styleElement = document.createElement('style');
            styleElement.id = 'custom-page-styles';
            styleElement.textContent = this.pageData.customCSS;
            document.head.appendChild(styleElement);
        }
    }

    applyCustomJavaScript() {
        // Remove existing custom scripts
        const existingScript = document.getElementById('custom-page-script');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new custom script if it exists
        if (this.pageData.customJavaScript && this.pageData.customJavaScript.trim()) {
            try {
                const scriptElement = document.createElement('script');
                scriptElement.id = 'custom-page-script';
                scriptElement.textContent = this.pageData.customJavaScript;
                document.head.appendChild(scriptElement);
            } catch (error) {
                console.error('Error applying custom JavaScript:', error);
                console.warn('Custom JavaScript not applied due to syntax error:', this.pageData.customJavaScript);
            }
        }
    }

    getPageData() {
        return { ...this.pageData };
    }

    setPageData(data) {
        this.pageData = { ...data };
        this.loadPageData();
    }
    
    attachEdgeModalListeners(edgeContent) {
        // Close button
        const closeBtn = edgeContent.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.hide());
        
        // Tab buttons
        const tabBtns = edgeContent.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName, this.edgeModal);
            });
        });
        
        // Save button
        const saveBtn = edgeContent.querySelector('.btn-primary');
        if (saveBtn) saveBtn.addEventListener('click', () => this.savePageData(this.edgeModal));
        
        // Cancel button  
        const cancelBtn = edgeContent.querySelector('.btn-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.hide());
        
        // Close on background click
        this.edgeModal.addEventListener('click', (e) => {
            if (e.target === this.edgeModal) {
                this.hide();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.edgeModal) {
                this.hide();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    savePageData(targetModal = null) {
        const modal = targetModal || this.modal;
        
        // Get values from form
        this.pageData.pageName = modal.querySelector('#page-name').value;
        this.pageData.pageTitle = modal.querySelector('#page-title').value;
        this.pageData.customCSS = modal.querySelector('#page-css').value;
        this.pageData.customJavaScript = modal.querySelector('#page-javascript').value;
        
        // Save to localStorage
        localStorage.setItem('pageSettings', JSON.stringify(this.pageData));
        
        // Apply the styles and scripts
        this.applyCustomStyles();
        this.applyCustomJavaScript();
        
        // Save editor state
        if (this.editor && this.editor.stateHistory) {
            this.editor.stateHistory.saveState();
        }
        
        // Close modal
        this.hide();
        
        console.log('Page settings saved:', this.pageData);
    }
    
    addEdgeDragFunctionality(modalContent) {
        const modalHeader = modalContent.querySelector('.modal-header');
        if (!modalHeader) return;
        
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        modalHeader.style.cursor = 'move';
        
        modalHeader.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('modal-close')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(modalContent.style.marginLeft) || -300;
            startTop = parseInt(modalContent.style.marginTop) || -200;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            modalContent.style.marginLeft = (startLeft + deltaX) + 'px';
            modalContent.style.marginTop = (startTop + deltaY) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
    
    addSyntaxHighlightingToTextareas(edgeContent) {
        const textareas = edgeContent.querySelectorAll('#page-css, #page-javascript');
        
        textareas.forEach(textarea => {
            // Create the container structure
            const container = document.createElement('div');
            container.className = 'code-editor-container';
            
            const highlight = document.createElement('div');
            highlight.className = 'code-editor-highlight';
            highlight.id = textarea.id + '-highlight';
            
            // Insert container before textarea
            textarea.parentNode.insertBefore(container, textarea);
            
            // Move textarea into container and add highlight div
            container.appendChild(highlight);
            container.appendChild(textarea);
            
            // Set up syntax highlighting
            const updateHighlighting = () => {
                const code = textarea.value;
                const language = textarea.id === 'page-css' ? 'css' : 'javascript';
                
                // Import highlighting functions from modals.js
                if (typeof highlightSyntax === 'function') {
                    highlight.innerHTML = highlightSyntax(code, language);
                } else {
                    highlight.textContent = code;
                }
                
                // Sync scroll positions
                highlight.scrollTop = textarea.scrollTop;
                highlight.scrollLeft = textarea.scrollLeft;
            };
            
            textarea.addEventListener('input', updateHighlighting);
            textarea.addEventListener('scroll', () => {
                highlight.scrollTop = textarea.scrollTop;
                highlight.scrollLeft = textarea.scrollLeft;
            });
            
            // Initial highlighting
            setTimeout(updateHighlighting, 100);
        });
    }
}