export class FormattingToolbar {
    constructor(editor) {
        this.editor = editor;
        this.toolbar = document.getElementById('formatting-toolbar');
        this.alignmentToolbar = document.getElementById('image-alignment-toolbar');
        this.currentEditableElement = null;
        this.savedRange = null;
        this.selectedImageContainer = null;
        this.init();
    }

    init() {
        this.setupClickListener();
        this.setupToolbarControls();
        this.setupAlignmentToolbar();
    }

    setupClickListener() {
        // Debug body classes that might be interfering
        
        // Add debug function
        window.debugTextSelection = () => {
            
            // Check editable elements
            const editableElements = document.querySelectorAll('[contenteditable="true"]');
            
            editableElements.forEach((el, index) => {
                // Check element styles for debugging if needed
            });
            
            // Check if body has any problematic styles
            if (document.body.classList.contains('column-resizing')) {
                document.body.classList.remove('column-resizing');
            }
        };
        
        // Add function to test clicks
        window.testTextClick = () => {
            const editableElements = document.querySelectorAll('[contenteditable="true"]');
            if (editableElements.length > 0) {
                const firstEl = editableElements[0];
                firstEl.focus();
                
                // Try to place cursor at the end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(firstEl);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };
        
        // Add click debugging
        window.debugClicks = () => {
            
            // Debug focus events
            document.addEventListener('focus', (e) => {
                if (e.target && e.target.closest && e.target.closest('[contenteditable="true"]')) {
                }
            }, true);
            
            // Debug blur events  
            document.addEventListener('blur', (e) => {
                if (e.target && e.target.closest && e.target.closest('[contenteditable="true"]')) {
                }
            }, true);
            
            document.addEventListener('click', (e) => {
                if (e.target.closest('[contenteditable="true"]')) {
                    
                    // Check selection immediately and after delay
                    const immediateSelection = window.getSelection();
                    if (immediateSelection.rangeCount > 0) {
                        const immediateRange = immediateSelection.getRangeAt(0);
                    }
                    
                    // Check multiple times to see when the cursor gets reset
                    setTimeout(() => {
                        const selection1 = window.getSelection();
                        if (selection1.rangeCount > 0) {
                        }
                    }, 1);
                    
                    setTimeout(() => {
                        const selection5 = window.getSelection();
                        if (selection5.rangeCount > 0) {
                        }
                    }, 5);
                    
                    setTimeout(() => {
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                        }
                    }, 10);
                    
                }
            }, true); // Use capture phase to see events before they're potentially blocked
        };
        
        // Add function to manually test cursor positioning
        window.testManualCursor = (position = 10) => {
            
            const editableElement = document.querySelector('[contenteditable="true"]');
            if (!editableElement) {
                return;
            }
            
            
            const textNode = editableElement.firstChild;
            
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const range = document.createRange();
                const selection = window.getSelection();
                
                try {
                    range.setStart(textNode, Math.min(position, textNode.length));
                    range.setEnd(textNode, Math.min(position, textNode.length));
                    
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    
                    // Check if it worked
                    setTimeout(() => {
                        const newSelection = window.getSelection();
                        if (newSelection.rangeCount > 0) {
                            const newRange = newSelection.getRangeAt(0);
                        }
                    }, 10);
                } catch (error) {
                }
            }
        };
        
        // Test if the editable element is actually working
        window.testEditableElement = () => {
            const editableElement = document.querySelector('[contenteditable="true"]');
            
            // Check parent elements for draggable
            let parent = editableElement?.parentElement;
            while (parent) {
                if (parent.draggable) {
                }
                parent = parent.parentElement;
            }
            
            if (editableElement) {
                const styles = window.getComputedStyle(editableElement);
            }
        };
        
        // Test Firefox cursor and structure
        window.testFirefoxStructure = () => {
            
            const editableElement = document.querySelector('[contenteditable="true"]');
            if (!editableElement) return;
            
            
            let current = editableElement;
            let level = 0;
            while (current && level < 5) {
                // Debug element properties if needed
                current = current.parentElement;
                level++;
            }
        };
        
        // Test creating a simple contenteditable element
        window.testSimpleEditable = () => {
            
            // Create a simple test element
            const testDiv = document.createElement('div');
            testDiv.contentEditable = true;
            testDiv.style.cssText = 'border: 2px solid red; padding: 10px; margin: 10px; background: yellow;';
            testDiv.textContent = 'Test editable text - click to position cursor';
            
            // Add it to the page
            document.body.appendChild(testDiv);
            
            
            window.removeTestElement = () => {
                testDiv.remove();
            };
        };
        
        // Complete Firefox fix for nested draggable elements
        window.fixFirefoxDraggable = () => {
            
            const editableElement = document.querySelector('[contenteditable="true"]');
            if (!editableElement) return;
            
            // Find ALL draggable ancestors
            const draggableAncestors = [];
            let current = editableElement.parentElement;
            while (current) {
                if (current.draggable) {
                    draggableAncestors.push({
                        element: current,
                        originalDraggable: current.draggable,
                        originalCursor: current.style.cursor
                    });
                }
                current = current.parentElement;
            }
            
            
            // Disable all draggable ancestors
            draggableAncestors.forEach((ancestor, index) => {
                ancestor.element.draggable = false;
                ancestor.element.style.cursor = 'default';
            });
            
            // Apply Firefox-specific CSS
            editableElement.style.cursor = 'text';
            editableElement.style.userSelect = 'text';
            editableElement.style.mozUserSelect = 'text';
            
            // Reset contenteditable to refresh Firefox's handling
            editableElement.contentEditable = false;
            setTimeout(() => {
                editableElement.contentEditable = true;
            }, 50);
            
            // Store restore function
            window.restoreAllDraggable = () => {
                draggableAncestors.forEach(ancestor => {
                    ancestor.element.draggable = ancestor.originalDraggable;
                    ancestor.element.style.cursor = ancestor.originalCursor;
                });
                editableElement.style.cursor = '';
                editableElement.style.userSelect = '';
                editableElement.style.mozUserSelect = '';
            };
        };
        
        // Auto-apply Firefox fix if needed
        this.applyFirefoxFix();
        
        // Wrap existing images with resize containers
        this.wrapExistingImages();
        
        // Show toolbar when clicking in editable content
        if (this.editor && this.editor.editableArea) {
            this.editor.editableArea.addEventListener('click', (e) => {
                const editableElement = e.target.closest('[contenteditable="true"]');
                if (editableElement) {
                    this.currentEditableElement = editableElement;
                    this.showToolbar(editableElement);
                    this.updateToolbarState();
                }
            });
        }

        // Hide toolbar when clicking outside
        document.addEventListener('click', (e) => {
            // Don't hide if clicking on the toolbar itself or its contents
            if (this.toolbar && (this.toolbar.contains(e.target) || e.target === this.toolbar)) {
                return;
            }
            // Don't hide if clicking in editable content
            if (e.target.closest('[contenteditable="true"]')) {
                return;
            }
            // Hide toolbar for all other clicks
            this.hideToolbar();
            
            // Deselect images when clicking outside of them
            if (!e.target.closest('.image-resize-container') && !e.target.closest('.image-alignment-toolbar')) {
                this.deselectAllImages();
            }
        });
        
        // Update saved range when selection changes in editable content
        document.addEventListener('selectionchange', () => {
            if (this.currentEditableElement && this.toolbar.style.display === 'flex') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    // Only update if the selection is within our current editable element
                    const container = range.commonAncestorContainer;
                    const editableParent = container.nodeType === Node.TEXT_NODE 
                        ? container.parentElement 
                        : container;
                    
                    if (editableParent && 
                        (editableParent === this.currentEditableElement || 
                         editableParent.closest('[contenteditable="true"]') === this.currentEditableElement)) {
                        this.savedRange = range.cloneRange();
                    }
                }
            }
        });
    }

    setupToolbarControls() {
        // Setup buttons
        if (!this.toolbar) {
            console.warn('Formatting toolbar element not found');
            return;
        }
        this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
            button.addEventListener('mousedown', (e) => {
                // Only prevent default on the button itself, not child elements
                if (e.target === button || button.contains(e.target)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const command = button.dataset.command;
                this.executeCommand(command);
            });
        });

        // Setup format selector (H1, H2, etc.)
        const formatSelect = document.getElementById('format-select');
        formatSelect.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        formatSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            this.formatBlock(e.target.value);
            this.updateToolbarState();
        });

        // Setup font family
        const fontFamily = document.getElementById('font-family');
        fontFamily.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        fontFamily.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.target && e.target.value) {
                try {
                    document.execCommand('fontName', false, e.target.value);
                } catch (error) {
                    console.warn('Font change failed:', error.message);
                }
            } else {
                try {
                    document.execCommand('fontName', false, '');
                } catch (error) {
                    console.warn('Font change failed:', error.message);
                }
            }
            if (this.editor && this.editor.stateHistory) {
                this.editor.stateHistory.saveState();
            }
        });

        // Setup font size
        const fontSize = document.getElementById('font-size');
        fontSize.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        fontSize.addEventListener('change', (e) => {
            e.stopPropagation();
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
        textColor.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        textColor.addEventListener('change', (e) => {
            e.stopPropagation();
            if (this.currentEditableElement && e.target && e.target.value) {
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
                        } catch (err) {
                            // If surrounding fails, just style the entire element
                            if (this.currentEditableElement && e.target && e.target.value) {
                                this.currentEditableElement.style.color = e.target.value;
                            }
                        }
                    } else {
                        // No selection, style the entire element
                        if (this.currentEditableElement && e.target && e.target.value) {
                            this.currentEditableElement.style.color = e.target.value;
                        }
                    }
                }
                this.editor.stateHistory.saveState();
            }
        });

        // Setup background color  
        const backgroundColor = document.getElementById('background-color');
        backgroundColor.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        backgroundColor.addEventListener('change', (e) => {
            e.stopPropagation();
            if (this.currentEditableElement && e.target && e.target.value) {
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
                        } catch (err) {
                            // If surrounding fails, just style the entire element
                            if (this.currentEditableElement && e.target && e.target.value) {
                                this.currentEditableElement.style.backgroundColor = e.target.value;
                            }
                        }
                    } else {
                        // No selection, style the entire element
                        if (this.currentEditableElement && e.target && e.target.value) {
                            this.currentEditableElement.style.backgroundColor = e.target.value;
                        }
                    }
                }
                this.editor.stateHistory.saveState();
            }
        });
    }

    executeCommand(command) {
        if (command === 'createLink') {
            // Check if the current selection is within an existing link
            const existingLink = this.getSelectedLink();
            
            // Save current selection before showing modal
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                this.savedRange = selection.getRangeAt(0).cloneRange();
            }
            
            // Show the link settings modal with saved range
            if (this.editor && this.editor.linkSettingsModal) {
                this.editor.linkSettingsModal.show(existingLink, this.savedRange, this, this.currentEditableElement);
            } else {
                console.warn('Link settings modal not available');
            }
        } else if (command === 'insertImage') {
            this.insertImage();
        } else {
            try {
                document.execCommand(command, false, null);
            } catch (error) {
                console.warn('Command execution failed:', error.message);
            }
        }
        
        this.updateToolbarState();
        this.editor.stateHistory.saveState();
    }
    
    insertImage() {
        
        // Capture context to avoid losing 'this' in callbacks
        const savedRange = this.savedRange;
        const currentEditableElement = this.currentEditableElement;
        const editor = this.editor;
        
        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && this.validateImageFile(file)) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    
                    // Create image element wrapped in resize container
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '10px 0';
                    
                    // Use ImageUploader's createImageResizeContainer if available, otherwise fall back to local method
                    const resizeContainer = editor.imageUploader ? 
                        editor.imageUploader.createImageResizeContainer(img) : 
                        this.createImageResizeContainer(img);
                    
                    if (savedRange && currentEditableElement) {
                        try {
                            // Focus the editable element first
                            currentEditableElement.focus();
                            
                            // Restore the saved selection
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(savedRange);
                            
                            // Insert image container at the cursor position
                            savedRange.deleteContents();
                            savedRange.insertNode(resizeContainer);
                            
                            // Move cursor after the image container
                            savedRange.setStartAfter(resizeContainer);
                            savedRange.setEndAfter(resizeContainer);
                            selection.removeAllRanges();
                            selection.addRange(savedRange);
                            
                        } catch (error) {
                            currentEditableElement.appendChild(resizeContainer);
                        }
                    } else if (currentEditableElement) {
                        // No saved range, append to the current editable element
                        currentEditableElement.appendChild(resizeContainer);
                    } else {
                        return;
                    }
                    
                    // Save state
                    if (editor && editor.stateHistory) {
                        editor.stateHistory.saveState();
                    }
                };
                reader.readAsDataURL(file);
            }
            // Clean up
            input.remove();
        };
        
        // Trigger file selection dialog
        document.body.appendChild(input);
        input.click();
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
        if (!this.toolbar) {
            return;
        }
        this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
            const command = button.dataset.command;
            // Skip custom commands that don't have queryCommandState
            if (command === 'insertImage') {
                return;
            }
            const isActive = document.queryCommandState(command);
            button.classList.toggle('active', isActive);
        });

        // Update format select
        const formatSelect = document.getElementById('format-select');
        if (!formatSelect) {
            return;
        }
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && selection.anchorNode) {
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
        if (!this.toolbar) {
            return;
        }
        
        // Save current selection when showing toolbar
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && typeof selection.getRangeAt === 'function') {
            this.savedRange = selection.getRangeAt(0).cloneRange();
        }
        
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
        if (this.toolbar) {
            this.toolbar.style.display = 'none';
        }
        this.currentEditableElement = null;
        this.savedRange = null;
    }
    
    applyFirefoxFix() {
        // Detect Firefox
        const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        
        if (!isFirefox) {
            return;
        }
        
        
        // Apply fix to existing editable elements
        this.fixFirefoxEditableElements();
        
        // Watch for new editable elements added dynamically
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node or its descendants have contenteditable
                        const editableElements = node.querySelectorAll ? 
                            node.querySelectorAll('[contenteditable="true"]') : [];
                        
                        if (node.contentEditable === 'true') {
                            this.fixSingleFirefoxElement(node);
                        }
                        
                        editableElements.forEach(el => this.fixSingleFirefoxElement(el));
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    fixFirefoxEditableElements() {
        const editableElements = document.querySelectorAll('[contenteditable="true"]');
        editableElements.forEach(el => this.fixSingleFirefoxElement(el));
    }
    
    fixSingleFirefoxElement(editableElement) {
        if (!editableElement || editableElement.dataset.firefoxFixed) return;
        
        // Mark as fixed to avoid duplicate processing
        editableElement.dataset.firefoxFixed = 'true';
        
        // Apply CSS fixes
        editableElement.style.cursor = 'text';
        editableElement.style.userSelect = 'text';
        editableElement.style.mozUserSelect = 'text';
        
        // Handle draggable ancestors with mouse events
        this.addFirefoxDragHandling(editableElement);
    }
    
    addFirefoxDragHandling(editableElement) {
        // Find draggable ancestors
        const draggableAncestors = [];
        let current = editableElement.parentElement;
        while (current) {
            if (current.draggable) {
                draggableAncestors.push(current);
            }
            current = current.parentElement;
        }
        
        if (draggableAncestors.length === 0) return;
        
        // Add mouse event handlers to temporarily disable dragging during text editing
        editableElement.addEventListener('mouseenter', () => {
            draggableAncestors.forEach(ancestor => {
                ancestor.draggable = false;
            });
        });
        
        editableElement.addEventListener('mouseleave', () => {
            draggableAncestors.forEach(ancestor => {
                ancestor.draggable = true;
            });
        });
        
        // Also disable during focus
        editableElement.addEventListener('focus', () => {
            draggableAncestors.forEach(ancestor => {
                ancestor.draggable = false;
            });
        });
        
        editableElement.addEventListener('blur', () => {
            // Small delay to allow for potential re-focus
            setTimeout(() => {
                if (document.activeElement !== editableElement) {
                    draggableAncestors.forEach(ancestor => {
                        ancestor.draggable = true;
                    });
                }
            }, 100);
        });
        
    }
    
    createImageResizeContainer(img) {
        // Create container
        const container = document.createElement('div');
        container.className = 'image-resize-container align-center'; // Default to center alignment
        container.appendChild(img);
        
        // Create resize handles
        const handlePositions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
        handlePositions.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `image-resize-handle ${position}`;
            handle.dataset.position = position;
            container.appendChild(handle);
        });

        // Create browse icon (only visible when selected)
        const browseIcon = document.createElement('div');
        browseIcon.className = 'image-browse-icon';
        browseIcon.innerHTML = '📁';
        browseIcon.title = 'Browse for image';
        browseIcon.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #ddd;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 16px;
            z-index: 1000;
            transition: all 0.2s ease;
        `;
        
        // Add hover effect
        browseIcon.addEventListener('mouseenter', () => {
            browseIcon.style.background = 'rgba(255, 255, 255, 1)';
            browseIcon.style.transform = 'scale(1.1)';
        });
        
        browseIcon.addEventListener('mouseleave', () => {
            browseIcon.style.background = 'rgba(255, 255, 255, 0.9)';
            browseIcon.style.transform = 'scale(1)';
        });

        // Add click handler for browsing
        browseIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.browseForImage(container);
        });
        
        container.appendChild(browseIcon);
        
        // Add click handler to select/deselect image
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectImage(container);
        });
        
        // Add resize handlers
        this.addResizeHandlers(container);
        
        return container;
    }
    
    selectImage(container) {
        // Deselect all other images and hide their browse icons
        document.querySelectorAll('.image-resize-container.selected').forEach(el => {
            if (el !== container) {
                el.classList.remove('selected');
                const browseIcon = el.querySelector('.image-browse-icon');
                if (browseIcon) {
                    browseIcon.style.display = 'none';
                }
            }
        });
        
        // Toggle selection of this image
        const wasSelected = container.classList.contains('selected');
        container.classList.toggle('selected');
        
        const browseIcon = container.querySelector('.image-browse-icon');
        if (container.classList.contains('selected')) {
            this.selectedImageContainer = container;
            this.showAlignmentToolbar(container);
            // Show browse icon
            if (browseIcon) {
                browseIcon.style.display = 'flex';
            }
        } else {
            this.selectedImageContainer = null;
            this.hideAlignmentToolbar();
            // Hide browse icon
            if (browseIcon) {
                browseIcon.style.display = 'none';
            }
        }
    }
    
    browseForImage(container) {
        // Create a hidden file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && this.validateImageFile(file)) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = container.querySelector('img');
                    if (img) {
                        img.src = event.target.result;
                        
                        // Save state after image change
                        if (this.editor && this.editor.stateHistory) {
                            this.editor.stateHistory.saveState();
                        }
                    }
                };
                reader.readAsDataURL(file);
            }
            // Clean up
            input.remove();
        };
        
        // Trigger file selection dialog
        document.body.appendChild(input);
        input.click();
    }
    
    addResizeHandlers(container) {
        const handles = container.querySelectorAll('.image-resize-handle');
        const img = container.querySelector('img');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const position = handle.dataset.position;
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = img.offsetWidth;
                const startHeight = img.offsetHeight;
                const aspectRatio = startWidth / startHeight;
                
                // Add resizing class to body to prevent text selection
                document.body.classList.add('image-resizing');
                
                const mouseMoveHandler = (e) => {
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;
                    
                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    
                    // Calculate new dimensions based on handle position
                    if (position.includes('e')) {
                        newWidth = startWidth + deltaX;
                    } else if (position.includes('w')) {
                        newWidth = startWidth - deltaX;
                    }
                    
                    if (position.includes('s')) {
                        newHeight = startHeight + deltaY;
                    } else if (position.includes('n')) {
                        newHeight = startHeight - deltaY;
                    }
                    
                    // Maintain aspect ratio for corner handles
                    if (position.length === 2) { // Corner handles (nw, ne, sw, se)
                        if (position.includes('e') || position.includes('w')) {
                            newHeight = newWidth / aspectRatio;
                        } else {
                            newWidth = newHeight * aspectRatio;
                        }
                    }
                    
                    // Set minimum size
                    const minSize = 50;
                    newWidth = Math.max(minSize, newWidth);
                    newHeight = Math.max(minSize, newHeight);
                    
                    // Apply new dimensions
                    img.style.width = newWidth + 'px';
                    img.style.height = newHeight + 'px';
                };
                
                const mouseUpHandler = () => {
                    document.body.classList.remove('image-resizing');
                    document.removeEventListener('mousemove', mouseMoveHandler);
                    document.removeEventListener('mouseup', mouseUpHandler);
                    
                    // Save state after resize
                    if (this.editor && this.editor.stateHistory) {
                        this.editor.stateHistory.saveState();
                    }
                };
                
                document.addEventListener('mousemove', mouseMoveHandler);
                document.addEventListener('mouseup', mouseUpHandler);
            });
        });
    }
    
    wrapExistingImages() {
        // Check if editor and editableArea exist
        if (!this.editor || !this.editor.editableArea) {
            return;
        }
        
        // Find all images that are not already in resize containers
        const existingImages = this.editor.editableArea.querySelectorAll('img:not(.image-resize-container img)');
        
        existingImages.forEach(img => {
            // Skip if image is already in a resize container
            if (img.closest('.image-resize-container')) return;
            
            // Create resize container using ImageUploader if available
            const container = this.editor.imageUploader ? 
                this.editor.imageUploader.createImageResizeContainer(img.cloneNode(true)) : 
                this.createImageResizeContainer(img.cloneNode(true));
            
            // Ensure existing images get default center alignment if they don't have any
            if (!container.classList.contains('align-left') && 
                !container.classList.contains('align-right') && 
                !container.classList.contains('align-center')) {
                container.classList.add('align-center');
            }
            
            // Replace the original image with the container
            img.parentNode.replaceChild(container, img);
        });
        
        if (existingImages.length > 0) {
        }
    }
    
    setupAlignmentToolbar() {
        // Setup alignment button handlers
        this.alignmentToolbar.querySelectorAll('button[data-align]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const alignment = button.dataset.align;
                this.alignSelectedImage(alignment);
            });
        });
    }
    
    showAlignmentToolbar(container) {
        const rect = container.getBoundingClientRect();
        this.alignmentToolbar.classList.add('visible');
        
        // Position toolbar above the image, but keep it within viewport
        let top = rect.top - this.alignmentToolbar.offsetHeight - 10;
        if (top < 10) {
            top = rect.bottom + 10;
        }
        
        let left = rect.left + (rect.width / 2) - (this.alignmentToolbar.offsetWidth / 2);
        const toolbarWidth = this.alignmentToolbar.offsetWidth || 100;
        if (left + toolbarWidth > window.innerWidth - 20) {
            left = window.innerWidth - toolbarWidth - 20;
        }
        if (left < 10) {
            left = 10;
        }
        
        this.alignmentToolbar.style.left = left + 'px';
        this.alignmentToolbar.style.top = top + 'px';
        
        // Update button states
        this.updateAlignmentToolbarState(container);
    }
    
    hideAlignmentToolbar() {
        this.alignmentToolbar.classList.remove('visible');
    }
    
    updateAlignmentToolbarState(container) {
        // Remove active state from all buttons
        this.alignmentToolbar.querySelectorAll('button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Determine current alignment
        let currentAlignment = 'center'; // default
        if (container.classList.contains('align-left')) {
            currentAlignment = 'left';
        } else if (container.classList.contains('align-right')) {
            currentAlignment = 'right';
        }
        
        // Set active state on current alignment button
        const activeButton = this.alignmentToolbar.querySelector(`button[data-align="${currentAlignment}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    alignSelectedImage(alignment) {
        if (!this.selectedImageContainer) return;
        
        // Remove all alignment classes
        this.selectedImageContainer.classList.remove('align-left', 'align-center', 'align-right');
        
        // Add new alignment class
        this.selectedImageContainer.classList.add(`align-${alignment}`);
        
        // Update toolbar state
        this.updateAlignmentToolbarState(this.selectedImageContainer);
        
        // Save state
        if (this.editor && this.editor.stateHistory) {
            this.editor.stateHistory.saveState();
        }
    }
    
    deselectAllImages() {
        document.querySelectorAll('.image-resize-container.selected').forEach(container => {
            container.classList.remove('selected');
        });
        this.selectedImageContainer = null;
        this.hideAlignmentToolbar();
    }
    
    validateImageFile(file) {
        // Check file object exists
        if (!file) {
            return false;
        }
        
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            console.warn('Image file too large. Maximum size is 10MB.');
            return false;
        }
        
        // Check MIME type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type.toLowerCase())) {
            console.warn('Invalid image file type. Allowed: JPEG, PNG, GIF, WebP, SVG.');
            return false;
        }
        
        // Check file extension as additional validation
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const fileName = file.name.toLowerCase();
        const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
        
        if (!hasValidExtension) {
            console.warn('Invalid file extension. Allowed: .jpg, .jpeg, .png, .gif, .webp, .svg');
            return false;
        }
        
        return true;
    }
    
    sanitizeURL(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        
        // Trim and normalize
        url = url.trim();
        if (!url) {
            return null;
        }
        
        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
        const lowerUrl = url.toLowerCase();
        
        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return null;
            }
        }
        
        // Allow safe protocols (including relative URLs and anchors)
        const allowedPattern = /^(https?:\/\/|mailto:|tel:|\/\/|\/|#)/i;
        
        if (allowedPattern.test(url)) {
            return url;
        }
        
        // Auto-add https:// for domain-like strings (more permissive)
        // Matches: domain.com, subdomain.domain.com, localhost:3000, IP addresses, etc.
        if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:[0-9]+)?(\/.*)?\/?$/.test(url)) {
            return 'https://' + url;
        }
        
        // If nothing matches, still allow it but warn (better than breaking functionality)
        console.warn('URL format not recognized, allowing but recommend using full URLs:', url);
        return url;
    }
    
    getSelectedLink() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            return null;
        }
        
        try {
            // Check if the selection is within a link element
            const range = selection.getRangeAt(0);
            let element = range.commonAncestorContainer;
            
            // Ensure element exists
            if (!element) {
                return null;
            }
            
            // If it's a text node, get its parent
            if (element.nodeType === Node.TEXT_NODE) {
                element = element.parentNode;
            }
            
            // Ensure element still exists and has closest method
            if (!element || !element.closest) {
                return null;
            }
            
            // Check if the element itself is a link or find the closest link ancestor
            return element.closest('a[href]');
        } catch (error) {
            console.warn('Error finding selected link:', error.message);
            return null;
        }
    }
}