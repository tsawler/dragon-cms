export class ModalDragger {
    constructor() {
        this.isDragging = false;
        this.currentModal = null;
        this.startX = 0;
        this.startY = 0;
        this.startLeft = 0;
        this.startTop = 0;
        this.init();
    }

    init() {
        // Add event listeners for all modal headers
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Prevent text selection while dragging
        document.addEventListener('selectstart', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        });
    }

    handleMouseDown(e) {
        const modalHeader = e.target.closest('.modal-header');
        if (!modalHeader) return;

        // Don't drag if clicking on close button
        if (e.target.closest('.modal-close')) return;

        const modalContent = modalHeader.closest('.modal-content');
        if (!modalContent) return;

        this.isDragging = true;
        this.currentModal = modalContent;
        
        // Record starting positions
        this.startX = e.clientX;
        this.startY = e.clientY;
        
        // Get the current position of the modal
        const rect = modalContent.getBoundingClientRect();
        this.startLeft = rect.left;
        this.startTop = rect.top;
        
        // Add dragging class and set initial position
        modalContent.classList.add('dragging', 'dragged');
        modalContent.style.left = this.startLeft + 'px';
        modalContent.style.top = this.startTop + 'px';
        
        // Prevent text selection
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging || !this.currentModal) return;

        // Calculate new position
        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;
        
        let newLeft = this.startLeft + deltaX;
        let newTop = this.startTop + deltaY;
        
        // Keep modal within viewport bounds
        const modalRect = this.currentModal.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Constrain to viewport
        newLeft = Math.max(10, Math.min(newLeft, viewportWidth - modalRect.width - 10));
        newTop = Math.max(10, Math.min(newTop, viewportHeight - modalRect.height - 10));
        
        // Apply new position
        this.currentModal.style.left = newLeft + 'px';
        this.currentModal.style.top = newTop + 'px';
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;

        this.isDragging = false;
        
        if (this.currentModal) {
            // Remove dragging class but keep dragged class to maintain position
            this.currentModal.classList.remove('dragging');
            // Keep the dragged class so it stays absolutely positioned
            this.currentModal = null;
        }
    }

    // Method to reset a modal's position to center
    resetModalPosition(modalContent) {
        modalContent.style.left = '';
        modalContent.style.top = '';
        modalContent.classList.remove('dragging', 'dragged');
    }

    // Method to make all modals draggable (call this after adding new modals)
    makeModalsDraggable() {
        // This is handled automatically by the event delegation
        // but can be called to refresh if needed
    }
}