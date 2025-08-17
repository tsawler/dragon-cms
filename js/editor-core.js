import { StateHistory } from './state-history.js';
import { FormattingToolbar } from './formatting-toolbar.js';
import { ImageUploader } from './image-uploader.js';
import { VideoSettingsModal } from './video-settings-modal.js';
import { StyleEditorModal, CodeEditorModal, ColumnSettingsModal, ConfirmationModal } from './modals.js';
import { SnippetPanel } from './snippet-panel.js';
import { ColumnResizer } from './column-resizer.js';
import { PageSettingsModal } from './page-settings-modal.js';
import { ModalDragger } from './modal-dragger.js';

export class Editor {
    constructor(options = {}) {
        this.options = options;
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

    init() {
        this.snippetPanel = new SnippetPanel(this);
        // this.dragDropManager = new DragDropManager(this);
        this.stateHistory = new StateHistory(this);
        this.formattingToolbar = new FormattingToolbar(this);
        this.styleEditorModal = new StyleEditorModal(this);
        this.setupPanelToggle();
        this.codeEditorModal = new CodeEditorModal(this);
        this.imageUploader = new ImageUploader(this);
        this.videoSettingsModal = new VideoSettingsModal(this);
        this.columnSettingsModal = new ColumnSettingsModal(this);
        this.confirmationModal = new ConfirmationModal(this);
        this.columnResizer = new ColumnResizer(this);
        this.pageSettingsModal = new PageSettingsModal(this);
        this.modalDragger = new ModalDragger();
        // this.buttonSettingsModal = new ButtonSettingsModal(this);
        
        this.attachEventListeners();
        this.setupMutationObserver();
        this.setupResizing();
        this.setupViewportControls();
        this.makeExistingBlocksEditable();
    }

    setupPanelToggle() {
        const handle = document.getElementById('panel-handle');
        const panel = document.getElementById('snippet-panel');
        const editorMain = document.querySelector('.editor-main');
        const editableArea = document.getElementById('editable-area');
        
        const togglePanel = () => {
            const isOpen = panel.classList.contains('open');
            const currentHandle = document.getElementById('new-panel-handle');
            
            if (isOpen) {
                // Close panel
                panel.classList.remove('open');
                panel.style.transform = 'translateX(-100%)';
                if (editableArea) {
                    editableArea.style.marginLeft = '0';
                }
                // Keep handle visible at left edge
                if (currentHandle) {
                    currentHandle.style.left = '0px';
                }
            } else {
                // Open panel  
                panel.classList.add('open');
                panel.style.transform = 'translateX(0)';
                if (editableArea) {
                    editableArea.style.marginLeft = '250px';
                }
                // Move handle to right edge of panel
                if (currentHandle) {
                    currentHandle.style.left = '250px';
                }
            }
        };

        // Create a completely new handle element to bypass CSS conflicts
        const newHandle = document.createElement('div');
        newHandle.id = 'new-panel-handle';
        newHandle.innerHTML = `
            <div style="width: 3px; height: 3px; background: white; border-radius: 50%; margin: 1px;"></div>
            <div style="width: 3px; height: 3px; background: white; border-radius: 50%; margin: 1px;"></div>
            <div style="width: 3px; height: 3px; background: white; border-radius: 50%; margin: 1px;"></div>
        `;
        
        // Apply styles directly to the new element
        Object.assign(newHandle.style, {
            position: 'fixed',
            left: '0px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            width: '30px',
            height: '60px',
            backgroundColor: '#3b82f6',
            borderRadius: '0 8px 8px 0',
            cursor: 'pointer',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            outline: 'none',
            boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
            margin: '0',
            padding: '0',
            transition: 'left 0.3s ease'
        });
        
        // Add click handler to new handle
        newHandle.addEventListener('click', togglePanel);
        
        // Remove old handle if it exists and add new one
        if (handle) {
            handle.remove();
        }
        document.body.appendChild(newHandle);
        
        console.log('New handle created and added to body');
        
        // Set up panel
        if (panel) {
            panel.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                height: 100vh !important;
                width: 250px !important;
                z-index: 1000 !important;
                transform: translateX(-100%) !important;
                transition: transform 0.3s ease !important;
            `;
            console.log('Panel positioned, should be hidden');
        }
        
        if (editableArea) {
            editableArea.style.transition = 'margin-left 0.3s ease';
        }
        
        // Check final position
        setTimeout(() => {
            const rect = newHandle.getBoundingClientRect();
            console.log('New handle final position check:', rect);
            if (rect.left >= 0 && rect.left <= 50) {
                console.log('✅ Handle is visible!');
            } else {
                console.log('❌ Handle still not visible');
            }
        }, 100);
        
        // Refresh column resize dividers when mode changes
        // Temporarily disabled
        // if (this.columnResizer) {
        //     this.columnResizer.refresh();
        // }
    }

    attachEventListeners() {
        this.setupDropZone();

        // Handle header button clicks
        this.attachHeaderListeners();
        
        // Handle control icon clicks (edit, delete, settings, etc.)
        this.attachControlListeners();

        console.log('Event listeners attached');
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
    }

    attachControlListeners() {
        // Use event delegation for dynamically created elements
        this.editableArea.addEventListener('click', (e) => {
            // Check if the clicked element or its parent is a control icon
            const target = e.target.closest('.edit-icon, .code-icon, .delete-icon, .settings-icon, .drag-handle');
            
            if (!target) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            if (target.classList.contains('edit-icon')) {
                const element = target.closest('.editor-block, .editor-snippet');
                if (element && this.styleEditorModal) {
                    this.styleEditorModal.open(element);
                }
            } else if (target.classList.contains('delete-icon')) {
                const element = target.closest('.editor-block, .editor-snippet');
                if (element) {
                    this.deleteElement(element);
                }
            } else if (target.classList.contains('code-icon')) {
                const element = target.closest('.editor-block, .editor-snippet');
                if (element) {
                    this.openCodeEditor(element);
                }
            } else if (target.classList.contains('settings-icon')) {
                const snippet = target.closest('.editor-snippet');
                if (snippet && snippet.classList.contains('video-snippet')) {
                    this.videoSettingsModal.open(snippet);
                } else {
                    // Handle other settings (blocks, non-video snippets)
                    const element = target.closest('.editor-block, .editor-snippet');
                    if (element) {
                        this.openElementSettings(element);
                    }
                }
            }
        });
    }

    // Header button methods
    toggleMode() {
        this.currentMode = this.currentMode === 'edit' ? 'display' : 'edit';
        this.editableArea.dataset.mode = this.currentMode;
        
        const modeBtn = document.getElementById('toggle-mode-btn');
        if (modeBtn) {
            modeBtn.textContent = this.currentMode === 'edit' ? 'Switch to Display Mode' : 'Switch to Edit Mode';
        }
        
        // Hide/show snippet panel based on mode
        const panel = document.getElementById('snippet-panel');
        const handle = document.getElementById('new-panel-handle');
        
        if (this.currentMode === 'display') {
            // Hide panel and handle in display mode
            if (panel) {
                panel.style.transform = 'translateX(-100%)';
                panel.classList.remove('open');
            }
            if (handle) {
                handle.style.display = 'none';
            }
            // Reset margin
            if (this.editableArea) {
                this.editableArea.style.marginLeft = '0';
            }
        } else {
            // Show handle in edit mode (panel starts closed)
            if (handle) {
                handle.style.display = 'flex';
                // Reset handle position to left edge since panel should be closed
                handle.style.left = '0px';
            }
        }
        
        // Refresh column resize dividers when mode changes
        // Temporarily disabled to prevent infinite loops
        // if (this.columnResizer) {
        //     this.columnResizer.refresh();
        // }
        
        console.log('Mode switched to:', this.currentMode);
    }
    
    setupDropZone() {
        const area = this.editableArea;
        let currentInsertionLine = null;
        let currentDropOverlay = null;

        // Add dragstart event listener to the area to catch all elements
        area.addEventListener('dragstart', (e) => {
            // Dragstart for existing elements
            if (e.target.classList.contains('editor-block') || e.target.classList.contains('editor-snippet')) {
                console.log('Dragstart for existing element:', e.target.className);
                
                // Store original position for potential restoration
                this.originalPosition = {
                    element: e.target,
                    parent: e.target.parentNode,
                    nextSibling: e.target.nextSibling
                };
                
                e.dataTransfer.effectAllowed = 'copy';  // Changed from 'move' to 'copy' to match panel elements
                
                // Set the data for existing element reordering
                if (e.target.classList.contains('editor-block')) {
                    e.dataTransfer.setData('elementType', 'block');
                    this.currentDragOperation = { type: 'block', isExisting: true };
                    console.log('Set currentDragOperation for existing block:', this.currentDragOperation);
                } else {
                    e.dataTransfer.setData('elementType', 'snippet');
                    e.dataTransfer.setData('snippetType', 'existing');
                    this.currentDragOperation = { type: 'snippet', isExisting: true };
                    console.log('Set currentDragOperation for existing snippet:', this.currentDragOperation);
                }
                e.dataTransfer.setData('template', e.target.outerHTML);
                
                // Add the dragging class
                e.target.classList.add('dragging-element');
            }
        });
        
        area.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('editor-block') || e.target.classList.contains('editor-snippet')) {
                console.log('Dragend for existing element:', e.target.className);
                e.target.classList.remove('dragging-element');
                this.currentDragOperation = null;
                this.clearVisualIndicators();
            }
        });

        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            const elementType = e.dataTransfer.getData('elementType') || this.currentDragOperation?.type || this.getCurrentDragType(e);
            
            // For existing snippets, allow dragging over intermediate areas but check drop target later
            if (elementType === 'snippet' && this.currentDragOperation?.isExisting) {
                // Don't set dropEffect to 'none' during dragover - let the drop handler validate the final target
            }
            
            e.dataTransfer.dropEffect = 'copy';
            
            // Store the current target block BEFORE clearing indicators
            let targetBlock = null;
            if (elementType === 'snippet') {
                // First check if we're hovering over a specific column
                const targetColumn = e.target.closest('.column');
                if (targetColumn) {
                    targetBlock = targetColumn;
                } else {
                    targetBlock = e.target.closest('.editor-block');
                }
            }
            
            // Clear previous indicators
            this.clearVisualIndicators();
            
            if (elementType === 'snippet') {
                // For snippets, highlight valid blocks and show insertion points
                const block = targetBlock;
                this.currentTargetBlock = block;
                if (block) {
                    block.classList.add('valid-drop-target');
                    
                    // Show insertion line for snippet positioning within the block
                    const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
                    if (snippets.length > 0) {
                        const insertionPoint = this.getSnippetInsertionPointWithPosition(block, e.clientY);
                        if (insertionPoint) {
                            currentInsertionLine = this.createInsertionLine(insertionPoint);
                            block.style.position = 'relative';
                            block.appendChild(currentInsertionLine);
                        }
                    } else {
                        // No existing snippets - show overlay
                        if (!block.querySelector('.drop-zone-overlay')) {
                            currentDropOverlay = document.createElement('div');
                            currentDropOverlay.className = 'drop-zone-overlay snippet-drop-zone-overlay';
                            block.appendChild(currentDropOverlay);
                        }
                    }
                }
            } else if (elementType === 'block' || elementType === 'custom') {
                const existingBlocks = area.querySelectorAll('.editor-block').length;
                
                if (existingBlocks === 0) {
                    // Empty area - show drop overlay instead of insertion line
                    area.style.background = 'rgba(59, 130, 246, 0.05)';
                    area.style.borderColor = '#3b82f6';
                    
                    // Add drop overlay to the main area
                    currentDropOverlay = document.createElement('div');
                    currentDropOverlay.className = 'drop-zone-overlay';
                    currentDropOverlay.style.position = 'absolute';
                    currentDropOverlay.style.top = '20px';
                    currentDropOverlay.style.left = '20px';
                    currentDropOverlay.style.right = '20px';
                    currentDropOverlay.style.bottom = '20px';
                    currentDropOverlay.style.zIndex = '999';
                    area.style.position = 'relative';
                    area.appendChild(currentDropOverlay);
                } else {
                    // Has blocks - show insertion line
                    const insertionPoint = this.getInsertionPoint(area, e.clientY);
                    if (insertionPoint) {
                        currentInsertionLine = this.createInsertionLine(insertionPoint);
                        area.style.position = 'relative'; // Ensure relative positioning for absolute children
                        area.appendChild(currentInsertionLine);
                    }
                }
            }
            
            // Handle repositioning of existing elements during drag
            const afterElement = this.getDragAfterElement(area, e.clientY);
            const dragging = document.querySelector('.dragging-element');
            
            if (dragging) {
                if (afterElement == null) {
                    area.appendChild(dragging);
                } else {
                    area.insertBefore(dragging, afterElement);
                }
            }
        });
        
        area.addEventListener('dragleave', (e) => {
            if (!area.contains(e.relatedTarget)) {
                this.clearVisualIndicators();
            }
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            
            // Capture dragging element BEFORE clearing visual indicators
            const draggingElement = document.querySelector('.dragging-element');
            
            // Clear all visual indicators
            this.clearVisualIndicators();
            
            const elementType = e.dataTransfer.getData('elementType') || this.currentDragOperation?.type;
            let snippetType = e.dataTransfer.getData('snippetType') || (this.currentDragOperation?.isExisting ? 'existing' : '');
            const template = e.dataTransfer.getData('template');
            
            // For existing elements, override snippetType to 'existing'
            if (this.currentDragOperation?.isExisting && elementType === 'snippet') {
                console.log('Overriding snippetType from', snippetType, 'to existing');
                snippetType = 'existing';
            }

            if (elementType === 'block') {
                // Check if this is an existing block being moved
                if (draggingElement && draggingElement.classList.contains('editor-block')) {
                    // Moving an existing block - insert into main area
                    const afterElement = this.getDragAfterElement(area, e.clientY);
                    if (afterElement == null) {
                        area.appendChild(draggingElement);
                    } else {
                        area.insertBefore(draggingElement, afterElement);
                    }
                    this.stateHistory.saveState();
                    this.originalPosition = null; // Clear since drop was successful
                } else {
                    // Create a new block from panel
                    const block = this.createBlock(template);
                    const afterElement = this.getDragAfterElement(area, e.clientY);
                    if (afterElement == null) {
                        area.appendChild(block);
                    } else {
                        area.insertBefore(block, afterElement);
                    }
                    this.stateHistory.saveState();
                }
            } else if (elementType === 'snippet') {
                // Find the closest column first, then block
                const targetContainer = e.target.closest('.column');
                let closestBlock = null;
                
                if (targetContainer) {
                    // Dropping into a column
                    closestBlock = targetContainer;
                } else {
                    // Use the target block stored during dragover OR try to find it now
                    closestBlock = this.currentTargetBlock || e.target.closest('.editor-block');
                }
                
                console.log('Snippet drop - target container:', targetContainer, 'closest block:', closestBlock);
                if (closestBlock) {
                    if (snippetType === 'existing') {
                        // Moving an existing snippet
                        const dragging = draggingElement;
                        console.log('Moving existing snippet:', {
                            dragging,
                            closestBlock,
                            draggingParent: dragging?.parentNode,
                            blockChildren: closestBlock ? [...closestBlock.children].map(c => c.className) : []
                        });
                        
                        if (dragging && dragging.classList.contains('editor-snippet')) {
                            // Insert existing snippet at the correct position within the block
                            const afterElement = this.getSnippetInsertionPoint(closestBlock, e.clientY);
                            console.log('Insertion details:', {
                                afterElement,
                                insertionMethod: afterElement ? 'insertBefore' : 'appendChild'
                            });
                            
                            if (afterElement == null) {
                                console.log('Appending to block');
                                closestBlock.appendChild(dragging);
                            } else {
                                console.log('Inserting before:', afterElement);
                                closestBlock.insertBefore(dragging, afterElement);
                            }
                            
                            console.log('After insertion - parent:', dragging.parentNode, 'parent class:', dragging.parentNode?.className);
                        }
                    } else {
                        // Creating a new snippet from the panel
                        const snippet = this.createSnippet(snippetType, template);
                        
                        // Insert snippet at the correct position within the block
                        const afterElement = this.getSnippetInsertionPoint(closestBlock, e.clientY);
                        if (afterElement == null) {
                            closestBlock.appendChild(snippet);
                        } else {
                            closestBlock.insertBefore(snippet, afterElement);
                        }
                        
                        if (snippetType === 'image') {
                            this.imageUploader.setupImageSnippet(snippet);
                        }
                    }
                    
                    this.stateHistory.saveState();
                    this.originalPosition = null; // Clear since drop was successful
                } else {
                    // Invalid drop - restore to original position
                    this.restoreOriginalPosition();
                }
            }
        });
    }
    
    getCurrentDragType(e) {
        // Fallback method to determine drag type
        return null;
    }
    
    clearVisualIndicators() {
        const area = this.editableArea;
        
        // Remove all visual indicators
        area.querySelectorAll('.valid-drop-target').forEach(el => el.classList.remove('valid-drop-target'));
        area.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        area.querySelectorAll('.drop-insertion-line').forEach(el => el.remove());
        area.querySelectorAll('.drop-zone-overlay').forEach(el => el.remove());
        
        // Reset main area styling
        area.style.background = '';
        area.style.borderColor = '';
        area.style.position = '';
        
        // Don't clear currentTargetBlock here - it's needed for drop event
    }
    
    getSnippetInsertionPointWithPosition(block, y) {
        const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
        const blockRect = block.getBoundingClientRect();
        
        if (snippets.length === 0) {
            return null; // No insertion point needed for empty block
        }
        
        for (let i = 0; i < snippets.length; i++) {
            const rect = snippets[i].getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;
            
            if (y < midPoint) {
                return { 
                    y: rect.top - blockRect.top - 5, 
                    container: block 
                };
            }
        }
        
        // Insert at the end
        const lastSnippet = snippets[snippets.length - 1];
        const lastRect = lastSnippet.getBoundingClientRect();
        return { 
            y: lastRect.bottom - blockRect.top + 5, 
            container: block 
        };
    }
    
    getInsertionPoint(container, y) {
        const blocks = [...container.querySelectorAll(':scope > .editor-block:not(.dragging-element)')];
        const containerRect = container.getBoundingClientRect();
        
        if (blocks.length === 0) {
            return null; // No insertion point needed for empty area
        }
        
        for (let i = 0; i < blocks.length; i++) {
            const rect = blocks[i].getBoundingClientRect();
            const midPoint = rect.top + rect.height / 2;
            
            if (y < midPoint) {
                return { 
                    y: rect.top - containerRect.top - 5, 
                    container 
                };
            }
        }
        
        // Insert at the end
        const lastBlock = blocks[blocks.length - 1];
        const lastRect = lastBlock.getBoundingClientRect();
        return { 
            y: lastRect.bottom - containerRect.top + 5, 
            container 
        };
    }
    
    createInsertionLine(insertionPoint) {
        const line = document.createElement('div');
        line.className = 'drop-insertion-line';
        line.style.position = 'absolute';
        line.style.top = insertionPoint.y + 'px';
        line.style.left = '20px';
        line.style.right = '20px';
        line.style.zIndex = '1000';
        return line;
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.editor-block:not(.dragging-element), .editor-snippet:not(.dragging-element)')];
        
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

    deleteElement(element) {
        if (this.confirmationModal) {
            this.confirmationModal.show(
                'Delete Element',
                'Are you sure you want to delete this element?',
                () => {
                    console.log('Delete confirmed, removing element:', element);
                    element.remove();
                    this.stateHistory.saveState();
                    console.log('Element removed and state saved');
                }
            );
        } else {
            // Fallback if no confirmation modal
            if (confirm('Are you sure you want to delete this element?')) {
                element.remove();
                this.stateHistory.saveState();
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
        
        this.stateHistory.saveState();
    }

    getCleanHTML() {
        const clone = this.editableArea.cloneNode(true);
        // Remove all control elements
        clone.querySelectorAll('.edit-icon, .code-icon, .delete-icon, .settings-icon, .drag-handle').forEach(el => el.remove());
        
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
        
        console.log('Mutation observer setup completed');
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
        
        console.log('Block resizing setup completed');
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
        snippet.draggable = true;  // Make snippets draggable by default
        
        // Add the controls
        const controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            <button class="code-icon" title="Edit HTML">&lt;/&gt;</button>
            <button class="delete-icon" title="Delete">🗑️</button>
        `;
        
        // Set the content based on type or template
        if (type === 'video') {
            snippet.innerHTML = controls + '<button class="settings-icon" title="Video Settings">⚙️</button>';
            // Add default video (Big Buck Bunny)
            this.setupVideoSnippet(snippet, 'https://www.youtube.com/embed/aqz-KE-bpKQ');
        } else if (type === 'image') {
            snippet.innerHTML = controls + '<div class="image-upload-zone">Click or drag image here</div>';
        } else if (template) {
            // Use the template content if provided
            snippet.innerHTML = controls + template;
            // Make text content editable
            const textElements = snippet.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div:not([class*="handle"]):not([class*="icon"])');
            textElements.forEach(el => {
                // Don't make elements with control buttons editable
                if (!el.querySelector('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon') && 
                    !el.classList.contains('drag-handle') && 
                    !el.classList.contains('edit-icon') && 
                    !el.classList.contains('code-icon') && 
                    !el.classList.contains('delete-icon') && 
                    !el.classList.contains('settings-icon')) {
                    el.contentEditable = true;
                }
            });
        } else {
            // Default text snippet
            snippet.contentEditable = true;
            snippet.innerHTML = controls + '<p>Edit this text...</p>';
        }
        
        return snippet;
    }

    createBlock(template = null) {
        const block = document.createElement('div');
        block.className = 'editor-block';
        block.style.position = 'relative';
        block.draggable = true;  // Make blocks draggable
        
        // Add block controls
        const controls = `
            <span class="drag-handle">⋮⋮</span>
            <button class="edit-icon" title="Edit Styles">✏️</button>
            <button class="settings-icon" title="Column Settings">⚙️</button>
            <button class="code-icon" title="Edit HTML">&lt;/&gt;</button>
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
        
        return block;
    }
    
    setupViewportControls() {
        // Setup viewport control buttons
        document.getElementById('mobile-viewport').addEventListener('click', () => this.setViewportSize('375px'));
        document.getElementById('tablet-viewport').addEventListener('click', () => this.setViewportSize('768px'));
        document.getElementById('desktop-viewport').addEventListener('click', () => this.setViewportSize('100%'));
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
        });
    }
    
    setViewportSize(width) {
        this.editableArea.style.maxWidth = width;
        this.editableArea.style.margin = width === '100%' ? '0' : '0 auto';
        
        // Update active button
        document.querySelectorAll('.viewport-btn').forEach(btn => btn.classList.remove('active'));
        if (width === '375px') {
            document.getElementById('mobile-viewport').classList.add('active');
        } else if (width === '768px') {
            document.getElementById('tablet-viewport').classList.add('active');
        } else {
            document.getElementById('desktop-viewport').classList.add('active');
        }
    }
}