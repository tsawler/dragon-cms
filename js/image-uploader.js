export class ImageUploader {
    constructor(editor) {
        this.editor = editor;
    }

    setupImageSnippet(snippet) {
        // Check if this is already a resizable image container (from saved content)
        const existingResizeContainer = snippet.querySelector('.image-resize-container');
        if (existingResizeContainer) {
            // Reattach handlers to existing resize container
            this.reattachImageHandlers(existingResizeContainer);
            return;
        }

        // Handle new image snippets with the simple container structure
        const imageContainer = snippet.querySelector('.image-container');
        const uploadZone = snippet.querySelector('.image-upload-zone');
        const image = snippet.querySelector('.editable-image');
        
        if (!uploadZone || !imageContainer) return;

        // Convert the default image to a resizable container immediately
        if (image) {
            image.onload = () => {
                this.convertToResizableContainer(snippet, image);
            };
            image.onerror = () => {
                this.convertToResizableContainer(snippet, image);
            };
            
            // If image is already loaded (cached), convert immediately
            if (image.complete) {
                this.convertToResizableContainer(snippet, image);
            }
        }

        // Show upload zone on hover
        imageContainer.addEventListener('mouseenter', () => {
            uploadZone.style.display = 'flex';
        });

        imageContainer.addEventListener('mouseleave', () => {
            uploadZone.style.display = 'none';
        });

        // Handle click to upload new image
        uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleFileSelect(e, snippet);
            input.click();
        });

        // Handle drag and drop
        imageContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
            uploadZone.style.display = 'flex';
        });

        imageContainer.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
            uploadZone.style.display = 'none';
        });

        imageContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            uploadZone.style.display = 'none';
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
            const existingImg = snippet.querySelector('.editable-image');
            const imageContainer = snippet.querySelector('.image-container');
            
            if (existingImg && imageContainer) {
                // Update the existing image source
                existingImg.src = e.target.result;
                
                // Remove the simple image container and replace with resize container
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // Create resize container
                const resizeContainer = this.createImageResizeContainer(img);
                
                // Replace the image container with the resize container
                imageContainer.parentNode.replaceChild(resizeContainer, imageContainer);
            } else {
                // Fallback to old behavior for existing images
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
                
                const existingContainer = snippet.querySelector('.image-resize-container');
                if (existingContainer) {
                    existingContainer.remove();
                }
                
                snippet.appendChild(resizeContainer);
            }
            
            this.editor.stateHistory.saveState();
        };
        reader.readAsDataURL(file);
    }

    reattachImageHandlers(container) {
        // Ensure the browse icon exists and has proper styling
        let browseIcon = container.querySelector('.image-browse-icon');
        if (!browseIcon) {
            // Create browse icon if it doesn't exist
            browseIcon = document.createElement('div');
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
            container.appendChild(browseIcon);
        }

        // Add hover effects to browse icon
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

        // Add click handler to select/deselect image
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectImage(container);
        });
        
        // Add resize handlers
        this.addResizeHandlers(container);
    }

    convertToResizableContainer(snippet, image) {
        
        // Create new image element for the resize container
        const img = document.createElement('img');
        img.src = image.src;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        // Create resize container
        const resizeContainer = this.createImageResizeContainer(img);
        
        // Replace the image container with the resize container
        const imageContainer = snippet.querySelector('.image-container');
        if (imageContainer) {
            imageContainer.parentNode.replaceChild(resizeContainer, imageContainer);
        }
        
        // Save state
        if (this.editor && this.editor.stateHistory) {
            this.editor.stateHistory.saveState();
        }
    }
    
    createImageResizeContainer(img) {
        // Create container
        const container = document.createElement('div');
        container.className = 'image-resize-container align-center'; // Default to center alignment
        
        // Ensure mobile-friendly responsive behavior
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.width = 'auto';
        
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
        // Deselect all other images
        document.querySelectorAll('.image-resize-container.selected').forEach(el => {
            if (el !== container) {
                el.classList.remove('selected');
                // Hide browse icon on deselected images
                const browseIcon = el.querySelector('.image-browse-icon');
                if (browseIcon) {
                    browseIcon.style.display = 'none';
                }
            }
        });
        
        // Toggle selection of this image
        const wasSelected = container.classList.contains('selected');
        container.classList.toggle('selected');
        
        // Show/hide browse icon based on selection and edit mode
        const browseIcon = container.querySelector('.image-browse-icon');
        if (browseIcon) {
            const isInEditMode = this.editor.currentMode === 'edit';
            if (container.classList.contains('selected') && isInEditMode) {
                browseIcon.style.display = 'flex';
            } else {
                browseIcon.style.display = 'none';
            }
        }
        
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

    browseForImage(container) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.replaceImageInContainer(container, file);
            }
        };
        input.click();
    }

    replaceImageInContainer(container, file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = container.querySelector('img');
            if (img) {
                // Reset any existing inline width/height styles that might cause distortion
                img.style.width = '';
                img.style.height = '';
                
                // Set the new image source
                img.src = e.target.result;
                
                // Reset container dimensions to let image show at natural aspect ratio
                container.style.width = '';
                container.style.height = '';
                
                // Ensure max-width constraint is maintained for responsive behavior
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                
                // Save state
                if (this.editor && this.editor.stateHistory) {
                    this.editor.stateHistory.saveState();
                }
            }
        };
        reader.readAsDataURL(file);
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