export class ColumnResizer {
    constructor(editor) {
        this.editor = editor;
        this.isResizing = false;
        this.currentDivider = null;
        this.leftColumn = null;
        this.rightColumn = null;
        this.startX = 0;
        this.leftStartWidth = 0;
        this.rightStartWidth = 0;
        this.containerWidth = 0;
        this.setupInProgress = false;
        
        this.init();
    }
    
    init() {
        // Add or update resize dividers when DOM changes
        // Initial setup after a delay to ensure DOM is ready
        setTimeout(() => {
            this.setupResizeDividers();
        }, 500);
        
        // Listen for mouse events
        document.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Add global function for testing
        window.debugColumnResizer = () => {
            this.setupResizeDividers();
        };
        
        // Also add a function to inspect current state
        window.inspectColumns = () => {
            const allElements = this.editor.editableArea.querySelectorAll('*');
            allElements.forEach(element => {
                const columns = element.querySelectorAll(':scope > .column');
                if (columns.length > 0) {
                }
            });
        };
        
        // Add function to create test columns for debugging
        window.createTestColumns = () => {
            const editableArea = this.editor.editableArea;
            const container = document.createElement('div');
            container.className = 'column-container';
            container.style.cssText = 'display: flex; gap: 20px; margin: 20px; border: 2px solid red;';
            
            for (let i = 0; i < 2; i++) {
                const column = document.createElement('div');
                column.className = 'column';
                column.style.cssText = 'flex: 1; min-height: 100px; background: lightblue; border: 1px solid blue;';
                column.innerHTML = `<p>Test Column ${i + 1}</p>`;
                container.appendChild(column);
            }
            
            // Clear existing content and add test columns
            editableArea.innerHTML = '';
            editableArea.appendChild(container);
            
            // Set up resizers after creating columns
            setTimeout(() => {
                this.setupResizeDividers();
            }, 100);
        };
    }
    
    setupResizeDividers() {
        // Prevent recursive calls
        if (this.setupInProgress) return;
        this.setupInProgress = true;
        
        // Find all elements that contain multiple .column children
        const allElements = document.querySelectorAll('*');
        const containers = [];
        
        allElements.forEach(element => {
            const columns = element.querySelectorAll(':scope > .column');
            if (columns.length > 1) {
                containers.push(element);
            }
        });
        
        containers.forEach(container => {
            const columns = container.querySelectorAll('.column');
            
            // Remove existing dividers first
            const existingDividers = container.querySelectorAll('.column-resize-divider');
            existingDividers.forEach(d => d.remove());
            
            // Make container relative for absolute positioning
            container.style.position = 'relative';
            
            // Add dividers between columns (in edit mode only)
            if (this.editor && this.editor.currentMode === 'edit' && columns.length > 1) {
                for (let i = 0; i < columns.length - 1; i++) {
                    const divider = document.createElement('div');
                    divider.className = 'column-resize-divider';
                    divider.dataset.leftIndex = i;
                    divider.dataset.rightIndex = i + 1;
                    
                    // Calculate position based on column positions
                    const leftColumn = columns[i];
                    const rightColumn = columns[i + 1];
                    
                    // Position divider in the container, not the column
                    container.appendChild(divider);
                    
                    // Position it between the columns
                    const updateDividerPosition = () => {
                        const leftRect = leftColumn.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const position = leftRect.right - containerRect.left; // Right edge of left column
                        divider.style.left = position + 'px';
                    };
                    
                    // Update position now and on resize
                    updateDividerPosition();
                    
                    // Store the update function for later use
                    divider.updatePosition = updateDividerPosition;
                }
            }
        });
        
        // Reset the flag
        this.setupInProgress = false;
    }
    
    handleMouseDown(e) {
        if (!e.target.classList.contains('column-resize-divider')) return;
        if (!this.editor || this.editor.currentMode !== 'edit') return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        this.currentDivider = e.target;
        
        // Find the container that holds this divider
        const container = this.currentDivider.parentNode;
        if (!container) {
            console.error('No container found for divider');
            this.isResizing = false;
            this.currentDivider = null;
            return;
        }
        
        // Get all columns in this container
        const allColumns = container.querySelectorAll('.column');
        const leftIndex = parseInt(this.currentDivider.dataset.leftIndex);
        const rightIndex = parseInt(this.currentDivider.dataset.rightIndex);
        
        this.leftColumn = allColumns[leftIndex];
        this.rightColumn = allColumns[rightIndex];
        
        if (!this.leftColumn || !this.rightColumn) {
            console.error('Could not find columns for resize');
            this.isResizing = false;
            this.currentDivider = null;
            this.leftColumn = null;
            this.rightColumn = null;
            return;
        }
        
        this.startX = e.clientX;
        this.leftStartWidth = this.leftColumn.offsetWidth;
        this.rightStartWidth = this.rightColumn.offsetWidth;
        this.containerWidth = container.offsetWidth;
        
        
        // Add resizing class for visual feedback
        document.body.classList.add('column-resizing');
        this.currentDivider.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }
    
    handleMouseMove(e) {
        if (!this.isResizing || !this.currentDivider) return;
        
        e.preventDefault();
        
        const deltaX = e.clientX - this.startX;
        
        // Calculate new widths in pixels (exact same logic as original)
        const newLeftWidth = this.leftStartWidth + deltaX;
        const newRightWidth = this.rightStartWidth - deltaX;
        
        // Minimum column width (50px) - check BEFORE applying
        const minWidth = 50;
        
        if (newLeftWidth >= minWidth && newRightWidth >= minWidth) {
            // Get the container and all columns
            const container = this.leftColumn.parentNode;
            const allColumns = Array.from(container.querySelectorAll('.column'));
            
            
            // For multi-column layouts, we need to ensure all columns fit
            if (allColumns.length === 2) {
                // For two columns, they should total 100%
                const totalWidth = newLeftWidth + newRightWidth;
                const leftPercent = (newLeftWidth / totalWidth) * 100;
                const rightPercent = (newRightWidth / totalWidth) * 100;
                
                this.leftColumn.style.flex = `0 0 ${leftPercent}%`;
                this.rightColumn.style.flex = `0 0 ${rightPercent}%`;
                
            } else {
                // For 3+ columns, we need to calculate all column percentages
                const containerRect = container.getBoundingClientRect();
                const containerWidth = containerRect.width;
                const gap = 20; // Gap between columns in pixels
                const totalGaps = gap * (allColumns.length - 1);
                const availableWidth = containerWidth - totalGaps;
                
                // Calculate total width of all columns with the resize
                let totalColumnsWidth = 0;
                const leftIndex = parseInt(this.currentDivider.dataset.leftIndex);
                const rightIndex = parseInt(this.currentDivider.dataset.rightIndex);
                
                allColumns.forEach((col, index) => {
                    if (index === leftIndex) {
                        totalColumnsWidth += newLeftWidth;
                    } else if (index === rightIndex) {
                        totalColumnsWidth += newRightWidth;
                    } else {
                        const rect = col.getBoundingClientRect();
                        totalColumnsWidth += rect.width;
                    }
                });
                
                // Calculate percentages for each column
                allColumns.forEach((col, index) => {
                    let width;
                    if (index === leftIndex) {
                        width = newLeftWidth;
                    } else if (index === rightIndex) {
                        width = newRightWidth;
                    } else {
                        const rect = col.getBoundingClientRect();
                        width = rect.width;
                    }
                    
                    // Calculate percentage based on available width
                    const percent = (width / totalColumnsWidth) * ((availableWidth / containerWidth) * 100);
                    col.style.flex = `0 0 ${percent}%`;
                });
                
            }
            
            // Update divider position visually during drag
            if (this.currentDivider && this.currentDivider.updatePosition) {
                // Use requestAnimationFrame for smooth visual updates
                requestAnimationFrame(() => {
                    if (this.currentDivider && this.currentDivider.updatePosition) {
                        this.currentDivider.updatePosition();
                    }
                });
            }
        } else {
        }
    }
    
    handleMouseUp(e) {
        if (!this.isResizing) return;
        
        this.isResizing = false;
        document.body.classList.remove('column-resizing');
        
        if (this.currentDivider) {
            this.currentDivider.classList.remove('active');
        }
        
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Save state after resize
        if (this.editor && this.editor.stateHistory) {
            this.editor.stateHistory.saveState();
        }
        
        // Clean up references
        this.currentDivider = null;
        this.leftColumn = null;
        this.rightColumn = null;
    }
    
    
    refresh() {
        // Call this when columns are added/removed or mode changes
        // Use setTimeout to ensure DOM is fully rendered
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = setTimeout(() => {
            this.setupResizeDividers();
        }, 100);
    }
}