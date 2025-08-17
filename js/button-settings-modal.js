export class ButtonSettingsModal {
    constructor(editor) {
        console.log('ButtonSettingsModal constructor called');
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
        console.log('ButtonSettingsModal.createModal() called');
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
        console.log('Modal added to body:', this.modal);
        console.log('Modal in DOM:', document.body.contains(this.modal));
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
        console.log('ButtonSettingsModal.open() called with button:', button);
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
        
        // Clear any inline display style that might be preventing the modal from showing
        this.modal.style.display = '';
        this.modal.style.opacity = '1';  // Force opacity to 1
        this.modal.classList.add('active');
        
        console.log('Modal after opening:', {
            classes: this.modal.className,
            display: this.modal.style.display,
            computedDisplay: window.getComputedStyle(this.modal).display,
            visibility: window.getComputedStyle(this.modal).visibility,
            opacity: window.getComputedStyle(this.modal).opacity,
            zIndex: window.getComputedStyle(this.modal).zIndex
        });
    }

    close() {
        this.modal.classList.remove('active');
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
}