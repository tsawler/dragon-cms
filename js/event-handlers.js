/**
 * Event Handler Management for DragonCMS Editor
 * Provides clean, maintainable event handling with separation of concerns
 */

/**
 * Drag State Manager - Manages drag and drop state without complex flags
 */
export class DragStateManager {
    constructor() {
        this.isDraggingFromHandle = false;
        this.draggedElement = null;
    }

    startDragFromHandle(element) {
        this.isDraggingFromHandle = true;
        this.draggedElement = element;
    }

    endDrag() {
        this.isDraggingFromHandle = false;
        this.draggedElement = null;
    }

    isDragFromHandle(element) {
        return this.isDraggingFromHandle && this.draggedElement === element;
    }
}

/**
 * Event Handler Registry - Centralizes all event handlers
 */
export class EventHandlerRegistry {
    constructor(editor) {
        this.editor = editor;
        this.dragState = new DragStateManager();
        this.handlers = new Map();
        this.initializeHandlers();
    }

    /**
     * Initialize all handler mappings
     */
    initializeHandlers() {
        // Button handlers for different control types
        this.handlers.set('edit-icon', this.handleEditIcon.bind(this));
        this.handlers.set('gear-icon', this.handleGearIcon.bind(this));
        this.handlers.set('delete-icon', this.handleDeleteIcon.bind(this));
        this.handlers.set('code-icon', this.handleCodeIcon.bind(this));
        this.handlers.set('settings-icon', this.handleSettingsIcon.bind(this));
    }

    /**
     * Setup drag functionality for an element
     */
    setupDragHandlers(element) {
        const dragHandle = element.querySelector('.drag-handle');

        // Check for existing setup using the original data attribute name for compatibility
        if (!dragHandle || element.dataset.dragListenersAttached === 'true') {
            return;
        }

        // Don't make elements draggable in display mode
        if (this.editor.currentMode === 'display') {
            element.draggable = false;
            return;
        }

        // Mark element as draggable
        element.draggable = true;
        dragHandle.style.cursor = 'move';

        // Handle drag initiation from handle
        this.addDragHandleListeners(element, dragHandle);

        // Mark as setup using the original attribute name for compatibility
        element.dataset.dragListenersAttached = 'true';
    }

    /**
     * Add drag handle specific listeners
     */
    addDragHandleListeners(element, dragHandle) {
        // Start drag from handle
        dragHandle.addEventListener('mousedown', (e) => {
            // Prevent dragging in display mode
            if (this.editor.currentMode === 'display') {
                e.preventDefault();
                return;
            }

            this.dragState.startDragFromHandle(element);
            element.dataset.dragFromHandle = 'true'; // Keep for compatibility
            e.stopPropagation();
        });

        // End drag
        element.addEventListener('dragend', () => {
            this.dragState.endDrag();
            delete element.dataset.dragFromHandle;
        });

        // Clean up if drag doesn't start
        const cleanupHandler = () => {
            setTimeout(() => {
                if (!element.classList.contains('dragging-element')) {
                    this.dragState.endDrag();
                    delete element.dataset.dragFromHandle;
                }
            }, 10);
        };

        document.addEventListener('mouseup', cleanupHandler, { once: true });
    }

    /**
     * Setup click delegation for control buttons
     */
    setupClickDelegation(container) {
        // Instead of handling ALL clicks on the container, use more specific delegation
        // This prevents conflicts with FormattingToolbar and ImageUploader
        container.addEventListener('click', (e) => {
            // Only handle if the click is specifically on control icons or content buttons
            if (this.isContentButton(e.target) || this.findControlIcon(e.target)) {
                this.handleClick(e);
            }
            // Otherwise, let other handlers (FormattingToolbar, ImageUploader) deal with it
        });
    }

    /**
     * Main click handler with delegation
     */
    handleClick(event) {
        // FIRST: Check if this is a content button click (not a control icon)
        if (this.isContentButton(event.target)) {
            this.handleContentButton(event);
            return;
        }

        // SECOND: Check if the clicked element or its parent is a control icon
        const controlIcon = this.findControlIcon(event.target);
        if (!controlIcon) {
            // If it's not a control icon, don't handle it - let other handlers deal with it
            return;
        }

        // Handle control icons
        this.handleControlIcon(event, controlIcon);
    }

    /**
     * Check if target is a content button
     */
    isContentButton(target) {
        return target.tagName === 'BUTTON' &&
               !target.classList.contains('edit-icon') &&
               !target.classList.contains('code-icon') &&
               !target.classList.contains('delete-icon') &&
               !target.classList.contains('settings-icon') &&
               !target.classList.contains('gear-icon');
    }

    /**
     * Handle content button clicks
     */
    handleContentButton(event) {
        const button = event.target;

        if (this.editor.currentMode === 'edit') {
            // Edit mode: Open button settings
            event.preventDefault();
            event.stopPropagation();
            if (this.editor.buttonSettingsModal) {
                this.editor.buttonSettingsModal.open(button);
            }
        } else if (this.editor.currentMode === 'display') {
            // Display mode: Navigate if URL exists
            const url = button.getAttribute('data-url');
            const target = button.getAttribute('data-target') || '_self';
            if (url) {
                event.preventDefault();
                window.open(url, target);
            }
        }
    }

    /**
     * Find control icon from event target
     */
    findControlIcon(target) {
        return target.closest('.edit-icon, .code-icon, .delete-icon, .settings-icon, .gear-icon, .drag-handle');
    }

    /**
     * Handle control icon clicks
     */
    handleControlIcon(event, controlIcon) {
        event.preventDefault();
        event.stopPropagation();

        // Find the handler for this icon type
        for (const [className, handler] of this.handlers) {
            if (controlIcon.classList.contains(className)) {
                handler(controlIcon);
                break;
            }
        }
    }

    /**
     * Handler for edit icon clicks
     */
    handleEditIcon(icon) {
        const element = icon.closest('.editor-block, .editor-snippet');
        if (element && this.editor.styleEditorModal) {
            this.editor.styleEditorModal.open(element);
        }
    }

    /**
     * Handler for gear icon clicks
     */
    handleGearIcon(icon) {
        const section = icon.closest('.editor-section');
        if (section && this.editor.sectionSettingsModal) {
            this.editor.sectionSettingsModal.open(section);
        }
    }

    /**
     * Handler for delete icon clicks
     */
    handleDeleteIcon(icon) {
        const element = icon.closest('.editor-section, .editor-block, .editor-snippet');
        if (element) {
            this.editor.deleteElement(element);
        }
    }

    /**
     * Handler for code icon clicks
     */
    handleCodeIcon(icon) {
        const element = icon.closest('.editor-section, .editor-block, .editor-snippet');
        if (element) {
            this.editor.openCodeEditor(element);
        }
    }

    /**
     * Handler for settings icon clicks
     */
    handleSettingsIcon(icon) {
        const snippet = icon.closest('.editor-snippet');

        if (snippet && snippet.classList.contains('video-snippet')) {
            // Video snippet settings
            if (this.editor.videoSettingsModal) {
                this.editor.videoSettingsModal.open(snippet);
            }
        } else {
            // Other element settings
            const element = icon.closest('.editor-block, .editor-snippet');
            if (element) {
                this.editor.openElementSettings(element);
            }
        }
    }

    /**
     * Clean up all event listeners
     */
    cleanup() {
        this.handlers.clear();
        this.dragState = new DragStateManager();
    }
}

/**
 * Helper function to attach drag handle listeners (for backward compatibility)
 */
export function attachDragHandleListeners(element, editor) {
    if (!editor.eventHandlerRegistry) {
        editor.eventHandlerRegistry = new EventHandlerRegistry(editor);
    }
    editor.eventHandlerRegistry.setupDragHandlers(element);
}

/**
 * Helper function to setup click listeners (for backward compatibility)
 */
export function attachClickListeners(container, editor) {
    if (!editor.eventHandlerRegistry) {
        editor.eventHandlerRegistry = new EventHandlerRegistry(editor);
    }
    editor.eventHandlerRegistry.setupClickDelegation(container);
}