export class FormattingToolbar {
    constructor(editor) {
        this.editor = editor;
        this.toolbar = document.getElementById('formatting-toolbar');
        this.currentEditableElement = null;
        this.init();
    }

    init() {
        this.setupClickListener();
        this.setupToolbarControls();
    }

    setupClickListener() {
        // Show toolbar when clicking in editable content
        this.editor.editableArea.addEventListener('click', (e) => {
            const editableElement = e.target.closest('[contenteditable="true"]');
            if (editableElement) {
                this.currentEditableElement = editableElement;
                this.showToolbar(editableElement);
                this.updateToolbarState();
            }
        });

        // Hide toolbar when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.formatting-toolbar') && !e.target.closest('[contenteditable="true"]')) {
                this.hideToolbar();
            }
        });
    }

    setupToolbarControls() {
        // Setup buttons
        this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const command = button.dataset.command;
                this.executeCommand(command);
            });
        });

        // Setup format selector (H1, H2, etc.)
        const formatSelect = document.getElementById('format-select');
        formatSelect.addEventListener('change', (e) => {
            this.formatBlock(e.target.value);
            this.updateToolbarState();
        });

        // Setup font family
        const fontFamily = document.getElementById('font-family');
        fontFamily.addEventListener('change', (e) => {
            document.execCommand('fontName', false, e.target.value);
            this.editor.stateHistory.saveState();
        });

        // Setup font size
        const fontSize = document.getElementById('font-size');
        fontSize.addEventListener('change', (e) => {
            document.execCommand('fontSize', false, '7'); // Use size 7 then override with CSS
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = range.commonAncestorContainer.parentNode;
                if (span && span.tagName === 'FONT') {
                    span.style.fontSize = e.target.value;
                }
            }
            this.editor.stateHistory.saveState();
        });

        // Setup text color
        const textColor = document.getElementById('text-color');
        textColor.addEventListener('change', (e) => {
            if (this.currentEditableElement) {
                // Try execCommand first for compatibility
                try {
                    document.execCommand('foreColor', false, e.target.value);
                } catch (err) {
                    // Fallback to direct styling if execCommand fails
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const span = document.createElement('span');
                        span.style.color = e.target.value;
                        try {
                            range.surroundContents(span);
                        } catch (e) {
                            // If surrounding fails, just style the entire element
                            this.currentEditableElement.style.color = e.target.value;
                        }
                    } else {
                        // No selection, style the entire element
                        this.currentEditableElement.style.color = e.target.value;
                    }
                }
                this.editor.stateHistory.saveState();
            }
        });

        // Setup background color  
        const backgroundColor = document.getElementById('background-color');
        backgroundColor.addEventListener('change', (e) => {
            if (this.currentEditableElement) {
                // Try execCommand first for compatibility
                try {
                    document.execCommand('hiliteColor', false, e.target.value);
                } catch (err) {
                    // Fallback to direct styling if execCommand fails
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const span = document.createElement('span');
                        span.style.backgroundColor = e.target.value;
                        try {
                            range.surroundContents(span);
                        } catch (e) {
                            // If surrounding fails, just style the entire element
                            this.currentEditableElement.style.backgroundColor = e.target.value;
                        }
                    } else {
                        // No selection, style the entire element
                        this.currentEditableElement.style.backgroundColor = e.target.value;
                    }
                }
                this.editor.stateHistory.saveState();
            }
        });
    }

    executeCommand(command) {
        if (command === 'createLink') {
            const url = prompt('Enter URL:');
            if (url) {
                document.execCommand(command, false, url);
            }
        } else {
            document.execCommand(command, false, null);
        }
        
        this.updateToolbarState();
        this.editor.stateHistory.saveState();
    }

    formatBlock(tag) {
        if (tag === 'p') {
            document.execCommand('formatBlock', false, '<p>');
        } else if (tag.startsWith('h')) {
            document.execCommand('formatBlock', false, `<${tag}>`);
        } else if (tag === 'blockquote') {
            document.execCommand('formatBlock', false, '<blockquote>');
        }
        this.editor.stateHistory.saveState();
    }

    updateToolbarState() {
        // Update button states based on current selection
        this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
            const command = button.dataset.command;
            const isActive = document.queryCommandState(command);
            button.classList.toggle('active', isActive);
        });

        // Update format select
        const formatSelect = document.getElementById('format-select');
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const element = selection.anchorNode.nodeType === Node.TEXT_NODE 
                ? selection.anchorNode.parentNode 
                : selection.anchorNode;
            const blockElement = element.closest('h1, h2, h3, h4, h5, h6, p, blockquote');
            if (blockElement) {
                formatSelect.value = blockElement.tagName.toLowerCase();
            }
        }
    }

    showToolbar(element) {
        const rect = element.getBoundingClientRect();
        this.toolbar.style.display = 'flex';
        
        // Position toolbar above the element, but keep it within viewport
        let top = rect.top - this.toolbar.offsetHeight - 10;
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        let left = rect.left;
        const toolbarWidth = this.toolbar.offsetWidth || 400; // Estimate if not yet rendered
        if (left + toolbarWidth > window.innerWidth - 20) {
            left = window.innerWidth - toolbarWidth - 20;
        }
        
        this.toolbar.style.left = Math.max(10, left) + 'px';
        this.toolbar.style.top = top + 'px';
    }

    hideToolbar() {
        this.toolbar.style.display = 'none';
        this.currentEditableElement = null;
    }
}