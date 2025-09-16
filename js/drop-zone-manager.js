/**
 * DropZoneManager - Handles all drag and drop operations
 * Extracted from setupDropZone method in editor-core.js to simplify the code
 */

export class DropZoneManager {
    constructor(editor) {
        this.editor = editor;
        this.editableArea = editor.editableArea;
        this.stateHistory = editor.stateHistory;

        // State tracking - expose these on the editor for compatibility
        this.activeExistingDrag = null;
        this.currentDragOperation = null;
        this.currentTargetBlock = null;
        this.originalPosition = null;

        // Visual elements
        this.currentInsertionLine = null;
        this.currentDropOverlay = null;

        // Expose necessary properties on editor for backward compatibility
        editor.activeExistingDrag = this.activeExistingDrag;
        editor.currentDragOperation = this.currentDragOperation;
        editor.currentTargetBlock = this.currentTargetBlock;
        editor.originalPosition = this.originalPosition;
    }

    /**
     * Initialize drag and drop functionality
     */
    setup() {
        this.setupDragStart();
        this.setupDragOver();
        this.setupDragLeave();
        this.setupDrop();
    }

    /**
     * Handle drag start events
     */
    setupDragStart() {
        this.editableArea.addEventListener('dragstart', (e) => {
            const draggedElement = this.findDraggedElement(e.target);

            if (draggedElement) {
                this.handleExistingElementDragStart(e, draggedElement);
            }
        });

        // Handle drag end to clean up states
        this.editableArea.addEventListener('dragend', (e) => {
            const draggedElement = e.target;
            if (draggedElement) {
                // Clear drag handle flag
                delete draggedElement.dataset.dragFromHandle;
                // Clear dragging class
                draggedElement.classList.remove('dragging-element');
            }

            // Clear current drag operation
            this.currentDragOperation = null;
            this.activeExistingDrag = null;
            this.currentTargetBlock = null;

            // Clear visual indicators
            this.clearVisualIndicators();
        });
    }

    /**
     * Handle drag over events - show visual indicators
     */
    setupDragOver() {
        this.editableArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.handleDragOver(e);
        });
    }

    /**
     * Handle drag leave events - clean up visual indicators
     */
    setupDragLeave() {
        this.editableArea.addEventListener('dragleave', (e) => {
            this.handleDragLeave(e);
        });
    }

    /**
     * Handle drop events - perform the actual drop operation
     */
    setupDrop() {
        this.editableArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.handleDrop(e);
        });
    }

    /**
     * Find the element being dragged (block, snippet, or section)
     */
    findDraggedElement(target) {
        return target.classList.contains('editor-block') ||
               target.classList.contains('editor-snippet') ||
               target.classList.contains('editor-section')
            ? target
            : target.closest('.editor-block, .editor-snippet, .editor-section');
    }

    /**
     * Handle drag start for existing elements
     */
    handleExistingElementDragStart(e, draggedElement) {
        // Save state before moving existing elements
        this.stateHistory.saveState();

        // Check if drag was initiated from handle
        if (draggedElement.dataset.dragFromHandle !== 'true') {
            e.preventDefault();
            return;
        }

        // Store original position for potential restoration
        this.originalPosition = {
            parent: draggedElement.parentElement,
            nextSibling: draggedElement.nextElementSibling
        };

        // Mark as dragging and set transfer data
        draggedElement.classList.add('dragging-element');
        this.activeExistingDrag = draggedElement;
        this.editor.activeExistingDrag = draggedElement; // Keep synchronized
        e.dataTransfer.setData('text/html', draggedElement.outerHTML);
        e.dataTransfer.effectAllowed = 'move';

        // Store drag operation info
        this.currentDragOperation = {
            type: 'existing',
            element: draggedElement,
            elementType: this.getElementType(draggedElement)
        };
        this.editor.currentDragOperation = this.currentDragOperation; // Keep synchronized
    }

    /**
     * Get the type of element (block, snippet, section)
     */
    getElementType(element) {
        if (element.classList.contains('editor-block')) return 'block';
        if (element.classList.contains('editor-snippet')) return 'snippet';
        if (element.classList.contains('editor-section')) return 'section';
        return null;
    }

    /**
     * Handle drag over - show visual feedback
     */
    handleDragOver(e) {
        const dragData = this.getCurrentDragData(e);
        if (!dragData) return;

        const { elementType, isExisting } = dragData;
        const targetBlock = this.findTargetBlock(e.target, elementType);

        // Set appropriate drag effect
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = isExisting ? 'move' : 'copy';
        }

        // Clear previous indicators
        this.clearVisualIndicators();

        if (elementType === 'snippet') {
            this.handleSnippetDragOver(e, targetBlock);
        } else if (elementType === 'block') {
            this.handleBlockDragOver(e, isExisting);
        } else if (elementType === 'section') {
            this.handleSectionDragOver(e, isExisting);
        }
    }

    /**
     * Handle snippet drag over
     */
    handleSnippetDragOver(e, targetBlock) {
        this.currentTargetBlock = targetBlock;
        this.editor.currentTargetBlock = targetBlock; // Keep synchronized
        if (!targetBlock) return;

        targetBlock.classList.add('valid-drop-target');

        // For columns, look for direct children snippets
        // For editor-blocks, also look for direct children snippets
        const snippets = [...targetBlock.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
        if (snippets.length > 0) {
            const insertionPoint = this.getSnippetInsertionPointWithPosition(targetBlock, e.clientY);
            if (insertionPoint) {
                this.currentInsertionLine = this.createInsertionLine(insertionPoint);
                targetBlock.style.position = 'relative';
                targetBlock.appendChild(this.currentInsertionLine);
            }
        } else {
            // No existing snippets - show overlay
            if (!targetBlock.querySelector('.drop-zone-overlay')) {
                this.currentDropOverlay = document.createElement('div');
                this.currentDropOverlay.className = 'drop-zone-overlay snippet-drop-zone-overlay';
                targetBlock.appendChild(this.currentDropOverlay);
            }
        }
    }

    /**
     * Handle block drag over
     */
    handleBlockDragOver(e, isExisting) {
        const sectionContent = e.target.closest('.section-content');
        if (sectionContent) {
            this.handleBlockIntoSectionDragOver(e, sectionContent, isExisting);
        } else {
            this.handleBlockIntoMainAreaDragOver(e, isExisting);
        }
    }

    /**
     * Handle block drag over into section
     */
    handleBlockIntoSectionDragOver(e, sectionContent, isExisting) {
        sectionContent.classList.add('valid-drop-target');
        const blocks = [...sectionContent.querySelectorAll(':scope > .editor-block:not(.dragging-element)')];

        if (blocks.length > 0) {
            const insertionPoint = this.getInsertionPoint(sectionContent, e.clientY);
            if (insertionPoint) {
                this.currentInsertionLine = this.createInsertionLine(insertionPoint);
                sectionContent.style.position = 'relative';
                sectionContent.appendChild(this.currentInsertionLine);
            }
        } else {
            // No existing blocks in section - show drop overlay
            if (!sectionContent.querySelector('.drop-zone-overlay')) {
                this.currentDropOverlay = document.createElement('div');
                this.currentDropOverlay.className = 'drop-zone-overlay block-drop-zone-overlay';
                sectionContent.appendChild(this.currentDropOverlay);
            }
        }
    }

    /**
     * Handle block drag over into main area
     */
    handleBlockIntoMainAreaDragOver(e, isExisting) {
        this.editableArea.classList.add('valid-drop-target');
        const blocks = [...this.editableArea.querySelectorAll(':scope > .editor-block:not(.dragging-element), :scope > .editor-section:not(.dragging-element)')];

        if (blocks.length > 0) {
            const insertionPoint = this.getInsertionPoint(this.editableArea, e.clientY);
            if (insertionPoint) {
                this.currentInsertionLine = this.createInsertionLine(insertionPoint);
                this.editableArea.style.position = 'relative';
                this.editableArea.appendChild(this.currentInsertionLine);
            }
        } else {
            // No existing blocks/sections - show drop overlay
            if (!this.editableArea.querySelector('.drop-zone-overlay')) {
                this.currentDropOverlay = document.createElement('div');
                this.currentDropOverlay.className = 'drop-zone-overlay block-drop-zone-overlay';
                this.editableArea.appendChild(this.currentDropOverlay);
            }
        }
    }

    /**
     * Handle section drag over
     */
    handleSectionDragOver(e, isExisting) {
        this.editableArea.classList.add('valid-drop-target');
        const sections = [...this.editableArea.querySelectorAll(':scope > .editor-section:not(.dragging-element), :scope > .editor-block:not(.dragging-element)')];

        if (sections.length > 0) {
            const insertionPoint = this.getInsertionPoint(this.editableArea, e.clientY);
            if (insertionPoint) {
                this.currentInsertionLine = this.createInsertionLine(insertionPoint);
                this.editableArea.style.position = 'relative';
                this.editableArea.appendChild(this.currentInsertionLine);
            }
        } else {
            // No existing sections/blocks - show drop overlay
            if (!this.editableArea.querySelector('.drop-zone-overlay')) {
                this.currentDropOverlay = document.createElement('div');
                this.currentDropOverlay.className = 'drop-zone-overlay section-drop-zone-overlay';
                this.editableArea.appendChild(this.currentDropOverlay);
            }
        }
    }

    /**
     * Handle drag leave
     */
    handleDragLeave(e) {
        // Only clear if we're leaving the editable area completely
        if (!this.editableArea.contains(e.relatedTarget)) {
            this.clearVisualIndicators();
        }
    }

    /**
     * Handle drop events
     */
    handleDrop(e) {
        const dragData = this.getCurrentDragData(e);
        if (!dragData) return;

        const { elementType, isExisting } = dragData;

        if (elementType === 'snippet') {
            this.handleSnippetDrop(e, isExisting);
        } else if (elementType === 'block') {
            this.handleBlockDrop(e, isExisting);
        } else if (elementType === 'section') {
            this.handleSectionDrop(e, isExisting);
        }

        // Clean up
        this.clearVisualIndicators();
        this.currentDragOperation = null;
    }

    /**
     * Handle snippet drop
     */
    handleSnippetDrop(e, isExisting) {
        const targetBlock = this.currentTargetBlock;
        if (!targetBlock) return;

        let snippetElement;

        if (isExisting) {
            snippetElement = this.activeExistingDrag;
            if (snippetElement) {
                snippetElement.classList.remove('dragging-element');
                this.activeExistingDrag = null;
            }
        } else {
            // First try JSON format
            const snippetData = e.dataTransfer.getData('application/json');
            if (snippetData) {
                try {
                    const data = JSON.parse(snippetData);
                    snippetElement = this.editor.createSnippet(data.type, data.template);
                } catch (err) {
                    console.warn('Failed to parse snippet JSON data:', err);
                }
            }

            // If no JSON data, try individual fields (from snippet panel)
            if (!snippetElement) {
                const template = e.dataTransfer.getData('template') || e.dataTransfer.getData('text/html');
                const itemId = e.dataTransfer.getData('itemId');
                if (template) {
                    snippetElement = this.editor.createSnippet(itemId || 'custom', template);
                }
            }
        }

        if (snippetElement) {
            // Remove any dragging classes before insertion
            snippetElement.classList.remove('dragging-element', 'dragging-item', 'snippet-item', 'dragging');

            const afterElement = this.getDragAfterElement(targetBlock, e.clientY);
            if (afterElement == null) {
                targetBlock.appendChild(snippetElement);
            } else {
                targetBlock.insertBefore(snippetElement, afterElement);
            }

            // Comprehensive fix for visual issues
            snippetElement.style.setProperty('opacity', '1', 'important');
            snippetElement.style.setProperty('visibility', 'visible', 'important');
            snippetElement.style.setProperty('filter', 'none', 'important');
            snippetElement.style.setProperty('transform', 'none', 'important');
            snippetElement.style.setProperty('transition', 'none', 'important');

            // Remove any background colors that might make it look faded
            snippetElement.style.removeProperty('background');
            snippetElement.style.removeProperty('background-color');

            // Fix text colors - ensure they're not light gray
            const textElements = snippetElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div, a, li');
            textElements.forEach(el => {
                const computedColor = window.getComputedStyle(el).color;
                // If the color is the problematic light gray, reset it
                if (computedColor === 'rgb(160, 174, 192)' || computedColor === '#a0aec0') {
                    el.style.setProperty('color', '#1f2937', 'important'); // Dark gray instead
                }
            });

            // Force a reflow to ensure styles are applied
            snippetElement.offsetHeight;

            // Also clear any drop target classes from parents
            if (snippetElement.parentElement) {
                snippetElement.parentElement.classList.remove('valid-drop-target');
            }

            if (!isExisting) {
                this.stateHistory.saveState();
            }
        }
    }

    /**
     * Handle block drop
     */
    handleBlockDrop(e, isExisting) {
        const sectionContent = e.target.closest('.section-content');

        if (sectionContent) {
            this.handleBlockDropIntoSection(e, sectionContent, isExisting);
        } else {
            this.handleBlockDropIntoMainArea(e, isExisting);
        }
    }

    /**
     * Handle block drop into section
     */
    handleBlockDropIntoSection(e, sectionContent, isExisting) {
        const closestSection = sectionContent.closest('.editor-section');

        // Check if this section is empty and remove placeholder content
        const isEmptySection = closestSection && closestSection.classList.contains('empty-section');
        if (isEmptySection) {
            // Remove placeholder text from empty section
            const placeholderText = sectionContent.querySelector('p');
            if (placeholderText && placeholderText.textContent.includes('Drag blocks')) {
                placeholderText.remove();
            }
            // Reset section-content styling to allow proper block stacking
            sectionContent.style.display = '';
            sectionContent.style.alignItems = '';
            sectionContent.style.justifyContent = '';
            // Remove empty-section class since it's no longer empty
            closestSection.classList.remove('empty-section');
        }

        let blockElement;

        if (isExisting) {
            blockElement = this.activeExistingDrag;
            if (blockElement) {
                blockElement.classList.remove('dragging-element');
                this.activeExistingDrag = null;
            }
        } else {
            // First try JSON format
            const blockData = e.dataTransfer.getData('application/json');
            if (blockData) {
                try {
                    const data = JSON.parse(blockData);
                    blockElement = this.editor.createBlock(data.template);
                } catch (err) {
                    console.warn('Failed to parse block JSON data:', err);
                }
            }

            // If no JSON data, try individual fields (from snippet panel)
            if (!blockElement) {
                const template = e.dataTransfer.getData('template') || e.dataTransfer.getData('text/html');
                if (template) {
                    blockElement = this.editor.createBlock(template);
                }
            }
        }

        if (blockElement) {
            const afterElement = this.getDragAfterElement(sectionContent, e.clientY);
            if (afterElement == null) {
                sectionContent.appendChild(blockElement);
            } else {
                sectionContent.insertBefore(blockElement, afterElement);
            }

            if (!isExisting) {
                this.stateHistory.saveState();
            }
        }
    }

    /**
     * Handle block drop into main area
     */
    handleBlockDropIntoMainArea(e, isExisting) {
        let blockElement;

        if (isExisting) {
            blockElement = this.activeExistingDrag;
            if (blockElement) {
                blockElement.classList.remove('dragging-element');
                this.activeExistingDrag = null;
            }
        } else {
            // First try JSON format
            const blockData = e.dataTransfer.getData('application/json');
            if (blockData) {
                try {
                    const data = JSON.parse(blockData);
                    blockElement = this.editor.createBlock(data.template);
                } catch (err) {
                    console.warn('Failed to parse block JSON data:', err);
                }
            }

            // If no JSON data, try individual fields (from snippet panel)
            if (!blockElement) {
                const template = e.dataTransfer.getData('template') || e.dataTransfer.getData('text/html');
                if (template) {
                    blockElement = this.editor.createBlock(template);
                }
            }
        }

        if (blockElement) {
            const afterElement = this.getDragAfterElement(this.editableArea, e.clientY);
            if (afterElement == null) {
                this.editableArea.appendChild(blockElement);
            } else {
                this.editableArea.insertBefore(blockElement, afterElement);
            }

            if (!isExisting) {
                this.stateHistory.saveState();
            }
        }
    }

    /**
     * Handle section drop
     */
    handleSectionDrop(e, isExisting) {
        let sectionElement;

        if (isExisting) {
            sectionElement = this.activeExistingDrag;
            if (sectionElement) {
                sectionElement.classList.remove('dragging-element');
                this.activeExistingDrag = null;
            }
        } else {
            // First try JSON format
            const sectionData = e.dataTransfer.getData('application/json');
            if (sectionData) {
                try {
                    const data = JSON.parse(sectionData);
                    sectionElement = this.editor.createSection(data.template);
                } catch (err) {
                    console.warn('Failed to parse section JSON data:', err);
                }
            }

            // If no JSON data, try individual fields (from snippet panel)
            if (!sectionElement) {
                const template = e.dataTransfer.getData('template') || e.dataTransfer.getData('text/html');
                if (template) {
                    sectionElement = this.editor.createSection(template);
                }
            }
        }

        if (sectionElement) {
            const afterElement = this.getDragAfterElement(this.editableArea, e.clientY);
            if (afterElement == null) {
                this.editableArea.appendChild(sectionElement);
            } else {
                this.editableArea.insertBefore(sectionElement, afterElement);
            }

            if (!isExisting) {
                this.stateHistory.saveState();
            }
        }
    }

    /**
     * Get current drag data
     */
    getCurrentDragData(e) {
        if (this.currentDragOperation) {
            return {
                elementType: this.currentDragOperation.elementType,
                isExisting: this.currentDragOperation.type === 'existing'
            };
        }

        // Try to determine from dataTransfer - first check JSON format
        const snippetData = e.dataTransfer.getData('application/json');
        if (snippetData) {
            try {
                const data = JSON.parse(snippetData);
                return {
                    elementType: data.elementType || (data.type ? 'snippet' : 'unknown'),
                    isExisting: false
                };
            } catch (err) {
                console.warn('Failed to parse drag data:', err);
            }
        }

        // Check individual dataTransfer fields (used by snippet panel)
        const elementType = e.dataTransfer.getData('elementType');
        if (elementType) {
            return {
                elementType: elementType,
                isExisting: false
            };
        }

        return null;
    }

    /**
     * Find target block for snippet drops
     */
    findTargetBlock(target, elementType) {
        if (elementType !== 'snippet') return null;

        // First check if we're directly over a column (for multi-column layouts)
        let targetBlock = target.closest('.column');

        // If not in a column, look for an editor-block
        if (!targetBlock) {
            targetBlock = target.closest('.editor-block');
        }

        // If still no target, check if we're in a section content area
        if (!targetBlock) {
            const sectionContent = target.closest('.section-content');
            if (sectionContent) {
                // Try to find a block or column in the section
                targetBlock = sectionContent.querySelector('.editor-block, .column');
            }
        }

        return targetBlock;
    }

    /**
     * Clear all visual indicators
     */
    clearVisualIndicators() {
        // Remove valid-drop-target class from all elements
        document.querySelectorAll('.valid-drop-target').forEach(el => {
            el.classList.remove('valid-drop-target');
        });

        // Remove insertion lines
        if (this.currentInsertionLine) {
            this.currentInsertionLine.remove();
            this.currentInsertionLine = null;
        }

        // Remove all insertion lines
        document.querySelectorAll('.drop-insertion-line').forEach(line => {
            line.remove();
        });

        // Remove drop overlays
        if (this.currentDropOverlay) {
            this.currentDropOverlay.remove();
            this.currentDropOverlay = null;
        }

        // Remove all drop overlays
        document.querySelectorAll('.drop-zone-overlay').forEach(overlay => {
            overlay.remove();
        });

        // Don't clear currentTargetBlock here - it's needed for drop event
    }

    /**
     * Create visual insertion line
     */
    createInsertionLine(insertionPoint) {
        const line = document.createElement('div');
        line.className = 'drop-insertion-line';
        line.style.position = 'absolute';
        line.style.left = '0';
        line.style.right = '0';
        line.style.height = '3px';
        line.style.backgroundColor = '#3b82f6';
        line.style.zIndex = '1000';
        line.style.borderRadius = '2px';
        line.style.pointerEvents = 'none';
        line.style.top = insertionPoint.y + 'px';
        return line;
    }

    /**
     * Get insertion point for elements
     */
    getInsertionPoint(container, clientY) {
        const elements = [...container.children].filter(child =>
            !child.classList.contains('dragging-element') &&
            !child.classList.contains('insertion-line') &&
            !child.classList.contains('drop-zone-overlay')
        );

        if (elements.length === 0) return null;

        let closestElement = null;
        let closestDistance = Infinity;
        let insertBefore = false;

        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            const distance = Math.abs(clientY - elementCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestElement = element;
                insertBefore = clientY < elementCenter;
            }
        });

        if (closestElement) {
            const rect = closestElement.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            return {
                element: closestElement,
                y: insertBefore ? rect.top - containerRect.top - 2 : rect.bottom - containerRect.top + 2,
                insertBefore
            };
        }

        return null;
    }

    /**
     * Get snippet insertion point with position
     */
    getSnippetInsertionPointWithPosition(block, clientY) {
        const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];

        if (snippets.length === 0) return null;

        let closestSnippet = null;
        let closestDistance = Infinity;
        let insertBefore = false;

        snippets.forEach(snippet => {
            const rect = snippet.getBoundingClientRect();
            const snippetCenter = rect.top + rect.height / 2;
            const distance = Math.abs(clientY - snippetCenter);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestSnippet = snippet;
                insertBefore = clientY < snippetCenter;
            }
        });

        if (closestSnippet) {
            const rect = closestSnippet.getBoundingClientRect();
            const blockRect = block.getBoundingClientRect();
            return {
                element: closestSnippet,
                y: insertBefore ? rect.top - blockRect.top - 2 : rect.bottom - blockRect.top + 2,
                insertBefore
            };
        }

        return null;
    }

    /**
     * Get element to insert before based on Y position
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(':scope > *:not(.dragging-element):not(.insertion-line):not(.drop-zone-overlay)')];

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
}