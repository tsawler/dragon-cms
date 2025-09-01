export class ImageSettingsModal {
    constructor(editor) {
        this.editor = editor;
        this.targetContainer = null;
        this.modal = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'image-settings-modal';
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Image Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="image-bg-color">Background Color</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="color" id="image-bg-color" value="#ffffff">
                            <input type="text" id="image-bg-color-text" value="transparent" placeholder="transparent or #ffffff">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-padding">Padding</label>
                        <input type="range" id="image-padding" min="0" max="50" value="10">
                        <span id="image-padding-value">10px</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-border-width">Border Width</label>
                        <input type="range" id="image-border-width" min="0" max="10" value="0">
                        <span id="image-border-width-value">0px</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-border-color">Border Color</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="color" id="image-border-color" value="#cccccc">
                            <input type="text" id="image-border-color-text" value="#cccccc" placeholder="#cccccc">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-border-style">Border Style</label>
                        <select id="image-border-style">
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-border-radius">Border Radius</label>
                        <input type="range" id="image-border-radius" min="0" max="50" value="0">
                        <span id="image-border-radius-value">0px</span>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-shadow">Shadow</label>
                        <select id="image-shadow">
                            <option value="none">None</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="image-opacity">Opacity</label>
                        <input type="range" id="image-opacity" min="10" max="100" value="100">
                        <span id="image-opacity-value">100%</span>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
                    <button class="btn" id="cancel-image-settings" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Cancel</button>
                    <button class="btn" id="reset-image-settings" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Reset</button>
                    <button class="btn btn-primary" id="apply-image-settings" style="padding: 0.5rem 1rem; border: 1px solid #3b82f6; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Apply</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Color picker sync
        const bgColor = this.modal.querySelector('#image-bg-color');
        const bgColorText = this.modal.querySelector('#image-bg-color-text');
        const borderColor = this.modal.querySelector('#image-border-color');
        const borderColorText = this.modal.querySelector('#image-border-color-text');
        
        // Background color sync
        bgColor.addEventListener('input', () => {
            bgColorText.value = bgColor.value;
            this.updatePreview();
        });
        
        bgColorText.addEventListener('input', () => {
            if (bgColorText.value.match(/^#[0-9A-Fa-f]{6}$/) || bgColorText.value.toLowerCase() === 'transparent') {
                if (bgColorText.value.toLowerCase() !== 'transparent') {
                    bgColor.value = bgColorText.value;
                }
                this.updatePreview();
            }
        });
        
        // Border color sync
        borderColor.addEventListener('input', () => {
            borderColorText.value = borderColor.value;
            this.updatePreview();
        });
        
        borderColorText.addEventListener('input', () => {
            if (borderColorText.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                borderColor.value = borderColorText.value;
                this.updatePreview();
            }
        });
        
        // Range sliders
        const padding = this.modal.querySelector('#image-padding');
        const paddingValue = this.modal.querySelector('#image-padding-value');
        const borderWidth = this.modal.querySelector('#image-border-width');
        const borderWidthValue = this.modal.querySelector('#image-border-width-value');
        const borderRadius = this.modal.querySelector('#image-border-radius');
        const borderRadiusValue = this.modal.querySelector('#image-border-radius-value');
        const opacity = this.modal.querySelector('#image-opacity');
        const opacityValue = this.modal.querySelector('#image-opacity-value');
        
        padding.addEventListener('input', () => {
            paddingValue.textContent = padding.value + 'px';
            this.updatePreview();
        });
        
        borderWidth.addEventListener('input', () => {
            borderWidthValue.textContent = borderWidth.value + 'px';
            this.updatePreview();
        });
        
        borderRadius.addEventListener('input', () => {
            borderRadiusValue.textContent = borderRadius.value + 'px';
            this.updatePreview();
        });
        
        opacity.addEventListener('input', () => {
            opacityValue.textContent = opacity.value + '%';
            this.updatePreview();
        });
        
        // Dropdowns
        this.modal.querySelector('#image-border-style').addEventListener('change', () => this.updatePreview());
        this.modal.querySelector('#image-shadow').addEventListener('change', () => this.updatePreview());
        
        // Buttons
        const applyBtn = this.modal.querySelector('#apply-image-settings');
        const resetBtn = this.modal.querySelector('#reset-image-settings');
        const cancelBtn = this.modal.querySelector('#cancel-image-settings');
        
        applyBtn.addEventListener('click', () => this.applySettings());
        resetBtn.addEventListener('click', () => this.resetSettings());
        cancelBtn.addEventListener('click', () => this.close());
        
        // Add hover effects for buttons
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = '#f8f8f8';
            cancelBtn.style.borderColor = '#999';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'white';
            cancelBtn.style.borderColor = '#ddd';
        });
        
        resetBtn.addEventListener('mouseenter', () => {
            resetBtn.style.background = '#f8f8f8';
            resetBtn.style.borderColor = '#999';
        });
        resetBtn.addEventListener('mouseleave', () => {
            resetBtn.style.background = 'white';
            resetBtn.style.borderColor = '#ddd';
        });
        
        applyBtn.addEventListener('mouseenter', () => {
            applyBtn.style.background = '#2563eb';
            applyBtn.style.borderColor = '#2563eb';
        });
        applyBtn.addEventListener('mouseleave', () => {
            applyBtn.style.background = '#3b82f6';
            applyBtn.style.borderColor = '#3b82f6';
        });
        
        // Close handlers
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    open(container) {
        this.targetContainer = container;
        this.loadCurrentSettings();
        // Force a reflow before showing modal for Edge compatibility
        this.modal.offsetHeight;
        this.modal.classList.add('active');
        
        // Additional Edge compatibility - force redraw
        const isEdge = window.navigator.userAgent.indexOf('Edge') > -1 || 
                      window.navigator.userAgent.indexOf('Edg') > -1 ||
                      window.navigator.userAgent.indexOf('EdgeHTML') > -1;
        
        if (isEdge) {
            this.modal.style.display = 'block';
            this.modal.style.setProperty('display', 'block', 'important');
            // Force another reflow
            this.modal.offsetHeight;
        }
        
        // Ultimate fallback - set display to block regardless of browser
        setTimeout(() => {
            if (window.getComputedStyle(this.modal).display === 'none') {
                this.modal.style.setProperty('display', 'block', 'important');
            }
        }, 10);
        this.updatePreview();
    }

    close() {
        this.modal.classList.remove('active');
        // Clear any inline display style
        this.modal.style.display = '';
        this.targetContainer = null;
    }

    loadCurrentSettings() {
        if (!this.targetContainer) return;
        
        const computedStyle = window.getComputedStyle(this.targetContainer);
        const img = this.targetContainer.querySelector('img');
        
        // Load current settings
        const bgColor = this.rgbToHex(computedStyle.backgroundColor);
        this.modal.querySelector('#image-bg-color').value = bgColor === 'transparent' ? '#ffffff' : bgColor;
        this.modal.querySelector('#image-bg-color-text').value = bgColor;
        this.modal.querySelector('#image-padding').value = parseInt(computedStyle.padding) || 10;
        this.modal.querySelector('#image-padding-value').textContent = (parseInt(computedStyle.padding) || 10) + 'px';
        this.modal.querySelector('#image-border-width').value = parseInt(computedStyle.borderWidth) || 0;
        this.modal.querySelector('#image-border-width-value').textContent = (parseInt(computedStyle.borderWidth) || 0) + 'px';
        this.modal.querySelector('#image-border-color').value = this.rgbToHex(computedStyle.borderColor) || '#cccccc';
        this.modal.querySelector('#image-border-color-text').value = this.rgbToHex(computedStyle.borderColor) || '#cccccc';
        this.modal.querySelector('#image-border-style').value = computedStyle.borderStyle || 'solid';
        
        // Try to get border radius from image first, then container
        let borderRadius = 0;
        if (img) {
            const imgStyle = window.getComputedStyle(img);
            borderRadius = parseInt(imgStyle.borderRadius) || parseInt(computedStyle.borderRadius) || 0;
        } else {
            borderRadius = parseInt(computedStyle.borderRadius) || 0;
        }
        
        this.modal.querySelector('#image-border-radius').value = borderRadius;
        this.modal.querySelector('#image-border-radius-value').textContent = borderRadius + 'px';
        this.modal.querySelector('#image-opacity').value = Math.round((parseFloat(computedStyle.opacity) || 1) * 100);
        this.modal.querySelector('#image-opacity-value').textContent = Math.round((parseFloat(computedStyle.opacity) || 1) * 100) + '%';
    }

    updatePreview() {
        if (!this.targetContainer) return;
        
        const settings = this.getCurrentSettings();
        const img = this.targetContainer.querySelector('img');
        
        // Apply preview styles
        this.targetContainer.style.backgroundColor = settings.backgroundColor;
        this.targetContainer.style.padding = settings.padding + 'px';
        
        // Apply border using shorthand to ensure all properties are set together
        if (settings.borderWidth > 0) {
            this.targetContainer.style.border = `${settings.borderWidth}px ${settings.borderStyle} ${settings.borderColor}`;
        } else {
            this.targetContainer.style.border = 'none';
        }
        
        this.targetContainer.style.borderRadius = settings.borderRadius + 'px';
        
        // Apply border radius to the image as well
        if (img) {
            img.style.borderRadius = settings.borderRadius + 'px';
        }
        
        this.targetContainer.style.opacity = settings.opacity / 100;
        
        // Apply shadow
        if (settings.shadow === 'none') {
            this.targetContainer.style.boxShadow = 'none';
        } else {
            const shadowValues = {
                small: '0 2px 4px rgba(0,0,0,0.1)',
                medium: '0 4px 8px rgba(0,0,0,0.15)',
                large: '0 8px 16px rgba(0,0,0,0.2)'
            };
            this.targetContainer.style.boxShadow = shadowValues[settings.shadow];
        }
    }

    getCurrentSettings() {
        const bgColorText = this.modal.querySelector('#image-bg-color-text').value;
        return {
            backgroundColor: bgColorText.toLowerCase() === 'transparent' ? 'transparent' : this.modal.querySelector('#image-bg-color').value,
            padding: parseInt(this.modal.querySelector('#image-padding').value),
            borderWidth: parseInt(this.modal.querySelector('#image-border-width').value),
            borderColor: this.modal.querySelector('#image-border-color').value,
            borderStyle: this.modal.querySelector('#image-border-style').value,
            borderRadius: parseInt(this.modal.querySelector('#image-border-radius').value),
            shadow: this.modal.querySelector('#image-shadow').value,
            opacity: parseInt(this.modal.querySelector('#image-opacity').value)
        };
    }

    applySettings() {
        if (this.targetContainer) {
            this.updatePreview();
            if (this.editor && this.editor.stateHistory) {
                this.editor.stateHistory.saveState();
            }
        }
        this.close();
    }

    resetSettings() {
        // Reset to defaults
        this.modal.querySelector('#image-bg-color').value = '#ffffff';
        this.modal.querySelector('#image-bg-color-text').value = 'transparent';
        this.modal.querySelector('#image-padding').value = 10;
        this.modal.querySelector('#image-padding-value').textContent = '10px';
        this.modal.querySelector('#image-border-width').value = 0;
        this.modal.querySelector('#image-border-width-value').textContent = '0px';
        this.modal.querySelector('#image-border-color').value = '#cccccc';
        this.modal.querySelector('#image-border-color-text').value = '#cccccc';
        this.modal.querySelector('#image-border-style').value = 'solid';
        this.modal.querySelector('#image-border-radius').value = 0;
        this.modal.querySelector('#image-border-radius-value').textContent = '0px';
        this.modal.querySelector('#image-shadow').value = 'none';
        this.modal.querySelector('#image-opacity').value = 100;
        this.modal.querySelector('#image-opacity-value').textContent = '100%';
        
        this.updatePreview();
    }

    rgbToHex(rgb) {
        if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') return 'transparent';
        
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#ffffff';
        
        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
}