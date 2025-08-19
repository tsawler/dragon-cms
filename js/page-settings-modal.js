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

    switchTab(tabName) {
        // Remove active from all tabs and panels
        this.modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        this.modal.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

        // Activate selected tab and panel
        this.modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        this.modal.querySelector(`#${tabName}-tab`).classList.add('active');
    }

    show() {
        this.loadPageData();
        
        // Force a reflow before showing modal for Edge compatibility
        this.modal.offsetHeight;
        this.modal.classList.add('active');
        
        // Additional Edge compatibility - force redraw
        const isEdge = window.navigator.userAgent.indexOf('Edge') > -1 || 
                      window.navigator.userAgent.indexOf('Edg') > -1 ||
                      window.navigator.userAgent.indexOf('EdgeHTML') > -1;
        
        if (isEdge) {
            this.modal.style.display = 'block';
            this.modal.style.setProperty('display', 'block', 'important');
            // Force another reflow
            this.modal.offsetHeight;
        }
        
        // Ultimate fallback - set display to block regardless of browser
        setTimeout(() => {
            if (window.getComputedStyle(this.modal).display === 'none') {
                this.modal.style.setProperty('display', 'block', 'important');
            }
            
            // Force positioning for Edge
            this.modal.style.setProperty('position', 'fixed', 'important');
            this.modal.style.setProperty('top', '0', 'important');
            this.modal.style.setProperty('left', '0', 'important');
            this.modal.style.setProperty('width', '100%', 'important');
            this.modal.style.setProperty('height', '100%', 'important');
            this.modal.style.setProperty('z-index', '999999', 'important');
            
            // Force modal content positioning
            const modalContent = this.modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.setProperty('position', 'absolute', 'important');
                modalContent.style.setProperty('top', '50%', 'important');
                modalContent.style.setProperty('left', '50%', 'important');
                modalContent.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                modalContent.style.setProperty('z-index', '1000000', 'important');
            }
        }, 10);
        
        // Focus the first input
        setTimeout(() => {
            const firstInput = this.modal.querySelector('input[type="text"]');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    hide() {
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

        // Populate form fields
        document.getElementById('page-name').value = this.pageData.pageName || '';
        document.getElementById('page-title').value = this.pageData.pageTitle || '';
        document.getElementById('page-css').value = this.pageData.customCSS || '';
        document.getElementById('page-javascript').value = this.pageData.customJavaScript || '';

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
}