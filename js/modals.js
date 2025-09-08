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
                    <!-- Padding Section -->
                    <div class="form-section" style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">Padding</h3>
                        <div class="spacing-controls" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Top</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-padding-top" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-padding-top-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Right</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-padding-right" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-padding-right-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Bottom</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-padding-bottom" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-padding-bottom-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Left</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-padding-left" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-padding-left-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 0.75rem; text-align: center;">
                            <button type="button" class="link-all-padding" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.75rem; text-decoration: underline;">Link all sides</button>
                        </div>
                    </div>
                    
                    <!-- Margin Section -->
                    <div class="form-section" style="margin-bottom: 2rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb;">
                        <h3 style="margin: 0 0 1rem 0; font-size: 1rem; font-weight: 600; color: #374151;">Margin</h3>
                        <div class="spacing-controls" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Top</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-margin-top" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-margin-top-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                        <option value="auto">auto</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Right</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-margin-right" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-margin-right-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                        <option value="auto">auto</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Bottom</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-margin-bottom" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-margin-bottom-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                        <option value="auto">auto</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group" style="margin: 0;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.25rem; color: #6b7280;">Left</label>
                                <div style="display: flex; gap: 0.25rem;">
                                    <input type="number" class="style-margin-left" placeholder="0" style="flex: 2; min-width: 60px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem;">
                                    <select class="style-margin-left-unit" style="flex: 1; max-width: 70px; padding: 0.375rem; border: 1px solid #d1d5db; border-radius: 4px; font-size: 0.875rem; background: white;">
                                        <option value="px">px</option>
                                        <option value="em">em</option>
                                        <option value="rem">rem</option>
                                        <option value="%">%</option>
                                        <option value="vh">vh</option>
                                        <option value="vw">vw</option>
                                        <option value="auto">auto</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 0.75rem; text-align: center;">
                            <button type="button" class="link-all-margin" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 0.75rem; text-decoration: underline;">Link all sides</button>
                        </div>
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
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
                    <button class="btn modal-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Cancel</button>
                    <button class="btn btn-primary modal-save" style="padding: 0.5rem 1rem; border: 1px solid #3b82f6; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Apply</button>
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
        
        // Add "Link all sides" functionality for padding
        const linkPaddingBtn = this.modal.querySelector('.link-all-padding');
        linkPaddingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.linkAllSides('padding');
        });

        // Add "Link all sides" functionality for margin
        const linkMarginBtn = this.modal.querySelector('.link-all-margin');
        linkMarginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.linkAllSides('margin');
        });

        // Add listeners for automatic linking when first side is changed
        ['padding', 'margin'].forEach(type => {
            const topInput = this.modal.querySelector(`.style-${type}-top`);
            const topUnit = this.modal.querySelector(`.style-${type}-top-unit`);
            
            topInput.addEventListener('input', () => this.autoLinkSides(type, 'top'));
            topUnit.addEventListener('change', () => this.autoLinkSides(type, 'top'));
        });
        
        // Add background click to close modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    linkAllSides(type) {
        const topValue = this.modal.querySelector(`.style-${type}-top`).value;
        const topUnit = this.modal.querySelector(`.style-${type}-top-unit`).value;
        
        if (topValue) {
            ['right', 'bottom', 'left'].forEach(side => {
                this.modal.querySelector(`.style-${type}-${side}`).value = topValue;
                this.modal.querySelector(`.style-${type}-${side}-unit`).value = topUnit;
            });
        }
    }

    autoLinkSides(type, changedSide) {
        // Auto-link if other sides are empty and changed side has a value
        const changedValue = this.modal.querySelector(`.style-${type}-${changedSide}`).value;
        const changedUnit = this.modal.querySelector(`.style-${type}-${changedSide}-unit`).value;
        
        if (changedValue) {
            const otherSides = ['top', 'right', 'bottom', 'left'].filter(side => side !== changedSide);
            const allOthersEmpty = otherSides.every(side => 
                !this.modal.querySelector(`.style-${type}-${side}`).value
            );
            
            if (allOthersEmpty) {
                otherSides.forEach(side => {
                    this.modal.querySelector(`.style-${type}-${side}`).value = changedValue;
                    this.modal.querySelector(`.style-${type}-${side}-unit`).value = changedUnit;
                });
            }
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
            if (saveBtn) saveBtn.addEventListener('click', () => this.save());
            
            // Add simple drag functionality for Edge modal
            addEdgeDragFunctionality(edgeContent);
            
        } else {
            // Normal browser behavior
            this.modal.offsetHeight;
            this.modal.classList.add('active');
        }
        
        const styles = window.getComputedStyle(element);
        
        // Load granular padding values
        this.loadSpacingValues(element, styles, 'padding');
        
        // Load granular margin values
        this.loadSpacingValues(element, styles, 'margin');
        
        this.modal.querySelector('.style-border-width').value = parseInt(styles.borderWidth) || '';
        this.modal.querySelector('.style-border-radius').value = parseInt(styles.borderRadius) || '';
        this.modal.querySelector('.style-width').value = element.style.width || '';
        this.modal.querySelector('.style-height').value = element.style.height || '';
        this.modal.querySelector('.style-transition').value = element.style.transition || '';
        this.modal.querySelector('.style-visibility').value = element.style.visibility || '';
        this.modal.querySelector('.style-display').value = element.style.display || '';
    }

    loadSpacingValues(element, styles, type) {
        // Parse individual side values from computed styles
        const sides = ['top', 'right', 'bottom', 'left'];
        const property = type === 'padding' ? 'padding' : 'margin';
        
        sides.forEach(side => {
            const cssProperty = `${property}${side.charAt(0).toUpperCase() + side.slice(1)}`;
            const computedValue = styles[cssProperty] || '0px';
            
            // Parse the value and unit
            const parsed = this.parseValueUnit(computedValue);
            
            const valueInput = this.modal.querySelector(`.style-${type}-${side}`);
            const unitSelect = this.modal.querySelector(`.style-${type}-${side}-unit`);
            
            if (valueInput && unitSelect) {
                valueInput.value = parsed.value || '';
                unitSelect.value = parsed.unit || 'px';
            }
        });
    }

    parseValueUnit(cssValue) {
        // Handle common cases like "10px", "1.5em", "auto", "0"
        if (!cssValue) {
            return { value: '', unit: 'px' };
        }
        if (cssValue === 'auto') {
            return { value: '', unit: 'auto' };
        }
        if (cssValue === '0') {
            return { value: 0, unit: 'px' };
        }
        
        const match = cssValue.match(/^(-?[\d.]+)([a-z%]+)?$/i);
        if (match) {
            return {
                value: parseFloat(match[1]) || '',
                unit: match[2] || 'px'
            };
        }
        
        return { value: '', unit: 'px' };
    }

    applySpacingStyles(modalElement, type) {
        const sides = ['top', 'right', 'bottom', 'left'];
        const cssProperty = type === 'padding' ? 'padding' : 'margin';
        
        // Get values for all sides
        const sideValues = sides.map(side => {
            const valueInput = modalElement.querySelector(`.style-${type}-${side}`);
            const unitSelect = modalElement.querySelector(`.style-${type}-${side}-unit`);
            
            if (!valueInput || !unitSelect) return null;
            
            const value = valueInput.value.trim();
            const unit = unitSelect.value;
            
            // Handle auto for margin (even with empty value)
            if (unit === 'auto' && type === 'margin') {
                return 'auto';
            }
            
            if (!value) return null;
            
            return `${value}${unit}`;
        });
        
        // Apply individual side values
        sides.forEach((side, index) => {
            const sideProperty = `${cssProperty}${side.charAt(0).toUpperCase() + side.slice(1)}`;
            const value = sideValues[index];
            
            if (value !== null) {
                this.targetElement.style[sideProperty] = value;
            } else {
                // Clear the individual property if no value is set
                this.targetElement.style[sideProperty] = '';
            }
        });
        
        // Check if all sides have the same value - if so, use shorthand
        const nonNullValues = sideValues.filter(v => v !== null);
        if (nonNullValues.length > 0) {
            const allSame = nonNullValues.every(v => v === nonNullValues[0]);
            if (allSame && nonNullValues.length === 4) {
                // All sides have the same value, use shorthand
                this.targetElement.style[cssProperty] = nonNullValues[0];
            }
        } else {
            // Clear the shorthand property if all sides are empty
            this.targetElement.style[cssProperty] = '';
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
            
            // Apply granular padding
            this.applySpacingStyles(modalToUse, 'padding');
            
            // Apply granular margin
            this.applySpacingStyles(modalToUse, 'margin');
            
            const borderWidth = modalToUse.querySelector('.style-border-width').value;
            const borderColor = modalToUse.querySelector('.style-border-color').value;
            const borderRadius = modalToUse.querySelector('.style-border-radius').value;
            const background = modalToUse.querySelector('.style-background').value;
            const width = modalToUse.querySelector('.style-width').value;
            const height = modalToUse.querySelector('.style-height').value;
            const transition = modalToUse.querySelector('.style-transition').value;
            const visibility = modalToUse.querySelector('.style-visibility').value;
            const display = modalToUse.querySelector('.style-display').value;
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
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
                    <button class="btn modal-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Cancel</button>
                    <button class="btn btn-primary modal-save" style="padding: 0.5rem 1rem; border: 1px solid #3b82f6; background: #3b82f6; color: white; border-radius: 4px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Save</button>
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
        
        // Always use the JavaScript-based modal system for better responsiveness
        
        // Create a new modal overlay
        this.jsModal = document.createElement('div');
        this.jsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 999999;
            display: block;
        `;
        
        // Create modal content container with better responsive sizing
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 85%;
            max-width: 900px;
            min-width: 700px;
            max-height: 85vh;
            background: white;
            border-radius: 12px;
            padding: 0;
            box-shadow: 0 20px 50px rgba(0,0,0,0.15);
            transform: translate(-50%, -50%);
            z-index: 1000000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        `;
        
        // Get current HTML content from the element
        const currentHTML = element.innerHTML;
        
        // Create the modal content with proper responsive design
        modalContent.innerHTML = `
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 2rem 2.5rem 1.5rem 2.5rem;
                border-bottom: 1px solid #e5e7eb;
                background: #f8fafc;
            ">
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 600; color: #1f2937;">HTML Editor</h2>
                <button class="js-modal-close" style="
                    background: none;
                    border: none;
                    font-size: 1.75rem;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 4px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.2s;
                ">&times;</button>
            </div>
            <div style="
                padding: 2.5rem;
                flex: 1;
                overflow: auto;
                background: #fafbfc;
            ">
                <div style="position: relative; margin-bottom: 1.5rem;">
                    <label style="
                        display: block;
                        margin-bottom: 1rem;
                        font-weight: 600;
                        color: #374151;
                        font-size: 1.1rem;
                    ">HTML Code</label>
                    <div style="
                        position: relative;
                        background: white;
                        border-radius: 8px;
                        border: 2px solid #e5e7eb;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    ">
                        <pre class="js-code-highlight" style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            margin: 0;
                            padding: 1.5rem;
                            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
                            font-size: 14px;
                            line-height: 1.6;
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            overflow: auto;
                            pointer-events: none;
                            color: #1f2937;
                            background: transparent;
                        "><code></code></pre>
                        <textarea class="js-code-editor" style="
                            position: relative;
                            width: 100%;
                            height: 450px;
                            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
                            font-size: 14px;
                            line-height: 1.6;
                            padding: 1.5rem;
                            border: none;
                            resize: vertical;
                            background: transparent;
                            color: transparent;
                            caret-color: #1f2937;
                            -webkit-text-fill-color: transparent;
                            outline: none;
                            min-height: 400px;
                            box-sizing: border-box;
                            z-index: 2;
                        " placeholder="Enter HTML code here..." spellcheck="false"></textarea>
                    </div>
                </div>
            </div>
            <div style="
                display: flex;
                gap: 1.5rem;
                justify-content: flex-end;
                padding: 2rem 2.5rem;
                border-top: 1px solid #e5e7eb;
                background: #f8fafc;
            ">
                <button class="js-modal-cancel" style="
                    padding: 1rem 2rem;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                ">Cancel</button>
                <button class="js-modal-save" style="
                    padding: 1rem 2rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 500;
                    transition: all 0.2s;
                    box-shadow: 0 2px 6px rgba(59,130,246,0.3);
                ">Save</button>
            </div>
        `;
        
        this.jsModal.appendChild(modalContent);
        document.body.appendChild(this.jsModal);
        
        // Attach event listeners
        const closeBtn = modalContent.querySelector('.js-modal-close');
        const cancelBtn = modalContent.querySelector('.js-modal-cancel');
        const saveBtn = modalContent.querySelector('.js-modal-save');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
            closeBtn.addEventListener('mouseover', () => {
                closeBtn.style.backgroundColor = '#e5e7eb';
                closeBtn.style.color = '#374151';
            });
            closeBtn.addEventListener('mouseout', () => {
                closeBtn.style.backgroundColor = 'transparent';
                closeBtn.style.color = '#6b7280';
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.close());
            cancelBtn.addEventListener('mouseover', () => {
                cancelBtn.style.backgroundColor = '#e5e7eb';
            });
            cancelBtn.addEventListener('mouseout', () => {
                cancelBtn.style.backgroundColor = '#f3f4f6';
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.save());
            saveBtn.addEventListener('mouseover', () => {
                saveBtn.style.backgroundColor = '#2563eb';
            });
            saveBtn.addEventListener('mouseout', () => {
                saveBtn.style.backgroundColor = '#3b82f6';
            });
        }
        
        // Close on background click
        this.jsModal.addEventListener('click', (e) => {
            if (e.target === this.jsModal) {
                this.close();
            }
        });
        
        // Get the inner HTML without the control buttons first
        const clone = element.cloneNode(true);
        clone.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .resizer-handle').forEach(el => el.remove());
        
        // Remove image resize handles and containers
        clone.querySelectorAll('.image-resize-handle').forEach(el => el.remove());
        
        // Clean up image resize containers - extract just the image
        clone.querySelectorAll('.image-resize-container').forEach(container => {
            const img = container.querySelector('img');
            if (img) {
                // Preserve the image's style
                const imgClone = img.cloneNode(true);
                container.replaceWith(imgClone);
            }
        });
        
        // Remove internal editor attributes for cleaner HTML display
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
        clone.querySelectorAll('[data-block-id]').forEach(el => el.removeAttribute('data-block-id'));
        clone.querySelectorAll('[data-snippet-id]').forEach(el => el.removeAttribute('data-snippet-id'));
        clone.querySelectorAll('[data-left-index]').forEach(el => el.removeAttribute('data-left-index'));
        clone.querySelectorAll('[data-right-index]').forEach(el => el.removeAttribute('data-right-index'));
        clone.querySelectorAll('[data-drag-listeners-attached]').forEach(el => el.removeAttribute('data-drag-listeners-attached'));
        
        // Get the cleaned and formatted HTML
        const cleanHTML = clone.innerHTML.trim();
        const formattedHTML = formatHTML(cleanHTML);
        
        // Set the formatted HTML in the textarea and add syntax highlighting
        const codeTextarea = modalContent.querySelector('.js-code-editor');
        const highlightPre = modalContent.querySelector('.js-code-highlight code');
        
        if (codeTextarea && highlightPre) {
            // Set the formatted HTML in the textarea
            codeTextarea.value = formattedHTML;
            
            // Immediately scroll to top after setting value
            codeTextarea.scrollTop = 0;
            codeTextarea.scrollLeft = 0;
            
            const updateHighlighting = () => {
                const code = codeTextarea.value;
                
                // HTML syntax highlighting with proper escaping
                let highlighted = code
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
                
                // Highlight different parts of HTML
                highlighted = highlighted
                    // HTML comments
                    .replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span style="color: #6b7280; font-style: italic;">$1</span>')
                    // HTML tags and their content
                    .replace(/(&lt;)(\/?)(\w+)((?:\s+[\w-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s&gt;]+))?)*)(\s*\/?)(&gt;)/g, 
                        (match, lt, slash, tag, attrs, selfClose, gt) => {
                            // Process attributes
                            let processedAttrs = attrs.replace(
                                /([\w-]+)(\s*=\s*)(["'][^"']*["']|[^\s&gt;]+)/g,
                                '<span style="color: #dc2626;">$1</span><span style="color: #6b7280;">$2</span><span style="color: #059669;">$3</span>'
                            );
                            return `<span style="color: #2563eb;">${lt}${slash}${tag}</span>${processedAttrs}<span style="color: #2563eb;">${selfClose}${gt}</span>`;
                        });
                
                highlightPre.innerHTML = highlighted;
                
                // Sync scroll positions (but preserve current position)
                const currentScrollTop = codeTextarea.scrollTop;
                const currentScrollLeft = codeTextarea.scrollLeft;
                highlightPre.parentElement.scrollTop = currentScrollTop;
                highlightPre.parentElement.scrollLeft = currentScrollLeft;
            };
            
            // Add event listeners
            codeTextarea.addEventListener('input', updateHighlighting);
            codeTextarea.addEventListener('scroll', () => {
                highlightPre.parentElement.scrollTop = codeTextarea.scrollTop;
                highlightPre.parentElement.scrollLeft = codeTextarea.scrollLeft;
            });
            
            // Initial highlighting
            updateHighlighting();
            
            // Multiple attempts to ensure we start at top
            const scrollToTop = () => {
                codeTextarea.scrollTop = 0;
                codeTextarea.scrollLeft = 0;
                highlightPre.parentElement.scrollTop = 0;
                highlightPre.parentElement.scrollLeft = 0;
            };
            
            // Immediate scroll to top
            scrollToTop();
            
            // Try again after a short delay
            setTimeout(scrollToTop, 10);
            setTimeout(scrollToTop, 50);
        }
        
        // Focus the textarea and ensure it's scrolled to top
        setTimeout(() => {
            if (codeTextarea) {
                // Set cursor to beginning of text
                codeTextarea.setSelectionRange(0, 0);
                codeTextarea.focus();
                
                // Final scroll to top after everything
                codeTextarea.scrollTop = 0;
                codeTextarea.scrollLeft = 0;
                if (highlightPre) {
                    highlightPre.parentElement.scrollTop = 0;
                    highlightPre.parentElement.scrollLeft = 0;
                }
            }
        }, 100);
    }

    close() {
        // Handle JavaScript-based modal
        if (this.jsModal) {
            document.body.removeChild(this.jsModal);
            this.jsModal = null;
        }
        
        this.targetElement = null;
    }

    save() {
        if (this.targetElement) {
            // Get the value from our unified modal
            const textArea = this.jsModal ? this.jsModal.querySelector('.js-code-editor') : null;
            const newHTML = textArea ? textArea.value : '';
            
            // Preserve the control buttons by collecting them first
            const controls = [];
            this.targetElement.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .resizer-handle').forEach(el => {
                controls.push(el.outerHTML);
            });
            
            // Update the element with new HTML but keep controls
            this.targetElement.innerHTML = controls.join('') + newHTML;
            
            // Make text elements editable and fix Firefox cursor positioning
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            const textElements = this.targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, li, td, th, blockquote');
            textElements.forEach(el => {
                if (!el.querySelector('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon') && 
                    !el.classList.contains('drag-handle') && 
                    !el.classList.contains('edit-icon') && 
                    !el.classList.contains('code-icon') && 
                    !el.classList.contains('delete-icon') && 
                    !el.classList.contains('settings-icon') &&
                    !el.closest('button')) {
                    el.contentEditable = true;
                    el.style.outline = 'none';
                    
                    // Firefox-specific cursor positioning fix
                    if (isFirefox) {
                        el.addEventListener('mousedown', (e) => {
                            // Clear any existing selection
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            
                            // Use caretPositionFromPoint for Firefox
                            if (document.caretPositionFromPoint) {
                                const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
                                if (caretPosition) {
                                    const range = document.createRange();
                                    range.setStart(caretPosition.offsetNode, caretPosition.offset);
                                    range.collapse(true);
                                    selection.addRange(range);
                                }
                            }
                        });
                        
                        el.addEventListener('click', (e) => {
                            // Additional click handler to ensure cursor positioning works
                            setTimeout(() => {
                                if (document.caretPositionFromPoint) {
                                    const selection = window.getSelection();
                                    const caretPosition = document.caretPositionFromPoint(e.clientX, e.clientY);
                                    if (caretPosition) {
                                        const range = document.createRange();
                                        range.setStart(caretPosition.offsetNode, caretPosition.offset);
                                        range.collapse(true);
                                        selection.removeAllRanges();
                                        selection.addRange(range);
                                    }
                                }
                            }, 1);
                        });
                    }
                }
            });
            
            // Simply call the same method that makes new snippets work
            this.editor.attachDragHandleListeners(this.targetElement);
            
            // Re-initialize image resize functionality
            const images = this.targetElement.querySelectorAll('img');
            images.forEach(img => {
                // Only make resizable if not already wrapped
                if (!img.closest('.image-resize-container')) {
                    this.editor.makeImageResizable(img);
                }
            });
            
            // Apply Firefox fixes for contentEditable elements to ensure formatting toolbar works
            if (this.editor.formattingToolbar && this.editor.formattingToolbar.fixFirefoxEditableElements) {
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    this.editor.formattingToolbar.fixFirefoxEditableElements();
                }, 10);
            }
            
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
        this.blockSettings = {
            width: '',
            fullWidth: false,
            height: '',
            backgroundColor: '',
            backgroundImage: '',
            contentWidth: ''
        };
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content" style="width: 550px; max-width: 90%; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Block Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Tab Navigation -->
                    <div class="tabs-nav" style="display: flex; border-bottom: 2px solid #e5e7eb; margin-bottom: 1.5rem;">
                        <button class="tab-btn active" data-tab="layout" style="padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 2px solid #3b82f6; color: #3b82f6; font-weight: 500; cursor: pointer; transition: all 0.2s;">Layout</button>
                        <button class="tab-btn" data-tab="columns" style="padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; font-weight: 500; cursor: pointer; transition: all 0.2s;">Columns</button>
                        <button class="tab-btn" data-tab="background" style="padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 2px solid transparent; color: #6b7280; font-weight: 500; cursor: pointer; transition: all 0.2s;">Background</button>
                    </div>
                    
                    <!-- Tab Content -->
                    <div class="tabs-content">
                        <!-- Layout Tab -->
                        <div class="tab-pane active" data-tab="layout">
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <input type="checkbox" id="full-width-check" style="width: 16px; height: 16px;">
                                    <span style="font-size: 0.875rem; font-weight: 500;">Full viewport width (edge to edge)</span>
                                </label>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Block Width</label>
                                <input type="text" id="block-width" placeholder="e.g., 100%, 1200px, 90vw" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                <small style="color: #6b7280; font-size: 0.75rem;">Use %, px, or vw units</small>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Block Height</label>
                                <input type="text" id="block-height" placeholder="e.g., 400px, 50vh, auto" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                <small style="color: #6b7280; font-size: 0.75rem;">Use px, vh, or auto</small>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Content Max Width</label>
                                <input type="text" id="content-width" placeholder="e.g., 1200px, 90%" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                <small style="color: #6b7280; font-size: 0.75rem;">Controls the maximum width of content inside the block</small>
                            </div>
                        </div>
                        
                        <!-- Columns Tab -->
                        <div class="tab-pane" data-tab="columns" style="display: none;">
                            <div class="column-preview" style="margin-bottom: 1.5rem;">
                                <p style="margin-bottom: 0.75rem; color: #374151; font-size: 0.875rem; font-weight: 500;">Current columns: <span id="column-count" style="font-weight: 600;">1</span></p>
                                <div id="column-visual" style="display: flex; gap: 8px; height: 60px; padding: 10px; background: #f9fafb; border-radius: 8px;"></div>
                            </div>
                            <div class="column-controls" style="display: flex; gap: 1rem; justify-content: center;">
                                <button id="remove-column-btn" class="btn" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;">
                                    <span style="font-size: 1.25rem;">−</span> Remove
                                </button>
                                <button id="add-column-btn" class="btn btn-primary" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: 1px solid #3b82f6; background: #3b82f6; color: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;">
                                    <span style="font-size: 1.25rem;">+</span> Add Column
                                </button>
                            </div>
                        </div>
                        
                        <!-- Background Tab -->
                        <div class="tab-pane" data-tab="background" style="display: none;">
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Background Color</label>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <input type="color" id="bg-color-picker" style="width: 50px; height: 40px; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer;">
                                    <input type="text" id="bg-color-text" placeholder="#ffffff or transparent" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                    <button id="clear-color-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Clear</button>
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Background Image</label>
                                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                                    <input type="text" id="bg-image" placeholder="https://example.com/image.jpg or gradient" style="flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                    <input type="file" id="bg-image-file" accept="image/*" style="display: none;">
                                    <button id="browse-image-btn" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">Browse</button>
                                </div>
                                <small style="color: #6b7280; font-size: 0.75rem;">Enter URL, CSS gradient, or browse for local image</small>
                                <div id="bg-image-preview" style="margin-top: 1rem; display: none;">
                                    <img src="" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 6px; border: 1px solid #d1d5db;">
                                </div>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Background Size</label>
                                <select id="bg-size" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                    <option value="cover">Cover (default)</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                    <option value="100% 100%">Stretch</option>
                                </select>
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 1.25rem;">
                                <label style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">Background Position</label>
                                <select id="bg-position" style="width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem;">
                                    <option value="center">Center (default)</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="top left">Top Left</option>
                                    <option value="top right">Top Right</option>
                                    <option value="bottom left">Bottom Left</option>
                                    <option value="bottom right">Bottom Right</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <button class="btn modal-cancel" style="padding: 0.5rem 1.5rem; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;">Cancel</button>
                    <button class="btn btn-success modal-apply" style="padding: 0.5rem 1.5rem; border: 1px solid #10b981; background: #10b981; color: white; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-weight: 500; transition: all 0.2s;">Apply Changes</button>
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
        
        // Tab elements
        const tabBtns = this.modal.querySelectorAll('.tab-btn');
        const tabPanes = this.modal.querySelectorAll('.tab-pane');
        
        // Layout settings
        const fullWidthCheck = this.modal.querySelector('#full-width-check');
        const blockWidthInput = this.modal.querySelector('#block-width');
        
        // Background settings
        const bgColorPicker = this.modal.querySelector('#bg-color-picker');
        const bgColorText = this.modal.querySelector('#bg-color-text');
        const clearColorBtn = this.modal.querySelector('#clear-color-btn');
        const browseImageBtn = this.modal.querySelector('#browse-image-btn');
        const bgImageFile = this.modal.querySelector('#bg-image-file');
        const bgImageInput = this.modal.querySelector('#bg-image');
        const bgImagePreview = this.modal.querySelector('#bg-image-preview');
        
        // Basic listeners
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        applyBtn.addEventListener('click', () => this.applyChanges());
        addBtn.addEventListener('click', () => this.addColumn());
        removeBtn.addEventListener('click', () => this.removeColumn());
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Update active states
                tabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.borderBottomColor = 'transparent';
                    b.style.color = '#6b7280';
                });
                e.target.classList.add('active');
                e.target.style.borderBottomColor = '#3b82f6';
                e.target.style.color = '#3b82f6';
                
                // Show corresponding pane
                tabPanes.forEach(pane => {
                    pane.style.display = pane.dataset.tab === targetTab ? 'block' : 'none';
                });
            });
        });
        
        // Sync full width checkbox with width input
        fullWidthCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                blockWidthInput.value = '100vw';
                blockWidthInput.disabled = true;
            } else {
                blockWidthInput.disabled = false;
                if (blockWidthInput.value === '100vw') {
                    blockWidthInput.value = '';
                }
            }
        });
        
        // Sync color picker with text input
        bgColorPicker.addEventListener('input', (e) => {
            bgColorText.value = e.target.value;
        });
        
        bgColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
                bgColorPicker.value = color;
            }
        });
        
        // Clear color button
        clearColorBtn.addEventListener('click', () => {
            bgColorText.value = '';
            bgColorPicker.value = '#000000';
        });
        
        // Browse image button
        browseImageBtn.addEventListener('click', () => {
            bgImageFile.click();
        });
        
        // Handle file selection
        bgImageFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const dataUrl = event.target.result;
                    bgImageInput.value = dataUrl;
                    
                    // Show preview
                    const previewImg = bgImagePreview.querySelector('img');
                    previewImg.src = dataUrl;
                    bgImagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Update preview when URL changes
        bgImageInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && !value.startsWith('linear-gradient') && !value.startsWith('radial-gradient')) {
                const previewImg = bgImagePreview.querySelector('img');
                previewImg.src = value;
                bgImagePreview.style.display = 'block';
            } else {
                bgImagePreview.style.display = 'none';
            }
        });
        
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
        this.loadBlockSettings();
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
            
            // Attach event listeners to the new modal - Block Settings specific
            const closeBtn = edgeContent.querySelector('.modal-close');
            const cancelBtn = edgeContent.querySelector('.modal-cancel');
            const applyBtn = edgeContent.querySelector('.modal-apply');
            const addBtn = edgeContent.querySelector('#add-column-btn');
            const removeBtn = edgeContent.querySelector('#remove-column-btn');
            const fullWidthCheck = edgeContent.querySelector('#full-width-check');
            const blockWidthInput = edgeContent.querySelector('#block-width');
            const bgColorPicker = edgeContent.querySelector('#bg-color-picker');
            const bgColorText = edgeContent.querySelector('#bg-color-text');
            
            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (cancelBtn) cancelBtn.addEventListener('click', () => this.close());
            if (applyBtn) applyBtn.addEventListener('click', () => this.applyChanges());
            if (addBtn) addBtn.addEventListener('click', () => this.addColumn());
            if (removeBtn) removeBtn.addEventListener('click', () => this.removeColumn());
            
            // Add new block settings event listeners for Edge
            if (fullWidthCheck && blockWidthInput) {
                fullWidthCheck.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        blockWidthInput.value = '100vw';
                        blockWidthInput.disabled = true;
                    } else {
                        blockWidthInput.disabled = false;
                        if (blockWidthInput.value === '100vw') {
                            blockWidthInput.value = '';
                        }
                    }
                });
            }
            
            if (bgColorPicker && bgColorText) {
                bgColorPicker.addEventListener('input', (e) => {
                    bgColorText.value = e.target.value;
                });
                
                bgColorText.addEventListener('input', (e) => {
                    const color = e.target.value;
                    if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
                        bgColorPicker.value = color;
                    }
                });
            }
            
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
            window.dragon.modalDragger.resetModalPosition(modalContent);
        }
    }

    loadBlockSettings() {
        // Get current block settings from styles
        const blockStyle = this.targetBlock.style;
        const computedStyle = window.getComputedStyle(this.targetBlock);
        
        // Use Edge modal if it exists, otherwise use regular modal
        const modalToUse = this.edgeModal || this.modal;
        
        // Load width settings
        const width = blockStyle.width || '';
        const fullWidthCheck = modalToUse.querySelector('#full-width-check');
        const blockWidthInput = modalToUse.querySelector('#block-width');
        
        if (width === '100vw' || this.targetBlock.classList.contains('full-width')) {
            fullWidthCheck.checked = true;
            blockWidthInput.value = '100vw';
            blockWidthInput.disabled = true;
        } else {
            fullWidthCheck.checked = false;
            blockWidthInput.value = width;
            blockWidthInput.disabled = false;
        }
        
        // Load height
        const blockHeightInput = modalToUse.querySelector('#block-height');
        blockHeightInput.value = blockStyle.height || '';
        
        // Load background color
        const bgColorPicker = modalToUse.querySelector('#bg-color-picker');
        const bgColorText = modalToUse.querySelector('#bg-color-text');
        const bgColor = blockStyle.backgroundColor || '';
        
        if (bgColor && bgColor !== 'transparent') {
            bgColorText.value = bgColor;
            // Try to set color picker if it's a valid hex color
            if (bgColor.match(/^#[0-9A-Fa-f]{6}$/)) {
                bgColorPicker.value = bgColor;
            }
        } else {
            // Clear background color inputs if no background color
            bgColorText.value = '';
            bgColorPicker.value = '#000000'; // Reset to default color picker value
        }
        
        // Load background image
        const bgImageInput = modalToUse.querySelector('#bg-image');
        const bgImagePreview = modalToUse.querySelector('#bg-image-preview');
        const bgImage = blockStyle.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            // Extract URL from background-image property
            const urlMatch = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch) {
                bgImageInput.value = urlMatch[1];
                // Show preview if it's an image URL
                if (!urlMatch[1].startsWith('linear-gradient') && !urlMatch[1].startsWith('radial-gradient')) {
                    const previewImg = bgImagePreview.querySelector('img');
                    previewImg.src = urlMatch[1];
                    bgImagePreview.style.display = 'block';
                }
            } else {
                bgImageInput.value = bgImage;
            }
        } else {
            // Clear background image input and preview if no background image
            bgImageInput.value = '';
            bgImagePreview.style.display = 'none';
            const previewImg = bgImagePreview.querySelector('img');
            if (previewImg) {
                previewImg.src = '';
            }
        }
        
        // Load background size
        const bgSizeSelect = modalToUse.querySelector('#bg-size');
        if (bgSizeSelect) {
            bgSizeSelect.value = blockStyle.backgroundSize || 'cover';
        }
        
        // Load background position
        const bgPositionSelect = modalToUse.querySelector('#bg-position');
        if (bgPositionSelect) {
            bgPositionSelect.value = blockStyle.backgroundPosition || 'center';
        }
        
        // Load content width
        const contentWidthInput = modalToUse.querySelector('#content-width');
        const contentWrapper = this.targetBlock.querySelector('.block-content-wrapper');
        if (contentWrapper) {
            contentWidthInput.value = contentWrapper.style.maxWidth || '';
        }
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
        
        if (!countSpan || !visualDiv || !removeBtn) return;
        
        countSpan.textContent = this.tempColumns.length;
        
        // Update visual preview with improved styling
        visualDiv.innerHTML = '';
        for (let i = 0; i < this.tempColumns.length; i++) {
            const colDiv = document.createElement('div');
            colDiv.style.cssText = 'flex: 1; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 6px; position: relative;';
            
            // Add column number
            const colNumber = document.createElement('span');
            colNumber.textContent = i + 1;
            colNumber.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 0.875rem;';
            colDiv.appendChild(colNumber);
            
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
        
        // Use Edge modal if it exists, otherwise use regular modal
        const modalToUse = this.edgeModal || this.modal;
        
        // Apply block settings
        const fullWidthCheck = modalToUse.querySelector('#full-width-check');
        const blockWidthInput = modalToUse.querySelector('#block-width');
        const blockHeightInput = modalToUse.querySelector('#block-height');
        const bgColorText = modalToUse.querySelector('#bg-color-text');
        const bgImageInput = modalToUse.querySelector('#bg-image');
        const contentWidthInput = modalToUse.querySelector('#content-width');
        
        // Apply width settings
        if (fullWidthCheck.checked) {
            this.targetBlock.classList.add('full-width');
            // Clear inline width styles, let CSS class handle it
            this.targetBlock.style.width = '';
            this.targetBlock.style.maxWidth = '';
            this.targetBlock.style.marginLeft = '';
            this.targetBlock.style.marginRight = '';
        } else {
            if (this.targetBlock) {
                this.targetBlock.classList.remove('full-width');
                this.targetBlock.style.marginLeft = '';
                this.targetBlock.style.marginRight = '';
                this.targetBlock.style.maxWidth = '';
            }
            if (this.targetBlock) {
                if (blockWidthInput.value) {
                    this.targetBlock.style.width = blockWidthInput.value;
                } else {
                    this.targetBlock.style.width = '';
                }
            }
        }
        
        // Apply height
        if (this.targetBlock) {
            if (blockHeightInput.value) {
                this.targetBlock.style.height = blockHeightInput.value;
            } else {
                this.targetBlock.style.height = '';
            }
        }
        
        // Apply background color
        if (this.targetBlock) {
            if (bgColorText.value) {
                this.targetBlock.style.backgroundColor = bgColorText.value;
            } else {
                this.targetBlock.style.backgroundColor = '';
            }
        }
        
        // Apply background image
        const bgSizeSelect = modalToUse.querySelector('#bg-size');
        const bgPositionSelect = modalToUse.querySelector('#bg-position');
        
        if (this.targetBlock) {
            if (bgImageInput.value) {
                if (bgImageInput.value.startsWith('linear-gradient') || bgImageInput.value.startsWith('radial-gradient')) {
                    // Gradients don't need url() wrapper
                    this.targetBlock.style.backgroundImage = bgImageInput.value;
                } else {
                    // All other values (URLs and data URLs) need url() wrapper
                    this.targetBlock.style.backgroundImage = `url("${bgImageInput.value}")`;
                }
                this.targetBlock.style.backgroundSize = bgSizeSelect.value || 'cover';
                this.targetBlock.style.backgroundPosition = bgPositionSelect.value || 'center';
                this.targetBlock.style.backgroundRepeat = 'no-repeat';
            } else {
                this.targetBlock.style.backgroundImage = '';
                this.targetBlock.style.backgroundSize = '';
                this.targetBlock.style.backgroundPosition = '';
                this.targetBlock.style.backgroundRepeat = '';
            }
        }
        
        // Apply content width - wrap existing content if needed
        const hasContentWrapper = this.targetBlock ? this.targetBlock.querySelector('.block-content-wrapper') : null;
        
        if (this.targetBlock && contentWidthInput.value && !hasContentWrapper) {
            // Need to wrap content
            const wrapper = document.createElement('div');
            wrapper.className = 'block-content-wrapper';
            wrapper.style.maxWidth = contentWidthInput.value;
            wrapper.style.margin = '0 auto';
            wrapper.style.padding = '0 20px';
            
            // Move all non-control elements into wrapper
            const elementsToWrap = [];
            Array.from(this.targetBlock.children).forEach(child => {
                if (!child.classList.contains('drag-handle') &&
                    !child.classList.contains('edit-icon') &&
                    !child.classList.contains('settings-icon') &&
                    !child.classList.contains('code-icon') &&
                    !child.classList.contains('delete-icon') &&
                    !child.classList.contains('resizer-handle')) {
                    elementsToWrap.push(child);
                }
            });
            
            elementsToWrap.forEach(el => wrapper.appendChild(el));
            this.targetBlock.appendChild(wrapper);
        } else if (this.targetBlock && contentWidthInput.value && hasContentWrapper) {
            // Update existing wrapper
            hasContentWrapper.style.maxWidth = contentWidthInput.value;
        } else if (this.targetBlock && !contentWidthInput.value && hasContentWrapper) {
            // Remove wrapper
            while (hasContentWrapper.firstChild) {
                this.targetBlock.insertBefore(hasContentWrapper.firstChild, hasContentWrapper);
            }
            hasContentWrapper.remove();
        }
        
        // Now handle column changes
        if (this.targetBlock) {
            // Save current block controls as HTML strings
            const controlsHTML = [];
            this.targetBlock.querySelectorAll('.drag-handle, .edit-icon, .settings-icon, .code-icon, .delete-icon, .resizer-handle').forEach(el => {
                controlsHTML.push(el.outerHTML);
            });
            
            // Get content wrapper if it exists
            const contentWrapper = this.targetBlock.querySelector('.block-content-wrapper');
            const targetContainer = contentWrapper || this.targetBlock;
        
        // Clear content (but not controls)
        if (contentWrapper) {
            contentWrapper.innerHTML = '';
        } else {
            // Remove all non-control elements
            Array.from(this.targetBlock.children).forEach(child => {
                if (!child.classList.contains('drag-handle') &&
                    !child.classList.contains('edit-icon') &&
                    !child.classList.contains('settings-icon') &&
                    !child.classList.contains('code-icon') &&
                    !child.classList.contains('delete-icon') &&
                    !child.classList.contains('resizer-handle')) {
                    child.remove();
                }
            });
        }
        
        if (this.tempColumns.length === 1) {
            // Single column - just add content directly
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.tempColumns[0].content;
            while (tempDiv.firstChild) {
                targetContainer.appendChild(tempDiv.firstChild);
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
            
            targetContainer.appendChild(container);
        }
        }
        
        // Save state
        if (this.editor && this.editor.stateHistory && this.editor.stateHistory.saveState) {
            this.editor.stateHistory.saveState();
        }
        
        // Refresh column resize dividers after changes
        setTimeout(() => {
            if (this.editor.columnResizer) {
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
        
        // Always use the JavaScript-based modal system (previously "Edge" version)
        // This is more reliable and works consistently across all browsers
        
        // Create a new modal overlay
        this.jsModal = document.createElement('div');
        this.jsModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 999999;
            display: block;
        `;
        
        // Create modal content container
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
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
            text-align: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        
        // Create the modal content
        modalContent.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
            <h3 style="margin: 0 0 1rem 0; font-size: 1.25rem; color: #1f2937;">${title}</h3>
            <p style="margin: 0 0 2rem 0; color: #6b7280; line-height: 1.5;">${message}</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button class="js-modal-cancel" style="
                    padding: 0.75rem 1.5rem;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: background-color 0.2s;
                ">Cancel</button>
                <button class="js-modal-confirm" style="
                    padding: 0.75rem 1.5rem;
                    background: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    font-weight: 500;
                    transition: background-color 0.2s;
                ">Delete</button>
            </div>
        `;
        
        this.jsModal.appendChild(modalContent);
        document.body.appendChild(this.jsModal);
        
        // Attach event listeners
        const cancelBtn = modalContent.querySelector('.js-modal-cancel');
        const confirmBtn = modalContent.querySelector('.js-modal-confirm');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.onCancel) this.onCancel();
                this.close();
            });
            cancelBtn.addEventListener('mouseover', () => {
                cancelBtn.style.backgroundColor = '#e5e7eb';
            });
            cancelBtn.addEventListener('mouseout', () => {
                cancelBtn.style.backgroundColor = '#f3f4f6';
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                if (this.onConfirm) this.onConfirm();
                this.close();
            });
            confirmBtn.addEventListener('mouseover', () => {
                confirmBtn.style.backgroundColor = '#dc2626';
            });
            confirmBtn.addEventListener('mouseout', () => {
                confirmBtn.style.backgroundColor = '#ef4444';
            });
        }
        
        // Close on background click
        this.jsModal.addEventListener('click', (e) => {
            if (e.target === this.jsModal) {
                this.close();
            }
        });
    }

    close() {
        // Handle JavaScript-based modal
        if (this.jsModal) {
            document.body.removeChild(this.jsModal);
            this.jsModal = null;
        }
        
        // Clear callbacks
        this.onConfirm = null;
        this.onCancel = null;
    }
}

export class LinkSettingsModal {
    constructor(editor) {
        this.editor = editor;
        this.targetLink = null;
        this.modal = null;
        this.createModal();
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        this.modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h2>Link Settings</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="link-url">URL</label>
                        <input type="url" id="link-url" placeholder="https://example.com">
                    </div>
                    <div class="form-group" style="margin-top: 1rem;">
                        <label style="display: flex; align-items: center; gap: 8px; font-weight: normal; cursor: pointer;">
                            <input type="checkbox" id="link-new-window" style="margin: 0; width: auto;">
                            <span>Open in new window</span>
                        </label>
                    </div>
                </div>
                <div class="modal-footer" style="display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                    <button class="btn modal-remove" style="background-color: #ef4444; color: white; border: 1px solid #ef4444;">Remove Link</button>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn modal-cancel" style="padding: 0.5rem 1rem; border: 1px solid #d1d5db; background: white; color: #374151;">Cancel</button>
                        <button class="btn btn-success modal-apply" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: 1px solid #10b981;">Apply</button>
                    </div>
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
        const removeBtn = this.modal.querySelector('.modal-remove');

        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());
        applyBtn.addEventListener('click', () => this.apply());
        removeBtn.addEventListener('click', () => this.removeLink());

        // Close on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display !== 'none') {
                this.close();
            }
        });
    }

    show(linkElement, savedRange = null, formattingToolbar = null, currentEditableElement = null) {
        this.targetLink = linkElement;
        this.savedRange = savedRange;
        this.formattingToolbar = formattingToolbar;
        this.currentEditableElement = currentEditableElement;
        this.modal.style.display = 'flex';
        
        // Load current link settings
        if (linkElement) {
            const urlInput = this.modal.querySelector('#link-url');
            const newWindowCheckbox = this.modal.querySelector('#link-new-window');
            const footer = this.modal.querySelector('.modal-footer');
            
            urlInput.value = linkElement.href || linkElement.getAttribute('href') || '';
            newWindowCheckbox.checked = linkElement.target === '_blank';
            
            // Show remove button for existing links and restore footer layout
            this.modal.querySelector('.modal-remove').style.display = 'inline-block';
            if (footer) {
                footer.style.justifyContent = 'space-between';
            }
        } else {
            // Hide remove button for new links and adjust footer layout
            const removeBtn = this.modal.querySelector('.modal-remove');
            const footer = this.modal.querySelector('.modal-footer');
            if (removeBtn) {
                removeBtn.style.display = 'none';
            }
            // When no remove button, center the Cancel/Apply buttons
            if (footer) {
                footer.style.justifyContent = 'flex-end';
            }
            this.modal.querySelector('#link-url').value = '';
            this.modal.querySelector('#link-new-window').checked = false;
        }

        // Focus the URL input
        setTimeout(() => {
            this.modal.querySelector('#link-url').focus();
        }, 100);
    }

    close() {
        this.modal.style.display = 'none';
        this.targetLink = null;
    }

    apply() {
        const urlInput = this.modal.querySelector('#link-url');
        const newWindowCheckbox = this.modal.querySelector('#link-new-window');
        
        if (!urlInput || !newWindowCheckbox) {
            console.warn('Modal form elements not found');
            return;
        }
        
        const url = urlInput.value.trim();

        if (!url) {
            alert('Please enter a URL');
            return;
        }

        // Sanitize URL (reuse the sanitization logic from formatting toolbar)
        const sanitizedUrl = this.sanitizeURL(url);
        if (!sanitizedUrl) {
            alert('Invalid or dangerous URL. Please enter a valid URL.');
            return;
        }

        if (this.targetLink) {
            // Update existing link
            this.targetLink.href = sanitizedUrl;
            this.targetLink.setAttribute('href', sanitizedUrl);
            
            if (newWindowCheckbox.checked) {
                this.targetLink.target = '_blank';
                this.targetLink.setAttribute('target', '_blank');
            } else {
                this.targetLink.removeAttribute('target');
            }
        } else {
            // Create new link using saved range
            try {
                if (this.savedRange && this.currentEditableElement) {
                    // Restore the saved selection first
                    this.currentEditableElement.focus();
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(this.savedRange);
                    
                    // Now create the link
                    document.execCommand('createLink', false, sanitizedUrl);
                    
                    // Find the newly created link and set target if needed
                    if (newWindowCheckbox.checked) {
                        // The selection should now contain the newly created link
                        const currentSelection = window.getSelection();
                        if (currentSelection.rangeCount > 0) {
                            const range = currentSelection.getRangeAt(0);
                            let link = null;
                            
                            // Try different ways to find the link
                            if (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
                                link = range.commonAncestorContainer.querySelector('a');
                            } else if (range.commonAncestorContainer.parentNode) {
                                link = range.commonAncestorContainer.parentNode.closest('a');
                            }
                            
                            if (link) {
                                link.target = '_blank';
                                link.setAttribute('target', '_blank');
                            }
                        }
                    }
                } else {
                    // Fallback to execCommand without selection restoration
                    document.execCommand('createLink', false, sanitizedUrl);
                }
            } catch (error) {
                console.warn('Link creation failed:', error.message);
                alert('Failed to create link. Please try again.');
                return;
            }
        }

        // Save state for undo/redo
        if (this.editor && this.editor.stateHistory) {
            this.editor.stateHistory.saveState();
        }

        this.close();
    }

    removeLink() {
        if (this.targetLink) {
            // Move all child nodes out of the link element
            const parent = this.targetLink.parentNode;
            while (this.targetLink.firstChild) {
                parent.insertBefore(this.targetLink.firstChild, this.targetLink);
            }
            
            // Remove the now-empty link element
            parent.removeChild(this.targetLink);
            
            // Save state for undo/redo
            if (this.editor && this.editor.stateHistory) {
                this.editor.stateHistory.saveState();
            }
        }
        
        this.close();
    }

    sanitizeURL(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }
        
        // Trim and normalize
        url = url.trim();
        if (!url) {
            return null;
        }
        
        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:', 'about:'];
        const lowerUrl = url.toLowerCase();
        
        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return null;
            }
        }
        
        // Allow safe protocols (including relative URLs and anchors)
        const allowedPattern = /^(https?:\/\/|mailto:|tel:|\/\/|\/|#)/i;
        
        if (allowedPattern.test(url)) {
            return url;
        }
        
        // Auto-add https:// for domain-like strings (more permissive)
        if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*(:[0-9]+)?(\/.*)?\/?$/.test(url)) {
            return 'https://' + url;
        }
        
        // If nothing matches, still allow it but warn
        console.warn('URL format not recognized, allowing but recommend using full URLs:', url);
        return url;
    }
}