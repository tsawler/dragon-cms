import { StateHistory } from './state-history.js';
import { FormattingToolbar } from './formatting-toolbar.js';
import { ImageUploader } from './image-uploader.js';
import { VideoSettingsModal } from './video-settings-modal.js';
import { StyleEditorModal, CodeEditorModal, ColumnSettingsModal, ConfirmationModal, LinkSettingsModal, SectionSettingsModal } from './modals.js';
import { SnippetPanel } from './snippet-panel.js';
import { ColumnResizer } from './column-resizer.js';
import { PageSettingsModal } from './page-settings-modal.js';
import { ModalDragger } from './modal-dragger.js';
import { ButtonSettingsModal } from './button-settings-modal.js';
import { EventHandlerRegistry } from './event-handlers.js';
import { DropZoneManager } from './drop-zone-manager.js';

export class Editor {
    constructor(options = {}) {
        this.options = options;
        this.publishUrl = options.publishUrl || null;
        this.loadUrl = options.loadUrl || null;
        this.initialContent = options.initialContent || null;
        this.showCodeIcon = options.showCodeIcon !== false; // Default to true
        this.assetsPath = options.assetsPath || 'assets/'; // Default assets path
        this.onChange = options.onChange || null; // Callback when content changes
        this.onRender = options.onRender || null; // Callback when element is rendered
        this.editableArea = document.getElementById('editable-area');
        this.currentMode = 'edit';
        this.snippetPanel = null;
        this.dragDropManager = null;
        this.stateHistory = null;
        this.formattingToolbar = null;
        this.styleEditorModal = null;
        this.codeEditorModal = null;
        this.imageUploader = null;
        this.videoSettingsModal = null;
        this.confirmationModal = null;
        this.pageSettingsModal = null;
        this.modalDragger = null;
        
        this.init();
    }
    
    // Make assets path available globally for snippets
    setGlobalAssetsPath() {
        window.DragonAssetsPath = this.assetsPath;
    }

    init() {
        // Set the global assets path before initializing snippets
        this.setGlobalAssetsPath();

        // Set initial mode on editor-main
        const editorMain = document.querySelector('.editor-main');
        if (editorMain) {
            editorMain.dataset.mode = this.currentMode;
        }

        this.snippetPanel = new SnippetPanel(this);
        // this.dragDropManager = new DragDropManager(this);
        this.stateHistory = new StateHistory(this);
        this.imageUploader = new ImageUploader(this);
        this.formattingToolbar = new FormattingToolbar(this);
        this.styleEditorModal = new StyleEditorModal(this);
        this.setupPanelToggle();
        this.codeEditorModal = new CodeEditorModal(this);
        this.videoSettingsModal = new VideoSettingsModal(this);
        this.columnSettingsModal = new ColumnSettingsModal(this);
        this.sectionSettingsModal = new SectionSettingsModal(this);
        this.confirmationModal = new ConfirmationModal(this);
        this.columnResizer = new ColumnResizer(this);
        this.pageSettingsModal = new PageSettingsModal(this);
        this.modalDragger = new ModalDragger();
        this.eventHandlerRegistry = new EventHandlerRegistry(this);
        this.dropZoneManager = new DropZoneManager(this);
        this.dropZoneManager.setup();

        this.buttonSettingsModal = new ButtonSettingsModal(this);
        this.linkSettingsModal = new LinkSettingsModal(this);
        
        this.attachEventListeners();
        this.setupMutationObserver();
        this.setupResizing();
        this.setupViewportControls();
        this.makeExistingBlocksEditable();
        if (typeof this.makeExistingSectionsDraggable === 'function') {
            this.makeExistingSectionsDraggable();
        }

        // Ensure all images are resizable - backup conversion
        if (this.imageUploader) {
            setTimeout(() => {
                this.imageUploader.ensureAllImagesResizable();
            }, 100);
        }
        
        // Load initial content if provided
        this.loadInitialContent();
        
        // Set initial contenteditable state based on mode
        if (typeof this.toggleContentEditableElements === 'function') {
            this.toggleContentEditableElements();
        }
    }

    setupPanelToggle() {
        // Panel toggle is now handled by the SnippetPanel class
        // Keep this method for compatibility but make it a no-op
        
        // Close panel when clicking outside (if needed)
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('snippet-panel');
            const iconStrip = document.querySelector('.icon-strip');
            
            if (panel && panel.classList.contains('open') && 
                !panel.contains(e.target) && 
                !iconStrip.contains(e.target)) {
                // Optionally close panel when clicking outside
                // panel.classList.remove('open');
                // document.querySelector('.editor-main').classList.remove('panel-open');
            }
        });
    }

    loadInitialContent() {
        if (!this.initialContent) return;
        
        
        // Set the content
        this.editableArea.innerHTML = this.initialContent;
        
        // Process all blocks to add controls
        const blocks = this.editableArea.querySelectorAll('.editor-block');
        blocks.forEach(block => {
            if (!block.querySelector('.drag-handle')) {
                this.addBlockControls(block);
            }
            this.attachDragHandleListeners(block);
        });
        
        // Process all snippets to add controls
        const snippets = this.editableArea.querySelectorAll('.editor-snippet');
        snippets.forEach(snippet => {
            if (!snippet.querySelector('.drag-handle')) {
                this.addSnippetControls(snippet);
            }
            this.attachDragHandleListeners(snippet);
        });
        
        // Make text elements in blocks editable
        this.makeExistingBlocksEditable();

        // Apply Firefox contenteditable fixes AFTER making elements editable
        if (this.formattingToolbar) {
            this.formattingToolbar.fixFirefoxEditableElements();
        }
        
        // Make existing sections draggable
        if (typeof this.makeExistingSectionsDraggable === 'function') {
            this.makeExistingSectionsDraggable();
        }
        
        // Initialize column resizers for any multi-column blocks
        if (this.columnResizer) {
            setTimeout(() => {
                this.columnResizer.setupResizeDividers();
            }, 100);
        }
        
        // Save initial state to history
        if (this.stateHistory) {
            this.stateHistory.saveState();
        }
        
    }

    addBlockControls(block) {
        // Don't add controls if they already exist
        if (block.querySelector('.drag-handle')) return;
        
        const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
        
        const controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            <button class="settings-icon" title="Column Settings">⚙️</button>
            ${codeIconHtml}
            <button class="delete-icon" title="Delete">🗑️</button>
            <div class="resizer-handle right"></div>
            <div class="resizer-handle bottom"></div>
            <div class="resizer-handle corner"></div>
        `;
        
        // Insert controls at the beginning of the block
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = controls;
        while (controlsDiv.firstChild) {
            block.insertBefore(controlsDiv.firstChild, block.firstChild);
        }
        
        // Add drag handle functionality
        this.attachDragHandleListeners(block);
    }

    addSnippetControls(snippet) {
        // Don't add controls if they already exist
        if (snippet.querySelector('.drag-handle')) return;
        
        const isVideo = snippet.classList.contains('video-snippet');
        const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
        
        let controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            ${codeIconHtml}
            <button class="delete-icon" title="Delete">🗑️</button>
        `;
        
        if (isVideo) {
            controls += '<button class="settings-icon" title="Video Settings">⚙️</button>';
        }
        
        // Insert controls at the beginning of the snippet
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = controls;
        while (controlsDiv.firstChild) {
            snippet.insertBefore(controlsDiv.firstChild, snippet.firstChild);
        }
        
        // Add drag handle functionality
        this.attachDragHandleListeners(snippet);
    }

    attachEventListeners() {
        this.dropZoneManager.setup();

        // Handle header button clicks
        this.attachHeaderListeners();
        
        // Handle all clicks (control icons and content buttons)
        this.eventHandlerRegistry.setupClickDelegation(this.editableArea);

    }

    attachHeaderListeners() {
        // Mode toggle button
        const modeBtn = document.getElementById('toggle-mode-btn');
        if (modeBtn) {
            modeBtn.addEventListener('click', () => this.toggleMode());
        }

        // Undo/Redo buttons
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => this.undo());
        }

        const redoBtn = document.getElementById('redo-btn');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => this.redo());
        }

        // Save/Load buttons
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
        }

        const loadBtn = document.getElementById('load-btn');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.load());
        }

        // Export button
        const exportBtn = document.getElementById('export-html-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportHTML());
        }

        // Publish button (only show if publishUrl is provided)
        const publishBtn = document.getElementById('publish-btn');
        if (publishBtn && this.publishUrl) {
            publishBtn.classList.remove('btn-hidden');
            publishBtn.addEventListener('click', () => this.publishToUrl());
        }

        // Load from URL button (only show if loadUrl is provided)
        const loadFromUrlBtn = document.getElementById('load-from-url-btn');
        if (loadFromUrlBtn && this.loadUrl) {
            loadFromUrlBtn.classList.remove('btn-hidden');
            loadFromUrlBtn.addEventListener('click', () => this.loadFromUrl());
        }
    }

    attachDragHandleListeners(element) {
        // Initialize event handler registry if not already done
        if (!this.eventHandlerRegistry) {
            this.eventHandlerRegistry = new EventHandlerRegistry(this);
        }
        // Delegate to the event handler registry
        this.eventHandlerRegistry.setupDragHandlers(element);
    }

    // Backward compatibility method - now handled by EventHandlerRegistry
    attachClickListeners() {
        // This method is now handled by eventHandlerRegistry.setupClickDelegation
        // which is called in attachEventListeners()
    }

    // Header button methods
    toggleMode() {
        this.currentMode = this.currentMode === 'edit' ? 'display' : 'edit';
        this.editableArea.dataset.mode = this.currentMode;

        // Also set mode on editor-main for CSS fallback
        const editorMain = document.querySelector('.editor-main');
        if (editorMain) {
            editorMain.dataset.mode = this.currentMode;
        }

        const modeBtn = document.getElementById('toggle-mode-btn');
        if (modeBtn) {
            modeBtn.textContent = this.currentMode === 'edit' ? 'Switch to Display Mode' : 'Switch to Edit Mode';
        }
        
        // Hide/show editor header based on mode
        const editorHeader = document.querySelector('.dragon-editor .editor-header');
        if (editorHeader) {
            editorHeader.style.display = this.currentMode === 'edit' ? 'flex' : 'none';
        }
        
        // Hide/show snippet panel based on mode
        const panel = document.getElementById('snippet-panel');
        const handle = document.getElementById('new-panel-handle');
        
        // Hide/show viewport controls based on mode
        const viewportControls = document.querySelector('.viewport-controls');
        
        if (this.currentMode === 'display') {
            // Hide panel and handle in display mode
            if (panel) {
                panel.classList.remove('open');
            }
            // Close panel and reset margins
            document.querySelector('.editor-main').classList.remove('panel-open');
            
            // Hide icon strip in display mode
            const iconStrip = document.querySelector('.icon-strip');
            if (iconStrip) {
                iconStrip.style.display = 'none';
            }
            
            if (handle) {
                handle.style.display = 'none';
            }
            // Hide viewport controls in display mode
            if (viewportControls) {
                viewportControls.style.display = 'none';
            }
            // Remove panel-open class for display mode
            const editorMain = document.querySelector('.editor-main');
            if (editorMain) {
                editorMain.classList.remove('panel-open');
            }

            // Remove any drag/drop styling classes in display mode
            this.editableArea.classList.remove('valid-drop-target');
            document.querySelectorAll('.valid-drop-target').forEach(el => {
                el.classList.remove('valid-drop-target');
            });
        } else {
            // Show icon strip in edit mode
            const iconStrip = document.querySelector('.icon-strip');
            if (iconStrip) {
                iconStrip.style.display = 'flex';
            }
            
            // Show handle in edit mode (panel starts closed)
            if (handle) {
                handle.style.display = 'flex';
                // Reset handle position to left edge since panel should be closed
                handle.style.left = '0px';
            }
            // Show viewport controls in edit mode
            if (viewportControls) {
                viewportControls.style.display = 'flex';
            }
            
            // Panel-open class is managed by panel toggle
            // CSS handles margin based on classes
        }
        
        // Handle contenteditable elements based on mode
        if (typeof this.toggleContentEditableElements === 'function') {
            this.toggleContentEditableElements();
        }
        
        // Dispatch custom event for mode change
        window.dispatchEvent(new CustomEvent('dragonModeChanged', { 
            detail: { mode: this.currentMode } 
        }));
        
        // Refresh column resize dividers when mode changes
        // Temporarily disabled to prevent infinite loops
        // if (this.columnResizer) {
        //     this.columnResizer.refresh();
        // }
        
    }

    toggleContentEditableElements() {
        // Find all contenteditable elements in the editable area
        const editableElements = this.editableArea.querySelectorAll('[contenteditable]');
        
        editableElements.forEach(element => {
            if (this.currentMode === 'edit') {
                // Enable contenteditable in edit mode
                element.contentEditable = 'true';
                // Set cursor based on element type
                if (element.tagName.toLowerCase() === 'button') {
                    element.style.cursor = 'pointer';
                } else {
                    element.style.cursor = 'text';
                }
            } else {
                // Disable contenteditable in display mode
                element.contentEditable = 'false';
                // Set cursor based on element type
                if (element.tagName.toLowerCase() === 'button') {
                    element.style.cursor = 'pointer';
                } else {
                    element.style.cursor = 'default';
                }
                // Remove any focus that might be on the element
                if (document.activeElement === element) {
                    element.blur();
                }
            }
        });
    }
    
    
    getCurrentDragType(e) {
        // Fallback method to determine drag type
        return null;
    }
    
    // Proxy method for backward compatibility - delegates to DropZoneManager
    clearVisualIndicators() {
        if (this.dropZoneManager) {
            return this.dropZoneManager.clearVisualIndicators();
        }
        // Fallback to original implementation
        return this.clearVisualIndicators_DEPRECATED();
    }

    clearVisualIndicators_DEPRECATED() {
        const area = this.editableArea;
        
        // Remove all visual indicators
        area.querySelectorAll('.valid-drop-target').forEach(el => el.classList.remove('valid-drop-target'));
        area.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        area.querySelectorAll('.drop-insertion-line').forEach(el => el.remove());
        area.querySelectorAll('.drop-zone-overlay').forEach(el => el.remove());
        area.querySelectorAll('.drop-indicator').forEach(el => el.remove()); // Also clean up test indicators
        
        // Reset main area styling
        area.style.background = '';
        area.style.borderColor = '';
        area.style.position = '';
        
        // Don't clear currentTargetBlock here - it's needed for drop event
    }
    
    // Proxy method for backward compatibility - delegates to DropZoneManager
    getSnippetInsertionPointWithPosition(block, y) {
        if (this.dropZoneManager) {
            return this.dropZoneManager.getSnippetInsertionPointWithPosition(block, y);
        }
        // Fallback to original implementation
        return this.getSnippetInsertionPointWithPosition_DEPRECATED(block, y);
    }

    getSnippetInsertionPointWithPosition_DEPRECATED(block, y) {
        const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
        const blockRect = block.getBoundingClientRect();
        
        if (snippets.length === 0) {
            return null; // No insertion point needed for empty block
        }
        
        // Account for block scroll position if it has one
        const scrollTop = block.scrollTop || 0;
        
        for (let i = 0; i < snippets.length; i++) {
            const rect = snippets[i].getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;
            
            if (y < midPoint) {
                return { 
                    y: rect.top - blockRect.top + scrollTop - 5, 
                    container: block 
                };
            }
        }
        
        // Insert at the end
        const lastSnippet = snippets[snippets.length - 1];
        const lastRect = lastSnippet.getBoundingClientRect();
        return { 
            y: lastRect.bottom - blockRect.top + scrollTop + 5, 
            container: block 
        };
    }
    
    // Proxy method for backward compatibility - delegates to DropZoneManager
    getInsertionPoint(container, y) {
        if (this.dropZoneManager) {
            return this.dropZoneManager.getInsertionPoint(container, y);
        }
        // Fallback to original implementation
        return this.getInsertionPoint_DEPRECATED(container, y);
    }

    getInsertionPoint_DEPRECATED(container, y) {
        const elements = [...container.querySelectorAll(':scope > .editor-block:not(.dragging-element), :scope > .editor-section:not(.dragging-element)')];
        const containerRect = container.getBoundingClientRect();
        
        if (elements.length === 0) {
            return null; // No insertion point needed for empty area
        }
        
        // Account for container scroll position
        const scrollTop = container.scrollTop;
        
        for (let i = 0; i < elements.length; i++) {
            const rect = elements[i].getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;
            
            if (y < midPoint) {
                return { 
                    y: rect.top - containerRect.top + scrollTop - 5, 
                    container 
                };
            }
        }
        
        // Insert at the end
        const lastElement = elements[elements.length - 1];
        const lastRect = lastElement.getBoundingClientRect();
        return { 
            y: lastRect.bottom - containerRect.top + scrollTop + 5, 
            container 
        };
    }
    
    // Proxy method for backward compatibility - delegates to DropZoneManager
    createInsertionLine(insertionPoint) {
        if (this.dropZoneManager) {
            return this.dropZoneManager.createInsertionLine(insertionPoint);
        }
        // Fallback to original implementation
        return this.createInsertionLine_DEPRECATED(insertionPoint);
    }

    createInsertionLine_DEPRECATED(insertionPoint) {
        const line = document.createElement('div');
        line.className = 'drop-insertion-line';
        line.style.position = 'absolute';
        line.style.top = insertionPoint.y + 'px';
        line.style.left = '20px';
        line.style.right = '20px';
        line.style.zIndex = '1000';
        return line;
    }
    
    // Proxy method for backward compatibility - delegates to DropZoneManager
    getDragAfterElement(container, y) {
        if (this.dropZoneManager) {
            return this.dropZoneManager.getDragAfterElement(container, y);
        }
        // Fallback to original implementation
        return this.getDragAfterElement_DEPRECATED(container, y);
    }

    getDragAfterElement_DEPRECATED(container, y) {
        // Get direct children blocks and sections of the container (not nested elements)
        const draggableElements = [...container.querySelectorAll(':scope > .editor-block:not(.dragging-element), :scope > .editor-section:not(.dragging-element)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    getSnippetInsertionPoint(block, y) {
        // For snippet insertion within a block, consider direct children snippets
        const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
        
        return snippets.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    restoreOriginalPosition() {
        if (this.originalPosition) {
            const { element, parent, nextSibling } = this.originalPosition;
            if (nextSibling && nextSibling.parentNode === parent) {
                parent.insertBefore(element, nextSibling);
            } else {
                parent.appendChild(element);
            }
            this.originalPosition = null;
        }
    }

    undo() {
        if (this.stateHistory) {
            this.stateHistory.undo();
        }
    }

    redo() {
        if (this.stateHistory) {
            this.stateHistory.redo();
        }
    }

    save() {
        const pageData = this.serializePageToJSON();
        localStorage.setItem('editorPageData', JSON.stringify(pageData));
        alert('Page saved successfully!');
    }

    load() {
        const stored = localStorage.getItem('editorPageData');
        if (stored) {
            const pageData = JSON.parse(stored);
            this.deserializeJSONToPage(pageData);
            alert('Page loaded successfully!');
        } else {
            alert('No saved page found!');
        }
    }

    exportHTML() {
        const cleanHTML = this.getCleanHTML();
        const blob = new Blob([cleanHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'page.html';
        a.click();
        URL.revokeObjectURL(url);
    }

    async publishToUrl() {
        if (!this.publishUrl) {
            alert('No publish URL configured');
            return;
        }

        try {
            // Show loading state
            const publishBtn = document.getElementById('publish-btn');
            const originalText = publishBtn.textContent;
            publishBtn.textContent = 'Publishing...';
            publishBtn.disabled = true;

            // Prepare data to send
            const pageData = {
                html: this.getCleanHTML(),
                content: this.editableArea.innerHTML,
                pageSettings: this.pageSettingsModal ? this.pageSettingsModal.getPageData() : {},
                timestamp: Date.now()
            };

            // Send POST request
            const response = await fetch(this.publishUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pageData)
            });

            if (response.ok) {
                const result = await response.text();
                alert('Page published successfully!');
            } else {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error publishing page:', error);
            alert(`Error publishing page: ${error.message}`);
        } finally {
            // Restore button state
            const publishBtn = document.getElementById('publish-btn');
            publishBtn.textContent = 'Publish';
            publishBtn.disabled = false;
        }
    }

    async loadFromUrl() {
        if (!this.loadUrl) {
            alert('No load URL configured');
            return;
        }

        try {
            // Show loading state
            const loadBtn = document.getElementById('load-from-url-btn');
            const originalText = loadBtn.textContent;
            loadBtn.textContent = 'Loading...';
            loadBtn.disabled = true;

            // Send GET request
            const response = await fetch(this.loadUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                const pageData = await response.json();
                
                // Load the content
                if (pageData.content) {
                    this.editableArea.innerHTML = pageData.content;
                }

                // Load page settings if they exist
                if (pageData.pageSettings && this.pageSettingsModal) {
                    this.pageSettingsModal.setPageData(pageData.pageSettings);
                    
                    // Update document title if page title is set
                    if (pageData.pageSettings.pageTitle) {
                        document.title = pageData.pageSettings.pageTitle;
                    }
                }

                // Save current state to history
                this.stateHistory.saveState();
                
                alert('Page loaded successfully from URL!');
            } else {
                const errorText = await response.text();
                throw new Error(`Server responded with ${response.status}: ${errorText}`);
            }
        } catch (error) {
            console.error('Error loading page from URL:', error);
            alert(`Error loading page: ${error.message}`);
        } finally {
            // Restore button state
            const loadBtn = document.getElementById('load-from-url-btn');
            loadBtn.textContent = 'Load from URL';
            loadBtn.disabled = false;
        }
    }

    deleteElement(element) {
        if (this.confirmationModal) {
            this.confirmationModal.show(
                'Delete Element',
                'Are you sure you want to delete this element?',
                () => {
                    const elementType = element.classList.contains('editor-block') ? 'block' : 'snippet';
                    element.remove();
                    this.stateHistory.saveState();
                    // Trigger onChange callback
                    this.triggerOnChange(`${elementType}-deleted`, null);
                }
            );
        } else {
            // Fallback if no confirmation modal
            if (confirm('Are you sure you want to delete this element?')) {
                const elementType = element.classList.contains('editor-block') ? 'block' : 'snippet';
                element.remove();
                this.stateHistory.saveState();
                // Trigger onChange callback
                this.triggerOnChange(`${elementType}-deleted`, null);
            }
        }
    }

    openCodeEditor(element) {
        if (this.codeEditorModal) {
            this.codeEditorModal.open(element);
        }
    }

    openElementSettings(element) {
        const block = element.closest('.editor-block');
        const snippet = element.closest('.editor-snippet');
        
        if (block && !snippet) {
            // Settings for block (column management)
            if (this.columnSettingsModal) {
                this.columnSettingsModal.open(block);
            }
        } else {
            // For other element types, show placeholder
            alert('Settings not yet implemented for this element type');
        }
    }

    // Placeholder methods for save/load functionality
    serializePageToJSON() {
        return {
            content: this.editableArea.innerHTML,
            page_settings: this.pageSettingsModal ? this.pageSettingsModal.getPageData() : {},
            timestamp: Date.now()
        };
    }

    deserializeJSONToPage(pageData) {
        this.editableArea.innerHTML = pageData.content || '';
        
        // Load page settings if they exist
        if (pageData.page_settings && this.pageSettingsModal) {
            this.pageSettingsModal.setPageData(pageData.page_settings);
            
            // Update document title if page title is set
            if (pageData.page_settings.pageTitle) {
                document.title = pageData.page_settings.pageTitle;
            }
        }
        
        // Restore functionality to loaded content
        this.makeExistingBlocksEditable();
        if (typeof this.makeExistingSectionsDraggable === 'function') {
            this.makeExistingSectionsDraggable();
        }
        
        // Initialize column resizers for any multi-column blocks
        if (this.columnResizer) {
            setTimeout(() => {
                this.columnResizer.setupResizeDividers();
            }, 100);
        }
        
        this.stateHistory.saveState();
    }

    getCleanHTML() {
        const clone = this.editableArea.cloneNode(true);
        // Remove all control elements
        clone.querySelectorAll('.edit-icon, .code-icon, .delete-icon, .settings-icon, .gear-icon, .drag-handle, .resizer-handle').forEach(el => el.remove());
        
        // Get page settings
        const pageSettings = this.pageSettingsModal ? this.pageSettingsModal.getPageData() : {};
        const pageTitle = pageSettings.pageTitle || 'Exported Page';
        const customCSS = pageSettings.customCSS || '';
        const customJS = pageSettings.customJavaScript || '';
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    ${customCSS ? `<style>\n${customCSS}\n</style>` : ''}
</head>
<body>
    ${clone.innerHTML}
    ${customJS ? `<script>\n${customJS}\n</script>` : ''}
</body>
</html>`;
    }

    setupMutationObserver() {
        let timeout;
        const observer = new MutationObserver((mutations) => {
            // Skip if we're currently setting up column resizers to prevent infinite loops
            if (this.columnResizer && this.columnResizer.setupInProgress) {
                return;
            }
            
            // Check if any mutation was adding/removing column resize dividers
            const hasResizerMutation = mutations.some(mutation => {
                if (mutation.type === 'childList') {
                    return Array.from(mutation.addedNodes)
                        .concat(Array.from(mutation.removedNodes))
                        .some(node => node.classList && node.classList.contains('column-resize-divider'));
                }
                return false;
            });
            
            // Skip if the mutation was just adding/removing resize dividers
            if (hasResizerMutation) {
                return;
            }
            
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.stateHistory.saveState();
                // Only refresh column resize dividers if not currently resizing
                if (this.columnResizer && !this.columnResizer.isResizing) {
                    this.columnResizer.refresh();
                }
            }, 300);
        });

        observer.observe(this.editableArea, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeOldValue: true
        });
        
    }

    setupResizing() {
        let resizing = false;
        let currentElement = null;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;
        let resizeType = '';

        this.editableArea.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resizer-handle')) {
                e.preventDefault();
                resizing = true;
                currentElement = e.target.closest('.editor-block, .editor-snippet');
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(window.getComputedStyle(currentElement).width, 10);
                startHeight = parseInt(window.getComputedStyle(currentElement).height, 10);
                
                if (e.target.classList.contains('right')) {
                    resizeType = 'width';
                } else if (e.target.classList.contains('bottom')) {
                    resizeType = 'height';
                } else if (e.target.classList.contains('corner')) {
                    resizeType = 'both';
                }
                
                document.body.style.cursor = resizeType === 'width' ? 'ew-resize' : 
                                           resizeType === 'height' ? 'ns-resize' : 'nw-resize';
                document.body.style.userSelect = 'none';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (resizing && currentElement) {
                e.preventDefault();
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                if (resizeType === 'width' || resizeType === 'both') {
                    const newWidth = Math.max(100, startWidth + deltaX);
                    currentElement.style.width = newWidth + 'px';
                }
                
                if (resizeType === 'height' || resizeType === 'both') {
                    const newHeight = Math.max(50, startHeight + deltaY);
                    currentElement.style.height = newHeight + 'px';
                }
            }
        });

        document.addEventListener('mouseup', () => {
            if (resizing) {
                resizing = false;
                currentElement = null;
                resizeType = '';
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                
                // Save state after resize
                this.stateHistory.saveState();
            }
        });
        
    }

    // Video snippet setup method
    setupVideoSnippet(snippet, url) {
        const placeholder = snippet.querySelector('.video-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Remove any existing video container
        const existingContainer = snippet.querySelector('.video-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        // Create responsive video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';
        videoContainer.style.cssText = `
            position: relative;
            width: 100%;
            padding-bottom: 56.25%; /* 16:9 aspect ratio */
            height: 0;
            overflow: hidden;
        `;
        
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: none;
        `;
        
        videoContainer.appendChild(iframe);
        snippet.appendChild(videoContainer);
    }

    createSnippet(type = 'text', template = null) {
        const snippet = document.createElement('div');
        snippet.className = `editor-snippet ${type}-snippet`;
        snippet.draggable = true;  // Always draggable, but controlled by handle
        
        const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
        
        // Add the controls
        const controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            ${codeIconHtml}
            <button class="delete-icon" title="Delete">🗑️</button>
        `;
        
        // Set the content based on type or template
        if (type === 'video') {
            snippet.innerHTML = controls + '<button class="settings-icon" title="Video Settings">⚙️</button>';
            // Add default video (Big Buck Bunny)
            this.setupVideoSnippet(snippet, 'https://www.youtube.com/embed/aqz-KE-bpKQ');
        } else if (type === 'image' && template) {
            // Use the template content for images (includes default image)
            snippet.innerHTML = controls + template;
        } else if (template) {
            // Use the template content if provided
            snippet.innerHTML = controls + template;
            // Make text content editable
            const textElements = snippet.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div:not([class*="handle"]):not([class*="icon"])');
            textElements.forEach(el => {
                // Don't make elements with control buttons editable
                if (!el.querySelector('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .gear-icon') && 
                    !el.classList.contains('drag-handle') && 
                    !el.classList.contains('edit-icon') && 
                    !el.classList.contains('code-icon') && 
                    !el.classList.contains('delete-icon') && 
                    !el.classList.contains('settings-icon') && 
                    !el.classList.contains('gear-icon')) {
                    el.contentEditable = true;
                }
            });
        } else {
            // Default text snippet
            snippet.contentEditable = true;
            snippet.innerHTML = controls + '<p>Edit this text...</p>';
        }
        
        // Add drag handle functionality
        this.attachDragHandleListeners(snippet);
        
        // Trigger onRender callback
        this.triggerOnRender('snippet', snippet);
        
        return snippet;
    }

    createSection(template = null) {
        let section;
        
        const gearIconHtml = '<button class="gear-icon" title="Section Settings">⚙️</button>';
        const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
        
        const controls = `
            <div class="section-controls">
                <div class="drag-handle">☰</div>
                ${gearIconHtml}
                ${codeIconHtml}
                <button class="delete-icon" title="Delete Section">🗑️</button>
            </div>
        `;
        
        if (template) {
            // Template might already include a section element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            const templateSection = tempDiv.querySelector('section.editor-section');

            if (templateSection) {
                // Use the existing section from template
                section = templateSection;
                // Ensure it has the editor-section class
                section.classList.add('editor-section');
                // Add controls as first child
                const controlsDiv = document.createElement('div');
                controlsDiv.innerHTML = controls;
                section.insertBefore(controlsDiv.querySelector('.section-controls'), section.firstChild);
            } else {
                // Template doesn't have a section, create one
                section = document.createElement('section');
                section.className = 'editor-section';
                section.innerHTML = controls + template;
            }
        } else {
            // Default section with content area
            section = document.createElement('section');
            section.className = 'editor-section';
            section.innerHTML = controls + '<div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 40px 20px;"></div>';
        }
        
        section.style.position = 'relative';
        section.draggable = true;  // Always draggable, but controlled by handle
        
        // Set up control handlers
        this.attachSectionControlListeners(section);
        this.attachDragHandleListeners(section);
        
        // Process any blocks within the section to add their controls
        const blocksInSection = section.querySelectorAll('.editor-block');
        blocksInSection.forEach(block => {
            if (!block.querySelector('.drag-handle')) {
                this.addBlockControls(block);
            }
            this.attachDragHandleListeners(block);
        });
        
        // Process any snippets within the section to add their controls
        const snippetsInSection = section.querySelectorAll('.editor-snippet');
        snippetsInSection.forEach(snippet => {
            if (!snippet.querySelector('.drag-handle')) {
                this.addSnippetControls(snippet);
            }
            this.attachDragHandleListeners(snippet);
        });

        // Make section elements editable (including processing images)
        this.makeSectionElementsEditable(section);

        // Process any images in the new section specifically
        this.processImagesInSection(section);

        // Trigger onRender callback
        this.triggerOnRender('section', section);
        
        return section;
    }
    
    attachSectionControlListeners(section) {
        // The main event listener on editableArea already handles clicks on control icons
        // We just need to ensure sections are included in the selector
        // The existing event delegation will handle delete-icon, gear-icon, code-icon clicks
    }

    createBlock(template = null) {
        const block = document.createElement('div');
        block.className = 'editor-block';
        block.style.position = 'relative';
        block.draggable = true;  // Always draggable, but controlled by handle
        
        const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
        
        // Add block controls
        const controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            <button class="settings-icon" title="Column Settings">⚙️</button>
            ${codeIconHtml}
            <button class="delete-icon" title="Delete">🗑️</button>
            <div class="resizer-handle right"></div>
            <div class="resizer-handle bottom"></div>
            <div class="resizer-handle corner"></div>
        `;
        
        if (template) {
            block.innerHTML = controls + template;
            
            // Make text elements inside blocks editable
            // This includes h1-h6, p, span, and other text elements
            const editableElements = block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th');
            editableElements.forEach(el => {
                // Only make elements editable if they contain text content
                // and are not control elements
                if (!el.classList.contains('drag-handle') && 
                    !el.classList.contains('edit-icon') && 
                    !el.classList.contains('code-icon') && 
                    !el.classList.contains('delete-icon') && 
                    !el.classList.contains('settings-icon') && 
                    !el.classList.contains('gear-icon') &&
                    !el.closest('button')) {
                    el.contentEditable = true;
                    el.style.outline = 'none'; // Remove outline when editing
                    
                    // Add focus/blur handlers to improve editing experience
                    el.addEventListener('focus', () => {
                        el.style.opacity = '0.9';
                    });
                    el.addEventListener('blur', () => {
                        el.style.opacity = '';
                    });
                }
            });
        } else {
            // Default single column block
            block.innerHTML = controls + '<div class="column" style="flex: 1;"></div>';
        }
        
        // Add drag handle functionality
        this.attachDragHandleListeners(block);
        
        // Apply Firefox fixes to newly created block's editable elements
        if (this.formattingToolbar) {
            // Use setTimeout to ensure the element is in DOM before applying fixes
            setTimeout(() => {
                this.formattingToolbar.fixFirefoxEditableElements();
            }, 0);
        }
        
        // Trigger onRender callback
        this.triggerOnRender('block', block);
        
        return block;
    }
    
    setupViewportControls() {
        // Setup viewport control buttons if they exist
        const mobileBtn = document.getElementById('mobile-viewport');
        const tabletBtn = document.getElementById('tablet-viewport');
        const desktopBtn = document.getElementById('desktop-viewport');
        
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => this.setViewportSize('375px'));
        }
        if (tabletBtn) {
            tabletBtn.addEventListener('click', () => this.setViewportSize('768px'));
        }
        if (desktopBtn) {
            desktopBtn.addEventListener('click', () => this.setViewportSize('100%'));
        }
        
        // Initialize desktop mode
        this.editableArea.classList.add('viewport-desktop');
    }

    // Method to ensure all images have resize functionality
    refreshImageResizing() {
        if (this.imageUploader) {
            this.imageUploader.ensureAllImagesResizable();
        }
    }

    makeExistingBlocksEditable() {
        // Make all existing text elements in blocks editable
        // This handles blocks that were created before the fix
        const blocks = this.editableArea.querySelectorAll('.editor-block');
        blocks.forEach(block => {
            const editableElements = block.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th');

            editableElements.forEach(el => {
                // Skip if already editable or is a control element
                if (el.contentEditable === 'true' ||
                    el.classList.contains('drag-handle') ||
                    el.classList.contains('edit-icon') ||
                    el.classList.contains('code-icon') ||
                    el.classList.contains('delete-icon') ||
                    el.classList.contains('settings-icon') ||
                    el.classList.contains('gear-icon') ||
                    el.closest('button')) {
                    return;
                }

                el.contentEditable = true;
                el.style.outline = 'none';

                // Add focus/blur handlers
                el.addEventListener('focus', () => {
                    el.style.opacity = '0.9';
                });
                el.addEventListener('blur', () => {
                    el.style.opacity = '';
                });
            });

            // Handle existing image snippets in blocks
            const imageSnippets = block.querySelectorAll('.editor-snippet');
            imageSnippets.forEach(snippet => {
                if (snippet.classList.contains('image-snippet') ||
                    snippet.querySelector('.image-resize-container') ||
                    snippet.querySelector('.image-container')) {
                    if (this.imageUploader) {
                        this.imageUploader.setupImageSnippet(snippet);
                    }
                }
            });

            // Handle standalone images in blocks (not in snippets)
            const standaloneImages = block.querySelectorAll('img:not(.image-resize-container img)');
            standaloneImages.forEach(img => {
                // Skip if already wrapped
                if (img.parentElement.classList.contains('image-resize-container')) {
                    return;
                }

                // Create resize container for the image
                if (this.imageUploader) {
                    const container = this.imageUploader.createImageResizeContainer(img.cloneNode(true));
                    img.parentNode.replaceChild(container, img);
                    this.imageUploader.reattachImageHandlers(container);
                }
            });
        });
        
        // Apply Firefox contenteditable fixes after making blocks editable
        if (this.formattingToolbar) {
            this.formattingToolbar.fixFirefoxEditableElements();
        }
    }

    makeExistingSectionsDraggable() {
        // Make all existing sections draggable
        // This handles sections that were created before the fix
        const sections = this.editableArea.querySelectorAll('.editor-section');
        sections.forEach(section => {
            // Add section controls if they don't exist
            if (!section.querySelector('.section-controls')) {
                const gearIconHtml = '<button class="gear-icon" title="Section Settings">⚙️</button>';
                const codeIconHtml = this.showCodeIcon ? '<button class="code-icon" title="Edit HTML">&lt;/&gt;</button>' : '';
                
                const controls = `
                    <div class="section-controls">
                        <div class="drag-handle">☰</div>
                        ${gearIconHtml}
                        ${codeIconHtml}
                        <button class="delete-icon" title="Delete Section">🗑️</button>
                    </div>
                `;
                
                const controlsDiv = document.createElement('div');
                controlsDiv.innerHTML = controls;
                section.insertBefore(controlsDiv.querySelector('.section-controls'), section.firstChild);
            }
            
            // Ensure section is draggable and has proper positioning
            section.draggable = true;
            section.style.position = 'relative';
            
            // Attach drag handle listeners
            this.attachDragHandleListeners(section);
            
            // Make text elements in sections editable
            this.makeSectionElementsEditable(section);
            
            // Process any blocks within the section to add their controls
            const blocksInSection = section.querySelectorAll('.editor-block');
            blocksInSection.forEach(block => {
                if (!block.querySelector('.drag-handle')) {
                    this.addBlockControls(block);
                }
                this.attachDragHandleListeners(block);
            });
            
            // Process any snippets within the section to add their controls
            const snippetsInSection = section.querySelectorAll('.editor-snippet');
            snippetsInSection.forEach(snippet => {
                if (!snippet.querySelector('.drag-handle')) {
                    this.addSnippetControls(snippet);
                }
                this.attachDragHandleListeners(snippet);
            });
            
            // Apply current mode to contenteditable elements
            if (typeof this.toggleContentEditableElements === 'function') {
                this.toggleContentEditableElements();
            }
        });

        // Process any images that might need wrapping
        if (this.formattingToolbar && this.formattingToolbar.wrapExistingImages) {
            this.formattingToolbar.wrapExistingImages();
        }
    }
    
    makeSectionElementsEditable(section) {
        // Make text elements in the section editable
        const editableElements = section.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th');

        editableElements.forEach(el => {
            // Skip if already editable or is a control element
            if (el.contentEditable === 'true' ||
                el.classList.contains('drag-handle') ||
                el.classList.contains('edit-icon') ||
                el.classList.contains('code-icon') ||
                el.classList.contains('delete-icon') ||
                el.classList.contains('settings-icon') ||
                el.classList.contains('gear-icon') ||
                el.closest('button') ||
                el.closest('.section-controls')) {
                return;
            }

            el.contentEditable = true;
            el.style.outline = 'none';

            // Add focus/blur handlers
            el.addEventListener('focus', () => {
                el.style.opacity = '0.9';
            });
            el.addEventListener('blur', () => {
                el.style.opacity = '';
            });
        });

        // Note: Image processing is now handled by FormattingToolbar.wrapExistingImages()
        // which is called after section creation

        // Apply Firefox contenteditable fixes
        if (this.formattingToolbar) {
            this.formattingToolbar.fixFirefoxEditableElements();
        }
    }

    processImagesInSection(section) {
        // Find all standalone images in the section that need wrapping
        const images = section.querySelectorAll('img:not(.image-resize-container img)');
        console.log('ProcessImagesInSection: Found', images.length, 'images to process');

        images.forEach(img => {
            // Skip if already wrapped
            if (img.closest('.image-resize-container')) {
                console.log('Image already wrapped, skipping');
                return;
            }

            console.log('Processing image:', img.src);

            // Create resize container using ImageUploader
            if (this.imageUploader) {
                const container = this.imageUploader.createImageResizeContainer(img.cloneNode(true));
                console.log('Created container:', container);

                // Replace the image with the container
                img.parentNode.replaceChild(container, img);

                // Attach image handlers
                this.imageUploader.reattachImageHandlers(container);
                console.log('Image processing completed');
            }
        });
    }


    setViewportSize(width) {
        this.editableArea.style.maxWidth = width;
        this.editableArea.style.margin = width === '100%' ? '0' : '0 auto';
        
        // Add viewport classes for full-width block responsiveness
        this.editableArea.classList.remove('viewport-mobile', 'viewport-tablet', 'viewport-desktop');
        if (width === '375px') {
            this.editableArea.classList.add('viewport-mobile');
        } else if (width === '768px') {
            this.editableArea.classList.add('viewport-tablet');
        } else {
            this.editableArea.classList.add('viewport-desktop');
        }
        
        // Update active button
        document.querySelectorAll('.viewport-btn').forEach(btn => btn.classList.remove('active'));
        if (width === '375px') {
            document.getElementById('mobile-viewport').classList.add('active');
        } else if (width === '768px') {
            document.getElementById('tablet-viewport').classList.add('active');
        } else {
            document.getElementById('desktop-viewport').classList.add('active');
        }
        
        // Refresh all images to prevent distortion at different viewport sizes
        this.refreshImageDimensions();
    }
    
    refreshImageDimensions() {
        const imageContainers = this.editableArea.querySelectorAll('.image-resize-container');
        imageContainers.forEach(container => {
            const img = container.querySelector('img');
            if (img) {
                // Store the current dimensions if they exist (user-defined sizes)
                const currentWidth = container.style.width;
                const currentHeight = container.style.height;
                const imgWidth = img.style.width;
                const imgHeight = img.style.height;
                
                // Only reset if the image appears distorted or has no manual sizing
                // Check if the image is larger than its container (indicates potential distortion)
                const containerRect = container.getBoundingClientRect();
                const imgRect = img.getBoundingClientRect();
                
                const isDistorted = imgRect.width > containerRect.width + 5; // 5px tolerance
                
                if (isDistorted || (!currentWidth && !imgWidth)) {
                    // Reset only if distorted or no manual sizing exists
                    container.style.width = '';
                    container.style.height = '';
                    img.style.width = '';
                    img.style.height = '';
                } else {
                    // Preserve user-defined dimensions but ensure they don't exceed container
                    if (currentWidth && parseInt(currentWidth) > containerRect.width) {
                        container.style.width = '100%';
                    }
                }
                
                // Ensure container fits content properly to prevent gray areas
                if (!currentWidth && !imgWidth) {
                    container.style.width = 'fit-content';
                    container.style.height = 'fit-content';
                }
                
                // Always ensure responsive constraints
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
            }
        });
    }
    
    // Public method to set the mode programmatically
    setMode(mode) {
        if (mode === 'edit' || mode === 'display') {
            if (this.currentMode !== mode) {
                this.toggleMode();
            } else {
                // Even if mode hasn't changed, ensure UI elements are in correct state
                this.updateModeUI();
            }
        }
    }
    
    updateModeUI() {
        // Ensure UI elements are in the correct state for current mode
        const iconStrip = document.querySelector('.icon-strip');
        const panel = document.getElementById('snippet-panel');
        const editorMain = document.querySelector('.editor-main');
        const editorHeader = document.querySelector('.dragon-editor .editor-header');
        const viewportControls = document.querySelector('.viewport-controls');
        
        if (this.currentMode === 'edit') {
            // Show edit mode elements
            if (iconStrip) iconStrip.style.display = 'flex';
            if (editorHeader) editorHeader.style.display = 'flex';
            if (viewportControls) viewportControls.style.display = 'flex';
            // Don't set inline styles - CSS handles padding based on mode
        } else {
            // Hide edit mode elements
            if (iconStrip) iconStrip.style.display = 'none';
            if (panel) panel.classList.remove('open');
            if (editorMain) {
                editorMain.classList.remove('panel-open');
                // Don't set inline styles - CSS handles padding based on mode
            }
            if (editorHeader) editorHeader.style.display = 'none';
            if (viewportControls) viewportControls.style.display = 'none';
        }
        
        // Update data attribute
        if (this.editableArea) {
            this.editableArea.dataset.mode = this.currentMode;
        }
        
        // Update mode button text
        const modeBtn = document.getElementById('toggle-mode-btn');
        if (modeBtn) {
            modeBtn.textContent = this.currentMode === 'edit' ? 'Switch to Display Mode' : 'Switch to Edit Mode';
        }
    }
    
    // Public method to get the current mode
    getMode() {
        return this.currentMode;
    }
    
    // Trigger onChange callback
    triggerOnChange(eventType, element) {
        if (typeof this.onChange === 'function') {
            try {
                this.onChange({
                    type: eventType,
                    element: element,
                    html: this.editableArea.innerHTML,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error in onChange callback:', error);
            }
        }
    }
    
    // Trigger onRender callback
    triggerOnRender(elementType, element) {
        if (typeof this.onRender === 'function') {
            try {
                this.onRender({
                    type: elementType,
                    element: element,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error in onRender callback:', error);
            }
        }
    }

    // Proxy properties for backward compatibility with tests
    get activeExistingDrag() {
        return this.dropZoneManager ? this.dropZoneManager.activeExistingDrag : null;
    }

    set activeExistingDrag(value) {
        if (this.dropZoneManager) {
            this.dropZoneManager.activeExistingDrag = value;
        }
    }

    get currentDragOperation() {
        return this.dropZoneManager ? this.dropZoneManager.currentDragOperation : null;
    }

    set currentDragOperation(value) {
        if (this.dropZoneManager) {
            this.dropZoneManager.currentDragOperation = value;
        }
    }

    get currentTargetBlock() {
        return this.dropZoneManager ? this.dropZoneManager.currentTargetBlock : null;
    }

    set currentTargetBlock(value) {
        if (this.dropZoneManager) {
            this.dropZoneManager.currentTargetBlock = value;
        }
    }
}