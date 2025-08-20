// Utility function to style Edge modal headers with neutral colors
function styleEdgeModalHeader(modalContent) {
    const modalHeader = modalContent.querySelector('.modal-header');
    if (!modalHeader) return;
    
    // Apply neutral styling to the header
    modalHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        padding: 0.75rem 2rem;
        border-bottom: 1px solid #e2e8f0;
        margin: -2rem -2rem 1.5rem -2rem;
        background: transparent;
        transition: background-color 0.2s;
    `;
    
    // Add hover effect
    modalHeader.addEventListener('mouseenter', () => {
        modalHeader.style.backgroundColor = 'rgba(241, 245, 249, 0.5)'; // Very light gray
    });
    
    modalHeader.addEventListener('mouseleave', () => {
        if (!modalHeader.classList.contains('dragging')) {
            modalHeader.style.backgroundColor = 'transparent';
        }
    });
    
    // Style the h2
    const h2 = modalHeader.querySelector('h2');
    if (h2) {
        h2.style.cssText = `
            font-size: 1.125rem;
            color: #2c3e50;
            margin: 0;
            flex: 1;
            font-weight: 600;
        `;
    }
    
    // Style the close button
    const closeBtn = modalHeader.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.style.cssText = `
            width: 30px;
            height: 30px;
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 24px;
            color: #999;
        `;
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#333';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#999';
        });
    }
}

// Syntax highlighting utility functions
function highlightSyntax(code, language = 'html') {
    if (language === 'html') {
        return highlightHTML(code);
    } else if (language === 'css') {
        return highlightCSS(code);
    } else if (language === 'javascript') {
        return highlightJavaScript(code);
    }
    return escapeHTML(code);
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightHTML(code) {
    return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Comments
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="syntax-comment">$1</span>')
        // Tags
        .replace(/(&lt;\/?)([\w-]+)([^&]*?)(&gt;)/g, (match, open, tagName, attrs, close) => {
            const highlightedAttrs = attrs.replace(/([\w-]+)(=)([&"'][^&"']*[&"'])/g, 
                '<span class="syntax-attribute">$1</span>$2<span class="syntax-string">$3</span>');
            return `${open}<span class="syntax-tag">${tagName}</span>${highlightedAttrs}${close}`;
        });
}

function highlightCSS(code) {
    return code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Comments
        .replace(/(\/\*.*?\*\/)/g, '<span class="syntax-comment">$1</span>')
        // Selectors
        .replace(/^([^{]+)(\{)/gm, '<span class="syntax-css-selector">$1</span>$2')
        // Properties and values
        .replace(/([\w-]+)(\s*:\s*)([^;]+)(;)/g, 
            '<span class="syntax-css-property">$1</span>$2<span class="syntax-css-value">$3</span>$4');
}

function highlightJavaScript(code) {
    const keywords = ['var', 'let', 'const', 'function', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'class', 'extends', 'super'];
    
    // First escape HTML
    let result = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Create a list to store protected ranges (strings and comments)
    const protectedRanges = [];
    
    // Find and protect strings first
    const stringRegex = /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    let match;
    while ((match = stringRegex.exec(result)) !== null) {
        const placeholder = `__STRING_${protectedRanges.length}__`;
        protectedRanges.push(`<span class="syntax-js-string">${match[0]}</span>`);
        result = result.substring(0, match.index) + placeholder + result.substring(match.index + match[0].length);
        stringRegex.lastIndex = match.index + placeholder.length;
    }
    
    // Find and protect comments
    const commentRegex1 = /\/\/.*$/gm;
    while ((match = commentRegex1.exec(result)) !== null) {
        const placeholder = `__COMMENT_${protectedRanges.length}__`;
        protectedRanges.push(`<span class="syntax-js-comment">${match[0]}</span>`);
        result = result.substring(0, match.index) + placeholder + result.substring(match.index + match[0].length);
        commentRegex1.lastIndex = match.index + placeholder.length;
    }
    
    const commentRegex2 = /\/\*.*?\*\//g;
    while ((match = commentRegex2.exec(result)) !== null) {
        const placeholder = `__COMMENT_${protectedRanges.length}__`;
        protectedRanges.push(`<span class="syntax-js-comment">${match[0]}</span>`);
        result = result.substring(0, match.index) + placeholder + result.substring(match.index + match[0].length);
        commentRegex2.lastIndex = match.index + placeholder.length;
    }
    
    // Apply keywords
    result = result.replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="syntax-js-keyword">$1</span>');
    
    // Apply function names
    result = result.replace(/\b(\w+)(?=\s*\()/g, '<span class="syntax-js-function">$1</span>');
    
    // Restore protected ranges
    protectedRanges.forEach((replacement, index) => {
        result = result.replace(`__STRING_${index}__`, replacement);
        result = result.replace(`__COMMENT_${index}__`, replacement);
    });
    
    return result;
}

function detectLanguage(code) {
    if (code.includes('<style') || (code.includes('{') && code.includes(':') && code.includes(';'))) {
        return 'css';
    }
    if (code.includes('function') || code.includes('var ') || code.includes('let ') || code.includes('const ')) {
        return 'javascript';
    }
    return 'html';
}

// Make syntax highlighting functions globally available
window.highlightSyntax = highlightSyntax;
window.detectLanguage = detectLanguage;

function formatHTML(html) {
    // Simple HTML formatter that adds proper indentation and line breaks
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    // Split by tags while preserving them
    const tokens = html.split(/(<[^>]*>)/);
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i].trim();
        if (!token) continue;
        
        if (token.startsWith('<')) {
            // It's a tag
            if (token.startsWith('</')) {
                // Closing tag - decrease indent before adding
                indent = Math.max(0, indent - indentSize);
                formatted += ' '.repeat(indent) + token + '\n';
            } else if (token.endsWith('/>')) {
                // Self-closing tag
                formatted += ' '.repeat(indent) + token + '\n';
            } else {
                // Opening tag - add then increase indent
                formatted += ' '.repeat(indent) + token + '\n';
                
                // Don't increase indent for inline tags
                const tagName = token.match(/<(\w+)/);
                const inlineTags = ['span', 'a', 'strong', 'em', 'b', 'i', 'code', 'small'];
                if (tagName && !inlineTags.includes(tagName[1].toLowerCase())) {
                    indent += indentSize;
                }
            }
        } else {
            // It's content
            if (token.length > 0) {
                formatted += ' '.repeat(indent) + token + '\n';
            }
        }
    }
    
    // Clean up extra newlines and return
    return formatted.replace(/\n\s*\n/g, '\n').trim();
}

// Common utility function for Edge modal dragging
function addEdgeDragFunctionality(modalContent) {
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
        startLeft = parseInt(modalContent.style.marginLeft) || -300;
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
                width: 600px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -300px;
                margin-top: -200px;
                z-index: 1000000;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
                
                // Style the modal header with neutral colors
                styleEdgeModalHeader(edgeContent);
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal
            const closeBtn = edgeContent.querySelector('.modal-close');
            const cancelBtn = edgeContent.querySelector('.modal-cancel');
            const saveBtn = edgeContent.querySelector('.modal-save');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
            if (saveBtn) saveBtn.addEventListener('click', () => this.save());
            
            // Add simple drag functionality for Edge modal
            addEdgeDragFunctionality(edgeContent);
            
        } else {
            // Normal browser behavior
            this.modal.offsetHeight;
            this.modal.classList.add('active');
        }
        
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
        // Handle Edge modal
        if (this.edgeModal) {
            document.body.removeChild(this.edgeModal);
            this.edgeModal = null;
        }
        
        this.modal.classList.remove('active');
        // Clear any inline display style
        this.modal.style.display = '';
        this.targetElement = null;
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }

    save() {
        if (this.targetElement) {
            // Use Edge modal if it exists, otherwise use regular modal
            const modalToUse = this.edgeModal || this.modal;
            
            const padding = modalToUse.querySelector('.style-padding').value;
            const margin = modalToUse.querySelector('.style-margin').value;
            const borderWidth = modalToUse.querySelector('.style-border-width').value;
            const borderColor = modalToUse.querySelector('.style-border-color').value;
            const borderRadius = modalToUse.querySelector('.style-border-radius').value;
            const background = modalToUse.querySelector('.style-background').value;
            const width = modalToUse.querySelector('.style-width').value;
            const height = modalToUse.querySelector('.style-height').value;
            const transition = modalToUse.querySelector('.style-transition').value;
            const visibility = modalToUse.querySelector('.style-visibility').value;
            const display = modalToUse.querySelector('.style-display').value;

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
                        <div class="code-editor-container">
                            <div class="code-editor-highlight" id="html-code-highlight"></div>
                            <textarea class="code-editor-textarea" id="html-code-editor" placeholder="Enter HTML code here..."></textarea>
                        </div>
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
        
        // Add syntax highlighting listeners
        const textarea = this.modal.querySelector('#html-code-editor');
        const highlightDiv = this.modal.querySelector('#html-code-highlight');
        
        if (textarea && highlightDiv) {
            const updateHighlighting = () => {
                const code = textarea.value;
                const language = detectLanguage(code);
                highlightDiv.innerHTML = highlightSyntax(code, language);
                
                // Sync scroll positions
                highlightDiv.scrollTop = textarea.scrollTop;
                highlightDiv.scrollLeft = textarea.scrollLeft;
            };
            
            textarea.addEventListener('input', updateHighlighting);
            textarea.addEventListener('scroll', () => {
                highlightDiv.scrollTop = textarea.scrollTop;
                highlightDiv.scrollLeft = textarea.scrollLeft;
            });
            
            // Store the update function for use in open method
            this.updateHighlighting = updateHighlighting;
        }
    }

    open(element) {
        this.targetElement = element;
        
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
                width: 600px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -300px;
                margin-top: -200px;
                z-index: 1000000;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
                
                // Style the modal header with neutral colors
                styleEdgeModalHeader(edgeContent);
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal
            const closeBtn = edgeContent.querySelector('.modal-close');
            const cancelBtn = edgeContent.querySelector('.modal-cancel');
            const saveBtn = edgeContent.querySelector('.modal-save');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
            if (saveBtn) {
                saveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.save();
                });
            } else {
                // Fallback: try to find any button with 'Save' text
                const allButtons = edgeContent.querySelectorAll('button');
                allButtons.forEach(btn => {
                    if (btn.textContent.includes('Save')) {
                        btn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            this.save();
                        });
                    }
                });
            }
            
            // Add simple drag functionality for Edge modal
            addEdgeDragFunctionality(edgeContent);
            
            // Add syntax highlighting to Edge modal  
            const edgeTextarea = edgeContent.querySelector('#html-code-editor');
            const edgeHighlightDiv = edgeContent.querySelector('#html-code-highlight');
            
            if (edgeTextarea && edgeHighlightDiv) {
                const updateEdgeHighlighting = () => {
                    const code = edgeTextarea.value;
                    const language = detectLanguage(code);
                    edgeHighlightDiv.innerHTML = highlightSyntax(code, language);
                    
                    // Sync scroll positions
                    edgeHighlightDiv.scrollTop = edgeTextarea.scrollTop;
                    edgeHighlightDiv.scrollLeft = edgeTextarea.scrollLeft;
                };
                
                edgeTextarea.addEventListener('input', updateEdgeHighlighting);
                edgeTextarea.addEventListener('scroll', () => {
                    edgeHighlightDiv.scrollTop = edgeTextarea.scrollTop;
                    edgeHighlightDiv.scrollLeft = edgeTextarea.scrollLeft;
                });
            }
            
        } else {
            // Normal browser behavior
            this.modal.offsetHeight;
            this.modal.classList.add('active');
        }
        
        // Get the inner HTML without the control buttons
        const clone = element.cloneNode(true);
        clone.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .resizer-handle').forEach(el => el.remove());
        
        // Remove internal editor attributes for cleaner HTML display
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        clone.querySelectorAll('[data-block-id]').forEach(el => el.removeAttribute('data-block-id'));
        clone.querySelectorAll('[data-snippet-id]').forEach(el => el.removeAttribute('data-snippet-id'));
        clone.querySelectorAll('[data-left-index]').forEach(el => el.removeAttribute('data-left-index'));
        clone.querySelectorAll('[data-right-index]').forEach(el => el.removeAttribute('data-right-index'));
        
        // Set the value in the appropriate modal
        const cleanHTML = clone.innerHTML.trim();
        const formattedHTML = formatHTML(cleanHTML);
        
        if (this.edgeModal) {
            const textArea = this.edgeModal.querySelector('#html-code-editor');
            if (textArea) {
                textArea.value = formattedHTML;
                // Add syntax highlighting for Edge modal
                const highlightDiv = this.edgeModal.querySelector('#html-code-highlight');
                if (highlightDiv) {
                    const language = detectLanguage(formattedHTML);
                    highlightDiv.innerHTML = highlightSyntax(formattedHTML, language);
                }
            }
        } else {
            document.getElementById('html-code-editor').value = formattedHTML;
            // Trigger initial syntax highlighting for regular modal
            if (this.updateHighlighting) {
                this.updateHighlighting();
            }
        }
        
        // Focus the textarea
        setTimeout(() => {
            if (this.edgeModal) {
                const textArea = this.edgeModal.querySelector('#html-code-editor');
                if (textArea) textArea.focus();
            } else {
                document.getElementById('html-code-editor').focus();
            }
        }, 100);
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
        this.targetElement = null;
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }

    save() {
        if (this.targetElement) {
            // Use Edge modal if it exists, otherwise use regular modal
            const modalToUse = this.edgeModal || this.modal;
            const textArea = modalToUse.querySelector('#html-code-editor');
            const newHTML = textArea ? textArea.value : document.getElementById('html-code-editor').value;
            
            // Preserve the control buttons by collecting them first
            const controls = [];
            this.targetElement.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .resizer-handle').forEach(el => {
                controls.push(el.outerHTML);
            });
            
            // Update the element with new HTML but keep controls
            this.targetElement.innerHTML = controls.join('') + newHTML;
            
            // Re-enable editor functionality by making elements editable and draggable
            this.targetElement.querySelectorAll('[contenteditable]').forEach(el => {
                el.contentEditable = true;
            });
            
            // Re-apply any data attributes that the editor needs
            this.targetElement.querySelectorAll('.editor-snippet').forEach(snippet => {
                snippet.draggable = true;
            });
            this.targetElement.querySelectorAll('.editor-block').forEach(block => {
                block.draggable = true;
            });
            
            // Ensure the target element itself is draggable if it should be
            if (this.targetElement.classList.contains('editor-block') || this.targetElement.classList.contains('editor-snippet')) {
                this.targetElement.draggable = true;
            }
            
            // Re-add block/snippet controls if needed
            if (this.targetElement.classList.contains('editor-block') && !this.targetElement.querySelector('.drag-handle')) {
                this.editor.addBlockControls(this.targetElement);
            } else if (this.targetElement.classList.contains('editor-snippet') && !this.targetElement.querySelector('.drag-handle')) {
                this.editor.addSnippetControls(this.targetElement);
            }
            
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
            <div class="modal-content" style="width: 400px; max-width: 90%;">
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
                width: 400px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -200px;
                margin-top: -150px;
                z-index: 1000000;
                cursor: auto;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
                
                // Style the modal header with neutral colors
                styleEdgeModalHeader(edgeContent);
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal - Column Settings specific
            const closeBtn = edgeContent.querySelector('.modal-close');
            const cancelBtn = edgeContent.querySelector('.modal-cancel');
            const applyBtn = edgeContent.querySelector('.modal-apply');
            const addBtn = edgeContent.querySelector('#add-column-btn');
            const removeBtn = edgeContent.querySelector('#remove-column-btn');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
            if (applyBtn) applyBtn.addEventListener('click', () => this.applyChanges());
            if (addBtn) addBtn.addEventListener('click', () => this.addColumn());
            if (removeBtn) removeBtn.addEventListener('click', () => this.removeColumn());
            
            // Close on background click
            this.edgeModal.addEventListener('click', (e) => {
                if (e.target === this.edgeModal) {
                    this.close();
                }
            });
            
            // Close on Escape key
            const escapeHandler = (e) => {
                if (e.key === 'Escape' && this.edgeModal) {
                    this.close();
                    document.removeEventListener('keydown', escapeHandler);
                }
            };
            document.addEventListener('keydown', escapeHandler);
            
            // Add simple drag functionality for Edge modal
            addEdgeDragFunctionality(edgeContent);
            
        } else {
            // Normal browser behavior
            this.modal.offsetHeight;
            this.modal.classList.add('active');
        }
    }

    close() {
        console.log('ColumnSettingsModal.close() called');
        
        // Handle Edge modal
        if (this.edgeModal) {
            document.body.removeChild(this.edgeModal);
            this.edgeModal = null;
        }
        
        this.modal.classList.remove('active');
        // Clear any inline display style
        this.modal.style.display = '';
        this.targetBlock = null;
        this.tempColumns = [];
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            console.log('Resetting modal position...');
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
        console.log('Modal closed, classes:', this.modal.className);
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
        clone.querySelectorAll('.drag-handle, .edit-icon, .settings-icon, .code-icon, .delete-icon, .resizer-handle').forEach(el => el.remove());
        
        return [{
            content: clone.innerHTML,
            style: 'flex: 1;'
        }];
    }

    updatePreview() {
        // Use Edge modal if it exists, otherwise use regular modal
        const modalToUse = this.edgeModal || this.modal;
        
        const countSpan = modalToUse.querySelector('#column-count');
        const visualDiv = modalToUse.querySelector('#column-visual');
        const removeBtn = modalToUse.querySelector('#remove-column-btn');
        
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
                width: 600px;
                max-width: 90%;
                background: white;
                border-radius: 8px;
                padding: 2rem;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                margin-left: -300px;
                margin-top: -200px;
                z-index: 1000000;
            `;
            
            // Copy the content from the original modal
            const originalContent = this.modal.querySelector('.modal-content');
            if (originalContent) {
                edgeContent.innerHTML = originalContent.innerHTML;
                
                // Style the modal header with neutral colors
                styleEdgeModalHeader(edgeContent);
            }
            
            this.edgeModal.appendChild(edgeContent);
            document.body.appendChild(this.edgeModal);
            
            // Attach event listeners to the new modal
            const closeBtn = edgeContent.querySelector('.modal-close');
            const cancelBtn = edgeContent.querySelector('.modal-cancel');
            const saveBtn = edgeContent.querySelector('.modal-save');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
            if (saveBtn) saveBtn.addEventListener('click', () => this.save());
            
            // Add simple drag functionality for Edge modal
            addEdgeDragFunctionality(edgeContent);
            
        } else {
            // Normal browser behavior
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
        this.onConfirm = null;
        this.onCancel = null;
        
        // Reset modal position if it was dragged
        const modalContent = this.modal.querySelector('.modal-content');
        if (modalContent && window.dragon && window.dragon.modalDragger) {
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }
}