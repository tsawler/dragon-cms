export class StyleEditorModal {
    constructor(editor) {
        this.editor = editor;
        this.modal = null;
        this.targetElement = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Style Editor</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Padding (px)</label>
                        <input type="number" class="style-padding" placeholder="e.g., 10">
                    </div>
                    <div class="form-group">
                        <label>Margin (px)</label>
                        <input type="number" class="style-margin" placeholder="e.g., 10">
                    </div>
                    <div class="form-group">
                        <label>Border Width (px)</label>
                        <input type="number" class="style-border-width" placeholder="e.g., 1">
                    </div>
                    <div class="form-group">
                        <label>Border Color</label>
                        <input type="color" class="style-border-color" value="#cccccc">
                    </div>
                    <div class="form-group">
                        <label>Border Radius (px)</label>
                        <input type="number" class="style-border-radius" placeholder="e.g., 8">
                    </div>
                    <div class="form-group">
                        <label>Background Color</label>
                        <input type="color" class="style-background" value="#ffffff">
                    </div>
                    <div class="form-group">
                        <label>Width</label>
                        <input type="text" class="style-width" placeholder="e.g., 100% or 500px">
                    </div>
                    <div class="form-group">
                        <label>Height</label>
                        <input type="text" class="style-height" placeholder="e.g., auto or 300px">
                    </div>
                    <div class="form-group">
                        <label>Transition (CSS)</label>
                        <input type="text" class="style-transition" placeholder="e.g., all 0.3s ease">
                    </div>
                    <div class="form-group">
                        <label>Visibility</label>
                        <select class="style-visibility">
                            <option value="">Default</option>
                            <option value="hidden">Hidden</option>
                            <option value="visible">Visible</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Display</label>
                        <select class="style-display">
                            <option value="">Default</option>
                            <option value="none">None</option>
                            <option value="block">Block</option>
                            <option value="inline">Inline</option>
                            <option value="inline-block">Inline Block</option>
                            <option value="flex">Flex</option>
                            <option value="grid">Grid</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn modal-cancel">Cancel</button>
                    <button class="btn btn-primary modal-save">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachModalListeners();
    }

    attachModalListeners() {
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-cancel').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-save').addEventListener('click', () => this.save());
    }

    open(element) {
        this.targetElement = element;
        this.modal.classList.add('active');
        
        const styles = window.getComputedStyle(element);
        this.modal.querySelector('.style-padding').value = parseInt(styles.padding) || '';
        this.modal.querySelector('.style-margin').value = parseInt(styles.margin) || '';
        this.modal.querySelector('.style-border-width').value = parseInt(styles.borderWidth) || '';
        this.modal.querySelector('.style-border-radius').value = parseInt(styles.borderRadius) || '';
        this.modal.querySelector('.style-width').value = element.style.width || '';
        this.modal.querySelector('.style-height').value = element.style.height || '';
        this.modal.querySelector('.style-transition').value = element.style.transition || '';
        this.modal.querySelector('.style-visibility').value = element.style.visibility || '';
        this.modal.querySelector('.style-display').value = element.style.display || '';
    }

    close() {
        this.modal.classList.remove('active');
        this.targetElement = null;
    }

    save() {
        if (this.targetElement) {
            const padding = this.modal.querySelector('.style-padding').value;
            const margin = this.modal.querySelector('.style-margin').value;
            const borderWidth = this.modal.querySelector('.style-border-width').value;
            const borderColor = this.modal.querySelector('.style-border-color').value;
            const borderRadius = this.modal.querySelector('.style-border-radius').value;
            const background = this.modal.querySelector('.style-background').value;
            const width = this.modal.querySelector('.style-width').value;
            const height = this.modal.querySelector('.style-height').value;
            const transition = this.modal.querySelector('.style-transition').value;
            const visibility = this.modal.querySelector('.style-visibility').value;
            const display = this.modal.querySelector('.style-display').value;

            if (padding) this.targetElement.style.padding = padding + 'px';
            if (margin) this.targetElement.style.margin = margin + 'px';
            if (borderWidth) {
                this.targetElement.style.border = `${borderWidth}px solid ${borderColor}`;
            }
            if (borderRadius) this.targetElement.style.borderRadius = borderRadius + 'px';
            if (background) this.targetElement.style.backgroundColor = background;
            if (width) this.targetElement.style.width = width;
            if (height) this.targetElement.style.height = height;
            if (transition) this.targetElement.style.transition = transition;
            if (visibility) this.targetElement.style.visibility = visibility;
            if (display) this.targetElement.style.display = display;

            this.editor.stateHistory.saveState();
        }
        
        this.close();
    }
}

export class CodeEditorModal {
    constructor(editor) {
        this.editor = editor;
        this.modal = null;
        this.targetElement = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        
        this.modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>HTML Editor</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>HTML Code</label>
                        <textarea class="code-editor-textarea" id="html-code-editor" placeholder="Enter HTML code here..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn modal-cancel">Cancel</button>
                    <button class="btn btn-primary modal-save">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachModalListeners();
    }

    attachModalListeners() {
        this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-cancel').addEventListener('click', () => this.close());
        this.modal.querySelector('.modal-save').addEventListener('click', () => this.save());
    }

    open(element) {
        this.targetElement = element;
        this.modal.classList.add('active');
        
        // Get the inner HTML without the control buttons
        const clone = element.cloneNode(true);
        clone.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon').forEach(el => el.remove());
        
        document.getElementById('html-code-editor').value = clone.innerHTML;
        
        // Focus the textarea
        setTimeout(() => {
            document.getElementById('html-code-editor').focus();
        }, 100);
    }

    close() {
        this.modal.classList.remove('active');
        this.targetElement = null;
    }

    save() {
        if (this.targetElement) {
            const newHTML = document.getElementById('html-code-editor').value;
            
            // Preserve the control buttons by collecting them first
            const controls = [];
            this.targetElement.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon').forEach(el => {
                controls.push(el.outerHTML);
            });
            
            // Update the element with new HTML but keep controls
            this.targetElement.innerHTML = controls.join('') + newHTML;
            
            this.editor.stateHistory.saveState();
        }
        
        this.close();
    }
}

export class ColumnSettingsModal {
    constructor(editor) {
        this.editor = editor;
        this.targetBlock = null;
        this.tempColumns = [];
        this.modal = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Column Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="column-preview" style="margin-bottom: 1.5rem;">
                        <p style="margin-bottom: 0.5rem; color: #6b7280; font-size: 0.875rem;">Current columns: <span id="column-count">1</span></p>
                        <div id="column-visual" style="display: flex; gap: 5px; height: 40px;"></div>
                    </div>
                    <div class="column-controls" style="display: flex; gap: 1rem; justify-content: center;">
                        <button id="remove-column-btn" class="btn" style="display: flex; align-items: center; gap: 0.25rem;">
                            <span style="font-size: 1.25rem;">−</span> Remove Column
                        </button>
                        <button id="add-column-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.25rem;">
                            <span style="font-size: 1.25rem;">+</span> Add Column
                        </button>
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
        const addBtn = this.modal.querySelector('#add-column-btn');
        const removeBtn = this.modal.querySelector('#remove-column-btn');
        
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        applyBtn.addEventListener('click', () => this.applyChanges());
        addBtn.addEventListener('click', () => this.addColumn());
        removeBtn.addEventListener('click', () => this.removeColumn());
        
        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(block) {
        this.targetBlock = block;
        this.tempColumns = this.getCurrentColumns();
        this.updatePreview();
        this.modal.classList.add('active');
    }

    close() {
        this.modal.classList.remove('active');
        this.targetBlock = null;
        this.tempColumns = [];
    }

    getCurrentColumns() {
        // Check for column-container first
        const columnContainer = this.targetBlock.querySelector('.column-container');
        if (columnContainer) {
            const columns = columnContainer.querySelectorAll('.column');
            if (columns.length > 0) {
                return Array.from(columns).map(col => ({
                    content: col.innerHTML,
                    style: col.style.cssText || 'flex: 1;'
                }));
            }
        }
        
        // Check for two-column or three-column containers
        const twoCol = this.targetBlock.querySelector('.two-column-container');
        const threeCol = this.targetBlock.querySelector('.three-column-container');
        
        if (twoCol) {
            return Array.from(twoCol.querySelectorAll('.column')).map(col => ({
                content: col.innerHTML,
                style: col.style.cssText || 'flex: 1;'
            }));
        }
        
        if (threeCol) {
            return Array.from(threeCol.querySelectorAll('.column')).map(col => ({
                content: col.innerHTML,
                style: col.style.cssText || 'flex: 1;'
            }));
        }
        
        // Default single column
        const clone = this.targetBlock.cloneNode(true);
        clone.querySelectorAll('.drag-handle, .edit-icon, .settings-icon, .code-icon, .delete-icon').forEach(el => el.remove());
        
        return [{
            content: clone.innerHTML,
            style: 'flex: 1;'
        }];
    }

    updatePreview() {
        const countSpan = this.modal.querySelector('#column-count');
        const visualDiv = this.modal.querySelector('#column-visual');
        const removeBtn = this.modal.querySelector('#remove-column-btn');
        
        countSpan.textContent = this.tempColumns.length;
        
        // Update visual preview
        visualDiv.innerHTML = '';
        for (let i = 0; i < this.tempColumns.length; i++) {
            const colDiv = document.createElement('div');
            colDiv.style.cssText = 'flex: 1; background: #e2e8f0; border-radius: 4px;';
            visualDiv.appendChild(colDiv);
        }
        
        // Disable remove button if only 1 column
        removeBtn.disabled = this.tempColumns.length <= 1;
        if (removeBtn.disabled) {
            removeBtn.style.opacity = '0.5';
            removeBtn.style.cursor = 'not-allowed';
        } else {
            removeBtn.style.opacity = '1';
            removeBtn.style.cursor = 'pointer';
        }
    }

    addColumn() {
        this.tempColumns.push({
            content: '',
            style: 'flex: 1;'
        });
        this.updatePreview();
    }

    removeColumn() {
        if (this.tempColumns.length > 1) {
            // Remove the last column and merge its content with the previous one
            const lastColumn = this.tempColumns.pop();
            if (lastColumn.content && this.tempColumns.length > 0) {
                this.tempColumns[this.tempColumns.length - 1].content += lastColumn.content;
            }
            this.updatePreview();
        }
    }

    applyChanges() {
        console.log('Applying column changes:', {
            columnCount: this.tempColumns.length,
            columns: this.tempColumns
        });
        
        // Save current block controls as HTML strings
        const controlsHTML = [];
        this.targetBlock.querySelectorAll('.drag-handle, .edit-icon, .settings-icon, .code-icon, .delete-icon, .resizer-handle').forEach(el => {
            controlsHTML.push(el.outerHTML);
        });
        
        // Clear block content
        this.targetBlock.innerHTML = '';
        
        // Re-add controls using innerHTML to preserve event handlers
        const controlsContainer = document.createElement('div');
        controlsContainer.innerHTML = controlsHTML.join('');
        while (controlsContainer.firstChild) {
            this.targetBlock.appendChild(controlsContainer.firstChild);
        }
        
        if (this.tempColumns.length === 1) {
            // Single column - just add content directly
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.tempColumns[0].content;
            while (tempDiv.firstChild) {
                this.targetBlock.appendChild(tempDiv.firstChild);
            }
        } else {
            // Multiple columns - create column container
            const container = document.createElement('div');
            container.className = 'column-container';
            container.style.cssText = 'display: flex; gap: 20px;';
            
            this.tempColumns.forEach((colData, index) => {
                const column = document.createElement('div');
                column.className = 'column';
                column.style.cssText = 'flex: 1;';
                column.innerHTML = colData.content || '';
                container.appendChild(column);
            });
            
            this.targetBlock.appendChild(container);
        }
        
        // Save state
        this.editor.stateHistory.saveState();
        
        // Refresh column resize dividers after changes
        setTimeout(() => {
            if (this.editor.columnResizer) {
                console.log('Triggering column resizer setup after column changes');
                this.editor.columnResizer.setupResizeDividers();
            }
        }, 200);
        
        this.close();
    }
}

export class ConfirmationModal {
    constructor(editor) {
        this.editor = editor;
        this.modal = null;
        this.onConfirm = null;
        this.onCancel = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'confirm-modal';
        this.modal.innerHTML = `
            <div class="confirm-modal-content">
                <div class="confirm-modal-icon">
                    ⚠️
                </div>
                <h3 class="confirm-modal-title">Delete Item</h3>
                <p class="confirm-modal-message">Are you sure you want to delete this item? This action cannot be undone.</p>
                <div class="confirm-modal-buttons">
                    <button class="confirm-modal-btn confirm-modal-btn-cancel confirm-modal-cancel">Cancel</button>
                    <button class="confirm-modal-btn confirm-modal-btn-delete confirm-modal-confirm">Delete</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        this.attachListeners();
    }

    attachListeners() {
        this.modal.querySelector('.confirm-modal-cancel').addEventListener('click', () => {
            if (this.onCancel) this.onCancel();
            this.close();
        });
        
        this.modal.querySelector('.confirm-modal-confirm').addEventListener('click', () => {
            if (this.onConfirm) this.onConfirm();
            this.close();
        });
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                if (this.onCancel) this.onCancel();
                this.close();
            }
        });
    }

    show(title, message, onConfirm, onCancel) {
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        
        this.modal.querySelector('.confirm-modal-title').textContent = title;
        this.modal.querySelector('.confirm-modal-message').textContent = message;
        this.modal.classList.add('active');
    }

    close() {
        this.modal.classList.remove('active');
        this.onConfirm = null;
        this.onCancel = null;
    }
}