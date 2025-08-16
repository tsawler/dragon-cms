export class ImageUploader {
    constructor(editor) {
        this.editor = editor;
    }

    setupImageSnippet(snippet) {
        const uploadZone = snippet.querySelector('.image-upload-zone');
        if (!uploadZone) return;

        uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleFileSelect(e, snippet);
            input.click();
        });

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            this.handleFileDrop(e, snippet);
        });
    }

    handleFileSelect(e, snippet) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file, snippet);
        }
    }

    handleFileDrop(e, snippet) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.processImage(file, snippet);
        }
    }

    processImage(file, snippet) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            // Create resize container
            const resizeContainer = this.createImageResizeContainer(img);
            
            const uploadZone = snippet.querySelector('.image-upload-zone');
            if (uploadZone) {
                uploadZone.remove();
            }
            
            const existingImg = snippet.querySelector('img');
            const existingContainer = snippet.querySelector('.image-resize-container');
            if (existingContainer) {
                existingContainer.remove();
            } else if (existingImg) {
                existingImg.remove();
            }
            
            snippet.appendChild(resizeContainer);
            this.editor.stateHistory.saveState();
        };
        reader.readAsDataURL(file);
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
        // Deselect all other images
        document.querySelectorAll('.image-resize-container.selected').forEach(el => {
            if (el !== container) {
                el.classList.remove('selected');
            }
        });
        
        // Toggle selection of this image
        const wasSelected = container.classList.contains('selected');
        container.classList.toggle('selected');
        
        // Notify formatting toolbar if available
        const formattingToolbar = this.editor.formattingToolbar;
        if (formattingToolbar) {
            if (container.classList.contains('selected')) {
                formattingToolbar.selectedImageContainer = container;
                formattingToolbar.showAlignmentToolbar(container);
            } else {
                formattingToolbar.selectedImageContainer = null;
                formattingToolbar.hideAlignmentToolbar();
            }
        }
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
}