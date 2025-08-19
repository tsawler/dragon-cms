export class ButtonSettingsModal {
    constructor(editor) {
        this.editor = editor;
        this.targetButton = null;
        this.modal = null;
        this.sizePresets = {
            xs: { padding: '4px 8px', fontSize: '12px' },
            sm: { padding: '6px 12px', fontSize: '14px' },
            md: { padding: '10px 20px', fontSize: '16px' },
            lg: { padding: '12px 28px', fontSize: '18px' }
        };
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>Button Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="button-text">Button Text</label>
                        <input type="text" id="button-text" placeholder="Enter button text">
                    </div>
                    <div class="form-group">
                        <label for="button-url">Button URL</label>
                        <input type="url" id="button-url" placeholder="https://example.com">
                    </div>
                    <div class="form-group">
                        <label for="button-bg-color">Background Color</label>
                        <input type="color" id="button-bg-color" value="#3b82f6">
                    </div>
                    <div class="form-group">
                        <label for="button-text-color">Text Color</label>
                        <input type="color" id="button-text-color" value="#ffffff">
                    </div>
                    <div class="form-group">
                        <label for="button-border-radius">Border Radius: <span id="border-radius-value">4</span>px</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="range" id="button-border-radius" min="0" max="50" value="4" style="flex: 1;">
                            <input type="number" id="button-border-radius-number" min="0" max="50" value="4" style="width: 60px;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="button-size">Button Size</label>
                        <select id="button-size">
                            <option value="xs">Extra Small</option>
                            <option value="sm">Small</option>
                            <option value="md" selected>Medium</option>
                            <option value="lg">Large</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="button-target">Open in</label>
                        <select id="button-target">
                            <option value="_self">Same Window</option>
                            <option value="_blank">New Window</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn modal-cancel">Cancel</button>
                    <button class="btn btn-success modal-apply">Apply</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachListeners();
    }

    attachListeners() {
        const closeBtn = this.modal.querySelector('.modal-close');
        const cancelBtn = this.modal.querySelector('.modal-cancel');
        const applyBtn = this.modal.querySelector('.modal-apply');
        
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.cancel());
        applyBtn.addEventListener('click', () => this.applyChanges());
        
        // Live preview listeners
        const textInput = document.getElementById('button-text');
        const bgColorInput = document.getElementById('button-bg-color');
        const textColorInput = document.getElementById('button-text-color');
        const borderRadiusSlider = document.getElementById('button-border-radius');
        const borderRadiusNumber = document.getElementById('button-border-radius-number');
        const borderRadiusValue = document.getElementById('border-radius-value');
        
        // Text live preview
        textInput.addEventListener('input', (e) => {
            if (this.targetButton) {
                this.targetButton.textContent = e.target.value || 'Button';
            }
        });
        
        // Background color live preview
        bgColorInput.addEventListener('input', (e) => {
            if (this.targetButton) {
                this.targetButton.style.backgroundColor = e.target.value;
            }
        });
        
        // Text color live preview
        textColorInput.addEventListener('input', (e) => {
            if (this.targetButton) {
                this.targetButton.style.color = e.target.value;
            }
        });
        
        // Border radius live preview with slider
        borderRadiusSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            borderRadiusValue.textContent = value;
            borderRadiusNumber.value = value;
            if (this.targetButton) {
                this.targetButton.style.borderRadius = value + 'px';
            }
        });
        
        // Border radius live preview with number input
        borderRadiusNumber.addEventListener('input', (e) => {
            let value = parseInt(e.target.value) || 0;
            value = Math.max(0, Math.min(50, value)); // Clamp between 0 and 50
            borderRadiusSlider.value = value;
            borderRadiusValue.textContent = value;
            if (this.targetButton) {
                this.targetButton.style.borderRadius = value + 'px';
            }
        });
        
        // Size live preview
        const sizeSelect = document.getElementById('button-size');
        sizeSelect.addEventListener('change', (e) => {
            const size = e.target.value;
            const preset = this.sizePresets[size];
            if (this.targetButton && preset) {
                this.targetButton.style.padding = preset.padding;
                this.targetButton.style.fontSize = preset.fontSize;
            }
        });
        
        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.cancel();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.cancel();
            }
        });
    }

    open(button) {
        this.targetButton = button;
        
        // Store original values for cancel functionality
        this.originalValues = {
            text: button.textContent || 'Click Me',
            bgColor: button.style.backgroundColor,
            textColor: button.style.color,
            borderRadius: button.style.borderRadius,
            padding: button.style.padding,
            fontSize: button.style.fontSize,
            url: button.getAttribute('data-url') || '',
            target: button.getAttribute('data-target') || '_self'
        };
        
        // Load current button settings
        const text = this.originalValues.text;
        const bgColor = this.rgbToHex(this.originalValues.bgColor) || '#3b82f6';
        const textColor = this.rgbToHex(this.originalValues.textColor) || '#ffffff';
        const url = this.originalValues.url;
        const target = this.originalValues.target;
        
        // Extract border radius value (default to 4 if not set)
        let borderRadius = 4;
        if (this.originalValues.borderRadius) {
            borderRadius = parseInt(this.originalValues.borderRadius) || 4;
        }
        
        // Detect current size based on padding and fontSize
        let detectedSize = 'md'; // default
        const padding = this.originalValues.padding;
        const fontSize = this.originalValues.fontSize;
        
        if (padding && fontSize) {
            // Try to match current styles to size presets
            for (const [size, preset] of Object.entries(this.sizePresets)) {
                if (padding === preset.padding || fontSize === preset.fontSize) {
                    detectedSize = size;
                    break;
                }
            }
        }
        
        // Edge compatibility - create a completely new modal
        const isEdge = window.navigator.userAgent.indexOf('Edge') > -1 || 
                      window.navigator.userAgent.indexOf('Edg') > -1 ||
                      window.navigator.userAgent.indexOf('EdgeHTML') > -1;
        
        if (isEdge) {
            // Hide the original modal
            this.modal.style.display = 'none';
            
            // Create a new, simple modal for Edge
            this.edgeModal = document.createElement('div');
            this.edgeModal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 999999;
                display: block;
            `;
            
            const edgeContent = document.createElement('div');
            edgeContent.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                width: 500px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -250px;
                margin-top: -200px;
                z-index: 1000000;
                max-height: 80vh;
                overflow-y: auto;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal
            this.attachEdgeModalListeners(edgeContent);
            
            // Add simple drag functionality for Edge modal
            this.addEdgeDragFunctionality(edgeContent);
            
            // Set form values in Edge modal
            this.populateEdgeModalForm(text, url, bgColor, textColor, target, borderRadius, detectedSize);
            
        } else {
            // Normal browser behavior
            
            // Set form values
            document.getElementById('button-text').value = text;
            document.getElementById('button-url').value = url;
            document.getElementById('button-bg-color').value = bgColor;
            document.getElementById('button-text-color').value = textColor;
            document.getElementById('button-target').value = target;
            document.getElementById('button-border-radius').value = borderRadius;
            document.getElementById('button-border-radius-number').value = borderRadius;
            document.getElementById('border-radius-value').textContent = borderRadius;
            document.getElementById('button-size').value = detectedSize;
            
            // Force a reflow before adding active class for Edge compatibility
            this.modal.offsetHeight;
            this.modal.classList.add('active');
        }
    }

    close() {
        // Handle Edge modal
        if (this.edgeModal) {
            document.body.removeChild(this.edgeModal);
            this.edgeModal = null;
        }
        
        this.modal.classList.remove('active');
        // Clear any inline display style
        this.modal.style.display = '';
        this.targetButton = null;
        this.originalValues = null;
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }
    
    cancel() {
        // Restore original values when canceling
        if (this.targetButton && this.originalValues) {
            this.targetButton.textContent = this.originalValues.text;
            this.targetButton.style.backgroundColor = this.originalValues.bgColor;
            this.targetButton.style.color = this.originalValues.textColor;
            this.targetButton.style.borderRadius = this.originalValues.borderRadius;
            this.targetButton.style.padding = this.originalValues.padding;
            this.targetButton.style.fontSize = this.originalValues.fontSize;
            
            if (this.originalValues.url) {
                this.targetButton.setAttribute('data-url', this.originalValues.url);
                this.targetButton.setAttribute('data-target', this.originalValues.target);
            } else {
                this.targetButton.removeAttribute('data-url');
                this.targetButton.removeAttribute('data-target');
            }
        }
        this.close();
    }

    rgbToHex(rgb) {
        if (!rgb) return null;
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        if (!match) return null;
        
        const hex = '#' + [1, 2, 3].map(i => {
            const val = parseInt(match[i]);
            return ('0' + val.toString(16)).slice(-2);
        }).join('');
        
        return hex;
    }

    applyChanges() {
        const text = document.getElementById('button-text').value;
        const url = document.getElementById('button-url').value;
        const bgColor = document.getElementById('button-bg-color').value;
        const textColor = document.getElementById('button-text-color').value;
        const borderRadius = document.getElementById('button-border-radius').value;
        const size = document.getElementById('button-size').value;
        const target = document.getElementById('button-target').value;
        
        // Update button
        this.targetButton.textContent = text;
        this.targetButton.style.backgroundColor = bgColor;
        this.targetButton.style.color = textColor;
        this.targetButton.style.borderRadius = borderRadius + 'px';
        
        // Apply size preset
        const preset = this.sizePresets[size];
        if (preset) {
            this.targetButton.style.padding = preset.padding;
            this.targetButton.style.fontSize = preset.fontSize;
        }
        
        // Store URL and target as data attributes
        if (url) {
            this.targetButton.setAttribute('data-url', url);
            this.targetButton.setAttribute('data-target', target);
        } else {
            this.targetButton.removeAttribute('data-url');
            this.targetButton.removeAttribute('data-target');
        }
        
        // Remove any existing click handlers
        this.targetButton.onclick = null;
        // Remove event listeners by cloning and replacing the button
        const newButton = this.targetButton.cloneNode(true);
        this.targetButton.parentNode.replaceChild(newButton, this.targetButton);
        
        // Save state
        this.editor.stateHistory.saveState();
        this.close();
    }
    
    populateEdgeModalForm(text, url, bgColor, textColor, target, borderRadius, detectedSize) {
        const edgeContent = this.edgeModal.querySelector('div');
        
        // Set form values in Edge modal
        const textInput = edgeContent.querySelector('#button-text');
        const urlInput = edgeContent.querySelector('#button-url');
        const bgColorInput = edgeContent.querySelector('#button-bg-color');
        const textColorInput = edgeContent.querySelector('#button-text-color');
        const targetSelect = edgeContent.querySelector('#button-target');
        const borderRadiusSlider = edgeContent.querySelector('#button-border-radius');
        const borderRadiusNumber = edgeContent.querySelector('#button-border-radius-number');
        const borderRadiusValue = edgeContent.querySelector('#border-radius-value');
        const sizeSelect = edgeContent.querySelector('#button-size');
        
        if (textInput) textInput.value = text;
        if (urlInput) urlInput.value = url;
        if (bgColorInput) bgColorInput.value = bgColor;
        if (textColorInput) textColorInput.value = textColor;
        if (targetSelect) targetSelect.value = target;
        if (borderRadiusSlider) borderRadiusSlider.value = borderRadius;
        if (borderRadiusNumber) borderRadiusNumber.value = borderRadius;
        if (borderRadiusValue) borderRadiusValue.textContent = borderRadius;
        if (sizeSelect) sizeSelect.value = detectedSize;
    }
    
    attachEdgeModalListeners(edgeContent) {
        // Close button
        const closeBtn = edgeContent.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', () => this.close());
        
        // Cancel button
        const cancelBtn = edgeContent.querySelector('.modal-cancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.cancel());
        
        // Apply button
        const applyBtn = edgeContent.querySelector('.modal-apply');
        if (applyBtn) applyBtn.addEventListener('click', () => this.applyEdgeChanges());
        
        // Live preview listeners
        const textInput = edgeContent.querySelector('#button-text');
        const bgColorInput = edgeContent.querySelector('#button-bg-color');
        const textColorInput = edgeContent.querySelector('#button-text-color');
        const borderRadiusSlider = edgeContent.querySelector('#button-border-radius');
        const borderRadiusNumber = edgeContent.querySelector('#button-border-radius-number');
        const borderRadiusValue = edgeContent.querySelector('#border-radius-value');
        const sizeSelect = edgeContent.querySelector('#button-size');
        
        // Text live preview
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                if (this.targetButton) {
                    this.targetButton.textContent = e.target.value || 'Button';
                }
            });
        }
        
        // Background color live preview
        if (bgColorInput) {
            bgColorInput.addEventListener('input', (e) => {
                if (this.targetButton) {
                    this.targetButton.style.backgroundColor = e.target.value;
                }
            });
        }
        
        // Text color live preview
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                if (this.targetButton) {
                    this.targetButton.style.color = e.target.value;
                }
            });
        }
        
        // Border radius live preview with slider
        if (borderRadiusSlider && borderRadiusValue && borderRadiusNumber) {
            borderRadiusSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                borderRadiusValue.textContent = value;
                borderRadiusNumber.value = value;
                if (this.targetButton) {
                    this.targetButton.style.borderRadius = value + 'px';
                }
            });
        }
        
        // Border radius live preview with number input
        if (borderRadiusNumber && borderRadiusSlider && borderRadiusValue) {
            borderRadiusNumber.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 0;
                value = Math.max(0, Math.min(50, value)); // Clamp between 0 and 50
                borderRadiusSlider.value = value;
                borderRadiusValue.textContent = value;
                if (this.targetButton) {
                    this.targetButton.style.borderRadius = value + 'px';
                }
            });
        }
        
        // Size live preview
        if (sizeSelect) {
            sizeSelect.addEventListener('change', (e) => {
                const size = e.target.value;
                const preset = this.sizePresets[size];
                if (this.targetButton && preset) {
                    this.targetButton.style.padding = preset.padding;
                    this.targetButton.style.fontSize = preset.fontSize;
                }
            });
        }
        
        // Close on background click
        this.edgeModal.addEventListener('click', (e) => {
            if (e.target === this.edgeModal) {
                this.cancel();
            }
        });
        
        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape' && this.edgeModal) {
                this.cancel();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    applyEdgeChanges() {
        const edgeContent = this.edgeModal.querySelector('div');
        
        const text = edgeContent.querySelector('#button-text').value;
        const url = edgeContent.querySelector('#button-url').value;
        const bgColor = edgeContent.querySelector('#button-bg-color').value;
        const textColor = edgeContent.querySelector('#button-text-color').value;
        const borderRadius = edgeContent.querySelector('#button-border-radius').value;
        const size = edgeContent.querySelector('#button-size').value;
        const target = edgeContent.querySelector('#button-target').value;
        
        // Update button
        this.targetButton.textContent = text;
        this.targetButton.style.backgroundColor = bgColor;
        this.targetButton.style.color = textColor;
        this.targetButton.style.borderRadius = borderRadius + 'px';
        
        // Apply size preset
        const preset = this.sizePresets[size];
        if (preset) {
            this.targetButton.style.padding = preset.padding;
            this.targetButton.style.fontSize = preset.fontSize;
        }
        
        // Store URL and target as data attributes
        if (url) {
            this.targetButton.setAttribute('data-url', url);
            this.targetButton.setAttribute('data-target', target);
        } else {
            this.targetButton.removeAttribute('data-url');
            this.targetButton.removeAttribute('data-target');
        }
        
        // Remove any existing click handlers
        this.targetButton.onclick = null;
        // Remove event listeners by cloning and replacing the button
        const newButton = this.targetButton.cloneNode(true);
        this.targetButton.parentNode.replaceChild(newButton, this.targetButton);
        
        // Save state
        this.editor.stateHistory.saveState();
        this.close();
    }
    
    addEdgeDragFunctionality(modalContent) {
        const modalHeader = modalContent.querySelector('.modal-header');
        if (!modalHeader) return;
        
        let isDragging = false;
        let startX, startY, startLeft, startTop;
        
        modalHeader.style.cursor = 'move';
        
        modalHeader.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('modal-close')) return;
            
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(modalContent.style.marginLeft) || -250;
            startTop = parseInt(modalContent.style.marginTop) || -200;
            
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            modalContent.style.marginLeft = (startLeft + deltaX) + 'px';
            modalContent.style.marginTop = (startTop + deltaY) + 'px';
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}