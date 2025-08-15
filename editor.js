(function() {
    'use strict';

    class Editor {
        constructor() {
            this.editableArea = document.getElementById('editable-area');
            this.currentMode = 'edit';
            this.snippetPanel = null;
            this.dragDropManager = null;
            this.stateHistory = null;
            this.formattingToolbar = null;
            this.styleEditorModal = null;
            this.codeEditorModal = null;
            this.imageUploader = null;
            this.videoSettingsModal = null;
            this.confirmationModal = null;
            
            this.init();
        }

        init() {
            this.snippetPanel = new SnippetPanel(this);
            this.dragDropManager = new DragDropManager(this);
            this.stateHistory = new StateHistory(this);
            this.formattingToolbar = new FormattingToolbar(this);
            this.styleEditorModal = new StyleEditorModal(this);
            this.setupPanelToggle();
            this.codeEditorModal = new CodeEditorModal(this);
            this.imageUploader = new ImageUploader(this);
            this.videoSettingsModal = new VideoSettingsModal(this);
            this.confirmationModal = new ConfirmationModal(this);
            this.pageSettingsModal = new PageSettingsModal(this);
            
            this.attachEventListeners();
            this.setupMutationObserver();
            this.setupResizing();
        }

        setupPanelToggle() {
            const handle = document.getElementById('panel-handle');
            const panel = document.getElementById('snippet-panel');
            const editorMain = document.querySelector('.editor-main');
            
            const togglePanel = () => {
                const isOpen = panel.classList.contains('open');
                
                if (isOpen) {
                    // Close panel
                    panel.classList.remove('open');
                    editorMain.classList.remove('panel-open');
                } else {
                    // Open panel
                    panel.classList.add('open');
                    editorMain.classList.add('panel-open');
                }
            };

            // Toggle on handle click
            handle.addEventListener('click', togglePanel);
            
            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && panel.classList.contains('open')) {
                    togglePanel();
                }
            });
        }

        attachEventListeners() {
            document.getElementById('toggle-mode-btn').addEventListener('click', () => this.toggleMode());
            document.getElementById('undo-btn').addEventListener('click', () => this.stateHistory.undo());
            document.getElementById('redo-btn').addEventListener('click', () => this.stateHistory.redo());
            document.getElementById('save-btn').addEventListener('click', () => this.save());
            document.getElementById('load-btn').addEventListener('click', () => this.load());
            document.getElementById('export-html-btn').addEventListener('click', () => this.exportHTML());

            // Viewport control event listeners
            document.getElementById('mobile-viewport').addEventListener('click', () => this.setViewportSize('375px'));
            document.getElementById('tablet-viewport').addEventListener('click', () => this.setViewportSize('768px'));
            document.getElementById('desktop-viewport').addEventListener('click', () => this.setViewportSize('100%'));

            this.editableArea.addEventListener('click', (e) => {
                // Check if the clicked element or its parent is an icon or drag handle
                const target = e.target.closest('.edit-icon, .code-icon, .delete-icon, .settings-icon, .drag-handle');
                
                if (!target) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                if (target.classList.contains('edit-icon')) {
                    console.log('Edit icon clicked');
                    const element = target.closest('.editor-block, .editor-snippet');
                    console.log('Element to edit:', element);
                    if (element) {
                        console.log('Opening style modal, modal exists:', !!this.styleEditorModal);
                        this.styleEditorModal.open(element);
                    }
                } else if (target.classList.contains('code-icon')) {
                    console.log('Code icon clicked');
                    const element = target.closest('.editor-block, .editor-snippet');
                    console.log('Element to edit:', element);
                    if (element) {
                        console.log('Opening code modal, modal exists:', !!this.codeEditorModal);
                        this.codeEditorModal.open(element);
                    }
                } else if (target.classList.contains('delete-icon')) {
                    const element = target.closest('.editor-block, .editor-snippet');
                    this.deleteElement(element);
                } else if (target.classList.contains('settings-icon')) {
                    const snippet = target.closest('.editor-snippet');
                    if (snippet && snippet.classList.contains('video-snippet')) {
                        this.videoSettingsModal.open(snippet);
                    }
                } else if (target.classList.contains('drag-handle')) {
                    // Drag handles are handled by mousedown event, not click
                    // This is just to prevent the click from propagating
                }
            });

            this.editableArea.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const element = e.target.closest('.editor-block, .editor-snippet');
                if (element && this.currentMode === 'edit') {
                    this.showContextMenu(e, element);
                }
            });
        }

        setupMutationObserver() {
            let timeout;
            const observer = new MutationObserver(() => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.stateHistory.saveState();
                }, 300);
            });

            observer.observe(this.editableArea, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeOldValue: true,
                characterData: true,
                characterDataOldValue: true
            });
        }

        setupResizing() {
            let resizing = false;
            let currentElement = null;
            let startX = 0;
            let startY = 0;
            let startWidth = 0;
            let startHeight = 0;
            let resizeType = '';

            this.editableArea.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('resizer-handle')) {
                    e.preventDefault();
                    resizing = true;
                    currentElement = e.target.closest('.editor-block, .editor-snippet');
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(window.getComputedStyle(currentElement).width, 10);
                    startHeight = parseInt(window.getComputedStyle(currentElement).height, 10);
                    
                    if (e.target.classList.contains('right')) {
                        resizeType = 'width';
                    } else if (e.target.classList.contains('bottom')) {
                        resizeType = 'height';
                    } else if (e.target.classList.contains('corner')) {
                        resizeType = 'both';
                    }
                    
                    document.body.style.cursor = e.target.style.cursor;
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (!resizing) return;
                
                if (resizeType === 'width' || resizeType === 'both') {
                    const width = startWidth + e.clientX - startX;
                    currentElement.style.width = width + 'px';
                }
                
                if (resizeType === 'height' || resizeType === 'both') {
                    const height = startHeight + e.clientY - startY;
                    currentElement.style.height = height + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                if (resizing) {
                    resizing = false;
                    currentElement = null;
                    document.body.style.cursor = '';
                    this.stateHistory.saveState();
                }
            });
        }

        toggleMode() {
            const btn = document.getElementById('toggle-mode-btn');
            const panel = document.getElementById('snippet-panel');
            const handle = document.getElementById('panel-handle');
            const editorMain = document.querySelector('.editor-main');
            
            if (this.currentMode === 'edit') {
                this.currentMode = 'display';
                this.editableArea.setAttribute('data-mode', 'display');
                btn.textContent = 'Switch to Edit Mode';
                
                // Hide panel and handle in display mode
                panel.classList.remove('open');
                editorMain.classList.remove('panel-open');
                handle.style.display = 'none';
            } else {
                this.currentMode = 'edit';
                this.editableArea.setAttribute('data-mode', 'edit');
                btn.textContent = 'Switch to Display Mode';
                
                // Show handle in edit mode (panel stays closed by default)
                handle.style.display = 'flex';
            }
        }

        setViewportSize(width) {
            this.editableArea.style.maxWidth = width;
            this.editableArea.style.margin = width === '100%' ? '0' : '0 auto';
            
            // Update active button
            document.querySelectorAll('.viewport-btn').forEach(btn => btn.classList.remove('active'));
            if (width === '375px') {
                document.getElementById('mobile-viewport').classList.add('active');
            } else if (width === '768px') {
                document.getElementById('tablet-viewport').classList.add('active');
            } else {
                document.getElementById('desktop-viewport').classList.add('active');
            }
        }

        deleteElement(element) {
            if (!element) return;
            
            const elementType = element.classList.contains('editor-block') ? 'block' : 'snippet';
            const message = elementType === 'block' 
                ? 'Are you sure you want to delete this block? This will also delete all snippets inside it.'
                : 'Are you sure you want to delete this snippet?';
            
            this.confirmationModal.show(
                'Delete ' + elementType,
                message,
                () => {
                    // On confirm
                    element.remove();
                    this.stateHistory.saveState();
                    
                    // If no blocks remain, show the placeholder again
                    if (this.editableArea.querySelectorAll('.editor-block').length === 0) {
                        if (!this.editableArea.querySelector('.drop-zone-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'drop-zone-placeholder';
                            placeholder.innerHTML = '<p>Drag blocks and snippets here to start building</p>';
                            this.editableArea.appendChild(placeholder);
                        }
                    }
                }
            );
        }

        showContextMenu(e, element) {
            const menu = document.createElement('div');
            menu.className = 'context-menu active';
            menu.style.left = e.pageX + 'px';
            menu.style.top = e.pageY + 'px';

            const items = [
                { text: 'Duplicate', action: () => this.duplicateElement(element) },
                { text: 'Delete', action: () => this.deleteElement(element) },
                { text: 'Save as Snippet', action: () => this.saveAsSnippet(element) }
            ];

            items.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'context-menu-item';
                menuItem.textContent = item.text;
                menuItem.addEventListener('click', () => {
                    item.action();
                    menu.remove();
                });
                menu.appendChild(menuItem);
            });

            document.body.appendChild(menu);

            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };

            setTimeout(() => {
                document.addEventListener('click', closeMenu);
            }, 0);
        }

        duplicateElement(element) {
            const clone = element.cloneNode(true);
            element.parentNode.insertBefore(clone, element.nextSibling);
            this.stateHistory.saveState();
        }

        saveAsSnippet(element) {
            const name = prompt('Enter a name for this snippet:');
            if (name) {
                const snippets = JSON.parse(localStorage.getItem('customSnippets') || '[]');
                snippets.push({
                    name: name,
                    html: element.outerHTML
                });
                localStorage.setItem('customSnippets', JSON.stringify(snippets));
                alert('Snippet saved successfully!');
                this.snippetPanel.loadCustomSnippets();
            }
        }

        save() {
            const pageData = this.serializePageToJSON();
            localStorage.setItem('editorPageData', JSON.stringify(pageData));
            alert('Page saved successfully!');
        }

        load() {
            const savedData = localStorage.getItem('editorPageData');
            if (savedData) {
                const pageData = JSON.parse(savedData);
                this.deserializeJSONToPage(pageData);
                alert('Page loaded successfully!');
            } else {
                alert('No saved page found!');
            }
        }

        exportHTML() {
            const html = this.getCleanHTML();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exported-page.html';
            a.click();
            URL.revokeObjectURL(url);
        }

        getCleanHTML() {
            const clone = this.editableArea.cloneNode(true);
            
            clone.removeAttribute('data-mode');
            clone.querySelectorAll('.drop-zone-placeholder').forEach(el => el.remove());
            clone.querySelectorAll('.edit-icon, .code-icon, .delete-icon, .settings-icon').forEach(el => el.remove());
            clone.querySelectorAll('.drag-handle').forEach(el => el.remove());
            clone.querySelectorAll('.resizer-handle').forEach(el => el.remove());
            clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
            clone.querySelectorAll('[draggable]').forEach(el => el.removeAttribute('draggable'));
            clone.querySelectorAll('.editor-block, .editor-snippet').forEach(el => {
                el.classList.remove('editor-block', 'editor-snippet');
            });

            const styles = `
                <style>
                    * { box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
                    img { max-width: 100%; height: auto; }
                    iframe { max-width: 100%; }
                </style>
            `;

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Page</title>
    ${styles}
</head>
<body>
    ${clone.innerHTML}
</body>
</html>`;
        }

        serializePageToJSON() {
            const blocks = [];
            this.editableArea.querySelectorAll('.editor-block').forEach((block, blockIndex) => {
                const snippets = [];
                block.querySelectorAll('.editor-snippet').forEach((snippet, snippetIndex) => {
                    const snippetData = {
                        snippet_id: `snippet-${blockIndex}-${snippetIndex}`,
                        type: this.getSnippetType(snippet),
                        styles: this.extractInlineStyles(snippet),
                        content: snippet.innerHTML
                    };

                    if (snippet.classList.contains('video-snippet')) {
                        const iframe = snippet.querySelector('iframe');
                        if (iframe) {
                            snippetData.video_data = {
                                url: iframe.src
                            };
                        }
                    }

                    snippets.push(snippetData);
                });

                blocks.push({
                    block_id: `block-${blockIndex}`,
                    styles: this.extractInlineStyles(block),
                    snippets: snippets
                });
            });

            return {
                page_title: document.title,
                page_settings: this.pageSettingsModal ? this.pageSettingsModal.getPageData() : {},
                layout: {
                    blocks: blocks
                }
            };
        }

        deserializeJSONToPage(pageData) {
            this.editableArea.innerHTML = '';
            
            // Load page settings if they exist
            if (pageData.page_settings && this.pageSettingsModal) {
                this.pageSettingsModal.setPageData(pageData.page_settings);
                
                // Update document title if page title is set
                if (pageData.page_settings.pageTitle) {
                    document.title = pageData.page_settings.pageTitle;
                }
            }
            
            pageData.layout.blocks.forEach(blockData => {
                const block = this.createBlock();
                this.applyInlineStyles(block, blockData.styles);
                
                blockData.snippets.forEach(snippetData => {
                    const snippet = this.createSnippet(snippetData.type);
                    this.applyInlineStyles(snippet, snippetData.styles);
                    snippet.innerHTML = snippetData.content;
                    
                    if (snippetData.type === 'video' && snippetData.video_data) {
                        this.setupVideoSnippet(snippet, snippetData.video_data.url);
                    }
                    
                    block.appendChild(snippet);
                });
                
                this.editableArea.appendChild(block);
            });

            this.stateHistory.saveState();
        }

        createBlock(template = null) {
            const block = document.createElement('div');
            block.className = 'editor-block';
            block.draggable = true;  // Make blocks draggable by default
            
            const controls = `
                <span class="drag-handle">⋮⋮</span>
                <button class="edit-icon" title="Edit Styles">✏️</button>
                <button class="code-icon" title="Edit HTML">&lt;/&gt;</button>
                <button class="delete-icon" title="Delete">🗑️</button>
                <div class="resizer-handle right"></div>
                <div class="resizer-handle bottom"></div>
                <div class="resizer-handle corner"></div>
            `;
            
            if (template) {
                // Parse the template and extract the content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = template;
                const templateBlock = tempDiv.firstElementChild;
                if (templateBlock) {
                    block.innerHTML = controls + templateBlock.innerHTML;
                    // Copy any inline styles from the template
                    if (templateBlock.style.cssText) {
                        block.style.cssText = templateBlock.style.cssText;
                    }
                    
                    // Make text content editable
                    const textElements = block.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div:not([class*="handle"]):not([class*="icon"])');
                    textElements.forEach(el => {
                        // Don't make elements with control buttons editable
                        if (!el.querySelector('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon') && 
                            !el.classList.contains('drag-handle') && 
                            !el.classList.contains('edit-icon') && 
                            !el.classList.contains('code-icon') && 
                            !el.classList.contains('delete-icon') && 
                            !el.classList.contains('settings-icon')) {
                            el.contentEditable = true;
                        }
                    });
                }
            } else {
                block.innerHTML = controls;
            }
            
            return block;
        }

        createSnippet(type = 'text', template = null) {
            const snippet = document.createElement('div');
            snippet.className = `editor-snippet ${type}-snippet`;
            snippet.draggable = true;  // Make snippets draggable by default
            
            // Add the controls
            const controls = `
                <span class="drag-handle">⋮⋮</span>
                <button class="edit-icon" title="Edit Styles">✏️</button>
                <button class="code-icon" title="Edit HTML">&lt;/&gt;</button>
                <button class="delete-icon" title="Delete">🗑️</button>
            `;
            
            // Set the content based on type or template
            if (template) {
                // Use the template content if provided
                snippet.innerHTML = controls + template;
                // Make text content editable
                const textElements = snippet.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div:not([class*="handle"]):not([class*="icon"])');
                textElements.forEach(el => {
                    // Don't make elements with control buttons editable
                    if (!el.querySelector('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon') && 
                        !el.classList.contains('drag-handle') && 
                        !el.classList.contains('edit-icon') && 
                        !el.classList.contains('code-icon') && 
                        !el.classList.contains('delete-icon') && 
                        !el.classList.contains('settings-icon')) {
                        el.contentEditable = true;
                    }
                });
            } else if (type === 'video') {
                snippet.innerHTML = controls + '<button class="settings-icon" title="Video Settings">⚙️</button><div class="video-placeholder">Click settings to add video URL</div>';
            } else if (type === 'image') {
                snippet.innerHTML = controls + '<div class="image-upload-zone">Click or drag image here</div>';
            } else {
                // Default text snippet
                snippet.contentEditable = true;
                snippet.innerHTML = controls + '<p>Edit this text...</p>';
            }
            
            return snippet;
        }

        setupVideoSnippet(snippet, url) {
            const placeholder = snippet.querySelector('.video-placeholder');
            if (placeholder) {
                placeholder.remove();
            }
            
            const existingIframe = snippet.querySelector('iframe');
            if (existingIframe) {
                existingIframe.src = url;
            } else {
                const iframe = document.createElement('iframe');
                iframe.src = url;
                iframe.frameBorder = '0';
                iframe.allowFullscreen = true;
                snippet.appendChild(iframe);
            }
        }

        getSnippetType(snippet) {
            if (snippet.classList.contains('video-snippet')) return 'video';
            if (snippet.classList.contains('image-snippet')) return 'image';
            return 'text';
        }

        extractInlineStyles(element) {
            const styles = {};
            const computedStyles = window.getComputedStyle(element);
            const properties = ['padding', 'margin', 'border', 'background', 'width', 'height'];
            
            properties.forEach(prop => {
                const value = element.style[prop];
                if (value) {
                    styles[prop] = value;
                }
            });
            
            return styles;
        }

        applyInlineStyles(element, styles) {
            Object.entries(styles).forEach(([prop, value]) => {
                element.style[prop] = value;
            });
        }
    }

    class SnippetPanel {
        constructor(editor) {
            this.editor = editor;
            this.snippetList = document.getElementById('snippet-list');
            this.init();
        }

        init() {
            this.loadSnippets();
            this.loadCustomSnippets();
        }

        loadSnippets() {
            this.snippetList.innerHTML = '';
            
            // Load blocks
            const blocks = getBlocks();
            blocks.forEach(block => {
                const item = this.createSnippetItem(block);
                this.snippetList.appendChild(item);
            });
            
            // Add separator
            const separator = document.createElement('hr');
            separator.style.margin = '1rem 0';
            this.snippetList.appendChild(separator);
            
            // Load snippets
            const snippets = getSnippets();
            snippets.forEach(snippet => {
                const item = this.createSnippetItem(snippet);
                this.snippetList.appendChild(item);
            });

            this.attachDragListeners();
        }

        createSnippetItem(definition) {
            const item = document.createElement('div');
            item.className = definition.type === 'block' ? 'block-item' : 'snippet-item';
            item.draggable = true;
            item.dataset.type = definition.type;
            item.dataset.snippetType = definition.snippetType || '';
            item.dataset.template = definition.html;
            item.dataset.snippetId = definition.id;
            
            if (definition.preview === 'image' && definition.previewImage) {
                // Create image preview
                const img = document.createElement('img');
                img.src = definition.previewImage;
                img.alt = definition.name;
                img.title = definition.name;
                img.style.width = '100%';
                img.style.height = 'auto';
                img.style.maxHeight = '60px';
                img.style.objectFit = 'contain';
                img.style.borderRadius = '4px';
                item.appendChild(img);
                
                // Add text label below image
                const label = document.createElement('div');
                label.textContent = definition.name;
                label.style.fontSize = '0.75rem';
                label.style.textAlign = 'center';
                label.style.marginTop = '0.25rem';
                label.style.color = '#6b7280';
                item.appendChild(label);
            } else {
                // Use text label
                item.textContent = definition.name;
            }
            
            return item;
        }

        loadCustomSnippets() {
            const customSnippets = JSON.parse(localStorage.getItem('customSnippets') || '[]');
            
            if (customSnippets.length > 0) {
                const separator = document.createElement('hr');
                separator.style.margin = '1rem 0';
                this.snippetList.appendChild(separator);
                
                const title = document.createElement('h3');
                title.textContent = 'Custom Snippets';
                title.style.fontSize = '0.875rem';
                title.style.marginBottom = '0.5rem';
                this.snippetList.appendChild(title);
                
                customSnippets.forEach(snippet => {
                    const item = document.createElement('div');
                    item.className = 'snippet-item';
                    item.draggable = true;
                    item.textContent = snippet.name;
                    item.dataset.type = 'custom';
                    item.dataset.template = snippet.html;
                    this.snippetList.appendChild(item);
                });
            }
            
            this.attachDragListeners();
        }

        attachDragListeners() {
            this.snippetList.querySelectorAll('[draggable="true"]').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    console.log('PANEL dragstart - dragging NEW element from panel:', item.dataset.type);
                    e.dataTransfer.effectAllowed = 'copy';
                    e.dataTransfer.setData('elementType', item.dataset.type);
                    e.dataTransfer.setData('snippetType', item.dataset.snippetType || '');
                    e.dataTransfer.setData('template', item.dataset.template || '');
                    
                    // Set drag operation tracking
                    this.editor.dragDropManager.currentDragOperation = { 
                        type: item.dataset.type, 
                        isExisting: false 
                    };
                    
                    // Add visual feedback
                    item.classList.add('dragging');
                    
                    // Create a custom drag image with better styling
                    const dragImage = item.cloneNode(true);
                    dragImage.style.transform = 'rotate(2deg)';
                    dragImage.style.opacity = '0.8';
                    dragImage.style.background = 'white';
                    dragImage.style.border = '2px solid #3b82f6';
                    dragImage.style.borderRadius = '8px';
                    dragImage.style.padding = '0.5rem';
                    dragImage.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    dragImage.style.position = 'absolute';
                    dragImage.style.top = '-1000px';
                    dragImage.style.zIndex = '9999';
                    
                    document.body.appendChild(dragImage);
                    e.dataTransfer.setDragImage(dragImage, 75, 30);
                    
                    // Remove the drag image after a short delay
                    setTimeout(() => {
                        if (document.body.contains(dragImage)) {
                            document.body.removeChild(dragImage);
                        }
                    }, 100);
                    
                    // Highlight potential drop zones
                    this.highlightDropZones(item.dataset.type);
                });

                item.addEventListener('dragend', () => {
                    item.classList.remove('dragging');
                    this.clearDropZoneHighlights();
                });
            });
        }

        highlightDropZones(elementType) {
            const area = this.editor.editableArea;
            
            if (elementType === 'snippet') {
                // Highlight all blocks as potential drop zones
                area.querySelectorAll('.editor-block').forEach(block => {
                    block.style.outline = '2px dashed #10b981';
                    block.style.outlineOffset = '4px';
                });
                
                // Show message if no blocks exist
                if (area.querySelectorAll('.editor-block').length === 0) {
                    const message = document.createElement('div');
                    message.className = 'drop-zone-message';
                    message.textContent = 'Drop a container block first, then add snippets to it';
                    message.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #fef3c7;
                        border: 2px solid #d97706;
                        padding: 1rem;
                        border-radius: 8px;
                        font-weight: 500;
                        z-index: 1000;
                        pointer-events: none;
                    `;
                    area.appendChild(message);
                }
            } else {
                // Highlight main area for blocks
                area.style.outline = '3px dashed #3b82f6';
                area.style.outlineOffset = '8px';
            }
        }

        clearDropZoneHighlights() {
            const area = this.editor.editableArea;
            
            // Remove highlights from blocks
            area.querySelectorAll('.editor-block').forEach(block => {
                block.style.outline = '';
                block.style.outlineOffset = '';
            });
            
            // Remove highlight from main area
            area.style.outline = '';
            area.style.outlineOffset = '';
            
            // Remove any messages
            area.querySelectorAll('.drop-zone-message').forEach(msg => msg.remove());
        }
    }

    class DragDropManager {
        constructor(editor) {
            this.editor = editor;
            this.currentDragOperation = null;
            this.currentTargetBlock = null;
            this.originalPosition = null;
            this.init();
        }

        init() {
            this.setupDropZone();
            this.setupElementDragging();
        }

        setupDropZone() {
            const area = this.editor.editableArea;
            let currentInsertionLine = null;
            let currentDropOverlay = null;

            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                
                const elementType = e.dataTransfer.getData('elementType') || this.currentDragOperation?.type || this.getCurrentDragType(e);
                
                // For existing snippets, allow dragging over intermediate areas but check drop target later
                if (elementType === 'snippet' && this.currentDragOperation?.isExisting) {
                    // Don't set dropEffect to 'none' during dragover - let the drop handler validate the final target
                }
                
                e.dataTransfer.dropEffect = 'copy';
                
                // Store the current target block BEFORE clearing indicators
                let targetBlock = null;
                if (elementType === 'snippet') {
                    // First check if we're hovering over a specific column
                    const targetColumn = e.target.closest('.column');
                    if (targetColumn) {
                        targetBlock = targetColumn;
                    } else {
                        targetBlock = e.target.closest('.editor-block');
                    }
                }
                
                // Clear previous indicators
                this.clearVisualIndicators();
                
                if (elementType === 'snippet') {
                    // For snippets, highlight valid blocks and show insertion points
                    const block = targetBlock;
                    this.currentTargetBlock = block;
                    if (block) {
                        block.classList.add('valid-drop-target');
                        
                        // Show insertion line for snippet positioning within the block
                        const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
                        if (snippets.length > 0) {
                            const insertionPoint = this.getSnippetInsertionPointWithPosition(block, e.clientY);
                            if (insertionPoint) {
                                currentInsertionLine = this.createInsertionLine(insertionPoint);
                                block.style.position = 'relative';
                                block.appendChild(currentInsertionLine);
                            }
                        } else {
                            // No existing snippets - show overlay
                            if (!block.querySelector('.drop-zone-overlay')) {
                                currentDropOverlay = document.createElement('div');
                                currentDropOverlay.className = 'drop-zone-overlay snippet-drop-zone-overlay';
                                block.appendChild(currentDropOverlay);
                            }
                        }
                    }
                } else if (elementType === 'block' || elementType === 'custom') {
                    const existingBlocks = area.querySelectorAll('.editor-block').length;
                    
                    if (existingBlocks === 0) {
                        // Empty area - show drop overlay instead of insertion line
                        area.style.background = 'rgba(59, 130, 246, 0.05)';
                        area.style.borderColor = '#3b82f6';
                        
                        // Add drop overlay to the main area
                        currentDropOverlay = document.createElement('div');
                        currentDropOverlay.className = 'drop-zone-overlay';
                        currentDropOverlay.style.position = 'absolute';
                        currentDropOverlay.style.top = '20px';
                        currentDropOverlay.style.left = '20px';
                        currentDropOverlay.style.right = '20px';
                        currentDropOverlay.style.bottom = '20px';
                        currentDropOverlay.style.zIndex = '999';
                        area.style.position = 'relative';
                        area.appendChild(currentDropOverlay);
                    } else {
                        // Has blocks - show insertion line
                        const insertionPoint = this.getInsertionPoint(area, e.clientY);
                        if (insertionPoint) {
                            currentInsertionLine = this.createInsertionLine(insertionPoint);
                            area.style.position = 'relative'; // Ensure relative positioning for absolute children
                            area.appendChild(currentInsertionLine);
                        }
                    }
                }
                
                // Handle repositioning of existing elements during drag
                const afterElement = this.getDragAfterElement(area, e.clientY);
                const dragging = document.querySelector('.dragging-element');
                
                if (dragging) {
                    if (afterElement == null) {
                        area.appendChild(dragging);
                    } else {
                        area.insertBefore(dragging, afterElement);
                    }
                }
            });
            
            area.addEventListener('dragleave', (e) => {
                // Only clear if actually leaving the main area
                if (!area.contains(e.relatedTarget)) {
                    this.clearVisualIndicators();
                }
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                
                // Capture dragging element BEFORE clearing visual indicators
                const draggingElement = document.querySelector('.dragging-element');
                
                // Clear all visual indicators
                this.clearVisualIndicators();
                
                const elementType = e.dataTransfer.getData('elementType') || this.currentDragOperation?.type;
                let snippetType = e.dataTransfer.getData('snippetType') || (this.currentDragOperation?.isExisting ? 'existing' : '');
                const template = e.dataTransfer.getData('template');
                
                // For existing elements, override snippetType to 'existing'
                if (this.currentDragOperation?.isExisting && elementType === 'snippet') {
                    console.log('Overriding snippetType from', snippetType, 'to existing');
                    snippetType = 'existing';
                }
                
                console.log('Drop event:', {
                    elementType,
                    snippetType,
                    currentDragOperation: this.currentDragOperation,
                    draggingElement,
                    isDraggingSnippet: draggingElement?.classList.contains('editor-snippet'),
                    currentTargetBlock: this.currentTargetBlock,
                    isExisting: this.currentDragOperation?.isExisting,
                    shouldOverride: (this.currentDragOperation?.isExisting && elementType === 'snippet')
                });
                
                if (elementType === 'block') {
                    const block = this.editor.createBlock(template);
                    
                    const afterElement = this.getDragAfterElement(area, e.clientY);
                    if (afterElement == null) {
                        area.appendChild(block);
                    } else {
                        area.insertBefore(block, afterElement);
                    }
                    
                    this.editor.stateHistory.saveState();
                } else if (elementType === 'snippet') {
                    // First check if we're dropping into a specific column
                    let targetContainer = e.target.closest('.column');
                    let closestBlock = null;
                    
                    if (targetContainer) {
                        // Dropping into a column
                        closestBlock = targetContainer;
                        console.log('Snippet drop into column:', targetContainer);
                    } else {
                        // Use the target block stored during dragover OR try to find it now
                        closestBlock = this.currentTargetBlock || e.target.closest('.editor-block');
                        console.log('Snippet drop into block:', closestBlock);
                    }
                    
                    console.log('Snippet drop - target container:', targetContainer, 'closest block:', closestBlock);
                    if (closestBlock) {
                        if (snippetType === 'existing') {
                            // Moving an existing snippet
                            const dragging = draggingElement;
                            console.log('Moving existing snippet:', {
                                dragging,
                                closestBlock,
                                draggingParent: dragging?.parentNode,
                                blockChildren: closestBlock ? [...closestBlock.children].map(c => c.className) : []
                            });
                            
                            if (dragging && dragging.classList.contains('editor-snippet')) {
                                // Insert existing snippet at the correct position within the block
                                const afterElement = this.getSnippetInsertionPoint(closestBlock, e.clientY);
                                console.log('Insertion details:', {
                                    afterElement,
                                    insertionMethod: afterElement ? 'insertBefore' : 'appendChild'
                                });
                                
                                if (afterElement == null) {
                                    console.log('Appending to block');
                                    closestBlock.appendChild(dragging);
                                } else {
                                    console.log('Inserting before:', afterElement);
                                    closestBlock.insertBefore(dragging, afterElement);
                                }
                                
                                console.log('After insertion - parent:', dragging.parentNode, 'parent class:', dragging.parentNode?.className);
                            }
                        } else {
                            // Creating a new snippet from the panel
                            const snippet = this.editor.createSnippet(snippetType, template);
                            
                            // Insert snippet at the correct position within the block
                            const afterElement = this.getSnippetInsertionPoint(closestBlock, e.clientY);
                            if (afterElement == null) {
                                closestBlock.appendChild(snippet);
                            } else {
                                closestBlock.insertBefore(snippet, afterElement);
                            }
                            
                            if (snippetType === 'image') {
                                this.editor.imageUploader.setupImageSnippet(snippet);
                            }
                        }
                        
                        this.editor.stateHistory.saveState();
                        this.originalPosition = null; // Clear since drop was successful
                    } else {
                        // Invalid drop - restore to original position and show styled modal
                        this.restoreOriginalPosition();
                        this.showInvalidDropModal();
                    }
                } else {
                    // Handle moving existing blocks (snippets are now handled above)
                    const dragging = draggingElement;
                    console.log('Fallback path - dragging element:', dragging, 'classes:', dragging?.className, 'elementType:', elementType, 'snippetType:', snippetType);
                    
                    if (dragging && dragging.classList.contains('editor-snippet')) {
                        console.log('ERROR: Snippet fell through to block handling code! This should not happen.');
                        console.log('Snippet will be moved to main area instead of staying in block');
                        // This shouldn't happen - snippets should be handled above
                        // But let's see if this is what's causing the issue
                        return;
                    }
                    
                    if (dragging && dragging.classList.contains('editor-block')) {
                        // Moving a block - insert into main area
                        const afterElement = this.getDragAfterElement(area, e.clientY);
                        if (afterElement == null) {
                            area.appendChild(dragging);
                        } else {
                            area.insertBefore(dragging, afterElement);
                        }
                        
                        this.editor.stateHistory.saveState();
                    }
                }
                
                // Remove placeholder if exists and there's content
                const placeholder = area.querySelector('.drop-zone-placeholder');
                if (placeholder && area.querySelectorAll('.editor-block').length > 0) {
                    placeholder.remove();
                }
                
                // Clear target block reference after drop
                this.currentTargetBlock = null;
            });
        }

        setupElementDragging() {
            const area = this.editor.editableArea;

            // Add a global mousedown listener to catch ALL clicks
            document.addEventListener('mousedown', (e) => {
                console.log('Global mousedown:', e.target, 'classes:', e.target.className, 'tagName:', e.target.tagName);
            });

            // Add global drop event listener to catch ALL drops
            document.addEventListener('drop', (e) => {
                console.log('GLOBAL drop event on:', e.target, 'classes:', e.target.className);
            });

            // Add global dragend event listener
            document.addEventListener('dragend', (e) => {
                console.log('GLOBAL dragend event on:', e.target, 'classes:', e.target.className);
            });

            // Add a helper function to inspect existing snippets
            window.inspectSnippets = () => {
                const snippets = document.querySelectorAll('.editor-snippet');
                console.log('Found', snippets.length, 'snippets:');
                snippets.forEach((snippet, i) => {
                    const dragHandle = snippet.querySelector('.drag-handle');
                    console.log(`Snippet ${i}:`, {
                        element: snippet,
                        draggable: snippet.draggable,
                        hasDragHandle: !!dragHandle,
                        dragHandle: dragHandle,
                        innerHTML: snippet.innerHTML.substring(0, 100) + '...'
                    });
                });
            };

            area.addEventListener('mousedown', (e) => {
                console.log('Mousedown on:', e.target, 'classes:', e.target.className);
                if (e.target.classList.contains('drag-handle')) {
                    console.log('Clicked on drag handle - element should already be draggable');
                    const element = e.target.closest('.editor-block, .editor-snippet');
                    console.log('Element draggable:', element?.draggable, 'element:', element);
                    
                    // Add temporary listeners to track the drag sequence
                    const mousemove = (e) => {
                        console.log('Mouse moving after drag handle mousedown');
                        document.removeEventListener('mousemove', mousemove);
                    };
                    const mouseup = (e) => {
                        console.log('Mouseup after drag handle mousedown');
                        document.removeEventListener('mousemove', mousemove);
                        document.removeEventListener('mouseup', mouseup);
                    };
                    document.addEventListener('mousemove', mousemove);
                    document.addEventListener('mouseup', mouseup);
                }
            });

            area.addEventListener('mouseup', (e) => {
                // Clean up draggable state if user clicked but didn't drag
                const draggableElements = area.querySelectorAll('[draggable="true"]');
                draggableElements.forEach(el => {
                    if (!el.classList.contains('dragging-element')) {
                        el.draggable = false;
                    }
                });
            });

            area.addEventListener('dragstart', (e) => {
                // Dragstart for existing elements
                if (e.target.classList.contains('editor-block') || e.target.classList.contains('editor-snippet')) {
                    // Successfully dragging existing element
                    
                    // Store original position for potential restoration
                    this.originalPosition = {
                        element: e.target,
                        parent: e.target.parentNode,
                        nextSibling: e.target.nextSibling
                    };
                    
                    e.dataTransfer.effectAllowed = 'copy';  // Changed from 'move' to 'copy' to match panel elements
                    
                    // Set the data for existing element reordering
                    if (e.target.classList.contains('editor-block')) {
                        e.dataTransfer.setData('elementType', 'block');
                        this.currentDragOperation = { type: 'block', isExisting: true };
                        console.log('Set currentDragOperation for existing block:', this.currentDragOperation);
                    } else {
                        e.dataTransfer.setData('elementType', 'snippet');
                        e.dataTransfer.setData('snippetType', 'existing');
                        this.currentDragOperation = { type: 'snippet', isExisting: true };
                        console.log('Set currentDragOperation for existing snippet:', this.currentDragOperation);
                    }
                    e.dataTransfer.setData('template', e.target.outerHTML);
                    
                    // Create a proper drag image that follows cursor
                    const dragImage = e.target.cloneNode(true);
                    dragImage.style.position = 'absolute';
                    dragImage.style.top = '-1000px';
                    dragImage.style.left = '-1000px';
                    dragImage.style.width = e.target.offsetWidth + 'px';
                    dragImage.style.height = e.target.offsetHeight + 'px';
                    dragImage.style.opacity = '0.8';
                    dragImage.style.transform = 'rotate(2deg)';
                    dragImage.style.border = '2px solid #3b82f6';
                    dragImage.style.borderRadius = '4px';
                    dragImage.style.background = 'white';
                    dragImage.style.pointerEvents = 'none';
                    
                    // Remove controls from drag image
                    dragImage.querySelectorAll('.drag-handle, .edit-icon, .code-icon, .delete-icon, .settings-icon, .resizer-handle').forEach(el => el.remove());
                    
                    document.body.appendChild(dragImage);
                    e.dataTransfer.setDragImage(dragImage, e.offsetX || 20, e.offsetY || 20);
                    
                    // Clean up drag image
                    setTimeout(() => {
                        if (document.body.contains(dragImage)) {
                            document.body.removeChild(dragImage);
                        }
                    }, 100);
                    
                    // Hide the original element that gets moved by browser
                    e.target.classList.add('dragging-element');
                }
            });

            area.addEventListener('dragend', (e) => {
                this.currentDragOperation = null; // Clear drag tracking
                this.currentTargetBlock = null; // Clear target block reference
                this.originalPosition = null; // Clear original position tracking
                if (e.target.classList.contains('editor-block') || e.target.classList.contains('editor-snippet')) {
                    e.target.classList.remove('dragging-element');
                    // Keep draggable = true so element can be dragged again
                    // Reset any inline styles that may have been applied during dragging
                    e.target.style.visibility = '';
                    e.target.style.opacity = '';
                    e.target.style.transform = '';
                    this.editor.stateHistory.saveState();
                }
            });
        }

        getDragAfterElement(container, y) {
            // For block insertion, only consider direct children blocks of the editable area
            const draggableElements = [...container.querySelectorAll(':scope > .editor-block:not(.dragging-element)')];
            
            return draggableElements.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        getSnippetInsertionPoint(block, y) {
            // For snippet insertion within a block, consider direct children snippets
            const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
            
            return snippets.reduce((closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;
                
                if (offset < 0 && offset > closest.offset) {
                    return { offset: offset, element: child };
                } else {
                    return closest;
                }
            }, { offset: Number.NEGATIVE_INFINITY }).element;
        }

        getSnippetInsertionPointWithPosition(block, y) {
            const snippets = [...block.querySelectorAll(':scope > .editor-snippet:not(.dragging-element)')];
            const blockRect = block.getBoundingClientRect();
            
            if (snippets.length === 0) {
                return null; // No insertion point needed for empty block
            }
            
            for (let i = 0; i < snippets.length; i++) {
                const rect = snippets[i].getBoundingClientRect();
                const midPoint = rect.top + rect.height / 2;
                
                if (y < midPoint) {
                    return { 
                        y: rect.top - blockRect.top - 5, 
                        container: block 
                    };
                }
            }
            
            // Insert at the end
            const lastSnippet = snippets[snippets.length - 1];
            const rect = lastSnippet.getBoundingClientRect();
            return { 
                y: rect.bottom - blockRect.top + 5, 
                container: block 
            };
        }

        clearVisualIndicators() {
            const area = this.editor.editableArea;
            
            // Remove all visual indicators
            area.querySelectorAll('.valid-drop-target').forEach(el => el.classList.remove('valid-drop-target'));
            area.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
            area.querySelectorAll('.drop-insertion-line').forEach(el => el.remove());
            area.querySelectorAll('.drop-zone-overlay').forEach(el => el.remove());
            
            // Reset main area styling
            area.style.background = '';
            area.style.borderColor = '';
            area.style.position = '';
            
            // Don't clear currentTargetBlock here - it's needed for drop event
        }

        restoreOriginalPosition() {
            if (this.originalPosition) {
                const { element, parent, nextSibling } = this.originalPosition;
                if (nextSibling && nextSibling.parentNode === parent) {
                    parent.insertBefore(element, nextSibling);
                } else {
                    parent.appendChild(element);
                }
                this.originalPosition = null;
            }
        }

        showInvalidDropModal() {
            // Create styled modal instead of ugly alert
            const modal = document.createElement('div');
            modal.className = 'invalid-drop-modal';
            modal.innerHTML = `
                <div class="invalid-drop-modal-content">
                    <div class="invalid-drop-modal-icon">⚠️</div>
                    <h3 class="invalid-drop-modal-title">Invalid Drop Location</h3>
                    <p class="invalid-drop-modal-message">Snippets can only be placed inside blocks. The snippet has been returned to its original position.</p>
                    <button class="invalid-drop-modal-btn" onclick="this.closest('.invalid-drop-modal').remove()">OK</button>
                </div>
            `;
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .invalid-drop-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.2s ease-out;
                }
                .invalid-drop-modal-content {
                    background: white;
                    border-radius: 12px;
                    padding: 2rem;
                    max-width: 400px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                    text-align: center;
                    animation: slideUp 0.3s ease-out;
                }
                .invalid-drop-modal-icon {
                    font-size: 48px;
                    margin-bottom: 1rem;
                }
                .invalid-drop-modal-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.5rem;
                }
                .invalid-drop-modal-message {
                    color: #6b7280;
                    margin-bottom: 1.5rem;
                    line-height: 1.5;
                }
                .invalid-drop-modal-btn {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.625rem 1.25rem;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .invalid-drop-modal-btn:hover {
                    background: #2563eb;
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(modal);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (document.body.contains(modal)) {
                    modal.remove();
                }
                if (document.head.contains(style)) {
                    style.remove();
                }
            }, 3000);
        }

        getCurrentDragType(e) {
            // Try to determine drag type from the dragged element
            const draggingElement = document.querySelector('.dragging') || document.querySelector('.dragging-element');
            if (draggingElement) {
                if (draggingElement.classList.contains('editor-block')) {
                    return 'block';
                } else if (draggingElement.classList.contains('editor-snippet')) {
                    return 'snippet';
                } else {
                    return draggingElement.dataset.type;
                }
            }
            return null;
        }

        getInsertionPoint(container, y) {
            const blocks = [...container.querySelectorAll(':scope > .editor-block:not(.dragging-element)')];
            const containerRect = container.getBoundingClientRect();
            
            if (blocks.length === 0) {
                return null; // No insertion point needed for empty area
            }
            
            for (let i = 0; i < blocks.length; i++) {
                const rect = blocks[i].getBoundingClientRect();
                const midPoint = rect.top + rect.height / 2;
                
                if (y < midPoint) {
                    return { 
                        y: rect.top - containerRect.top - 5, 
                        container 
                    };
                }
            }
            
            // Insert at the end
            const lastBlock = blocks[blocks.length - 1];
            const rect = lastBlock.getBoundingClientRect();
            return { 
                y: rect.bottom - containerRect.top + 5, 
                container 
            };
        }

        createInsertionLine(insertionPoint) {
            const line = document.createElement('div');
            line.className = 'drop-insertion-line';
            line.style.position = 'absolute';
            line.style.top = insertionPoint.y + 'px';
            line.style.left = '20px';
            line.style.right = '20px';
            line.style.zIndex = '1000';
            return line;
        }
    }

    class FormattingToolbar {
        constructor(editor) {
            this.editor = editor;
            this.toolbar = document.getElementById('formatting-toolbar');
            this.currentEditableElement = null;
            this.init();
        }

        init() {
            this.setupClickListener();
            this.setupToolbarControls();
        }

        setupClickListener() {
            // Show toolbar when clicking in editable content
            this.editor.editableArea.addEventListener('click', (e) => {
                const editableElement = e.target.closest('[contenteditable="true"]');
                if (editableElement) {
                    this.currentEditableElement = editableElement;
                    this.showToolbar(editableElement);
                    this.updateToolbarState();
                }
            });

            // Hide toolbar when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.formatting-toolbar') && !e.target.closest('[contenteditable="true"]')) {
                    this.hideToolbar();
                }
            });
        }

        setupToolbarControls() {
            // Setup buttons
            this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const command = button.dataset.command;
                    this.executeCommand(command);
                });
            });

            // Setup format selector (H1, H2, etc.)
            const formatSelect = document.getElementById('format-select');
            formatSelect.addEventListener('change', (e) => {
                this.formatBlock(e.target.value);
                this.updateToolbarState();
            });

            // Setup font family
            const fontFamily = document.getElementById('font-family');
            fontFamily.addEventListener('change', (e) => {
                document.execCommand('fontName', false, e.target.value);
                this.editor.stateHistory.saveState();
            });

            // Setup font size
            const fontSize = document.getElementById('font-size');
            fontSize.addEventListener('change', (e) => {
                document.execCommand('fontSize', false, '7'); // Use size 7 then override with CSS
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const span = range.commonAncestorContainer.parentNode;
                    if (span && span.tagName === 'FONT') {
                        span.style.fontSize = e.target.value;
                    }
                }
                this.editor.stateHistory.saveState();
            });

            // Setup text color
            const textColor = document.getElementById('text-color');
            textColor.addEventListener('change', (e) => {
                if (this.currentEditableElement) {
                    // Try execCommand first for compatibility
                    try {
                        document.execCommand('foreColor', false, e.target.value);
                    } catch (err) {
                        // Fallback to direct styling if execCommand fails
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const span = document.createElement('span');
                            span.style.color = e.target.value;
                            try {
                                range.surroundContents(span);
                            } catch (e) {
                                // If surrounding fails, just style the entire element
                                this.currentEditableElement.style.color = e.target.value;
                            }
                        } else {
                            // No selection, style the entire element
                            this.currentEditableElement.style.color = e.target.value;
                        }
                    }
                    this.editor.stateHistory.saveState();
                }
            });

            // Setup background color  
            const backgroundColor = document.getElementById('background-color');
            backgroundColor.addEventListener('change', (e) => {
                if (this.currentEditableElement) {
                    // Try execCommand first for compatibility
                    try {
                        document.execCommand('hiliteColor', false, e.target.value);
                    } catch (err) {
                        // Fallback to direct styling if execCommand fails
                        const selection = window.getSelection();
                        if (selection.rangeCount > 0) {
                            const range = selection.getRangeAt(0);
                            const span = document.createElement('span');
                            span.style.backgroundColor = e.target.value;
                            try {
                                range.surroundContents(span);
                            } catch (e) {
                                // If surrounding fails, just style the entire element
                                this.currentEditableElement.style.backgroundColor = e.target.value;
                            }
                        } else {
                            // No selection, style the entire element
                            this.currentEditableElement.style.backgroundColor = e.target.value;
                        }
                    }
                    this.editor.stateHistory.saveState();
                }
            });
        }

        executeCommand(command) {
            if (command === 'createLink') {
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand(command, false, url);
                }
            } else {
                document.execCommand(command, false, null);
            }
            
            this.updateToolbarState();
            this.editor.stateHistory.saveState();
        }

        formatBlock(tag) {
            if (tag === 'p') {
                document.execCommand('formatBlock', false, '<p>');
            } else if (tag.startsWith('h')) {
                document.execCommand('formatBlock', false, `<${tag}>`);
            } else if (tag === 'blockquote') {
                document.execCommand('formatBlock', false, '<blockquote>');
            }
            this.editor.stateHistory.saveState();
        }

        updateToolbarState() {
            // Update button states based on current selection
            this.toolbar.querySelectorAll('button[data-command]').forEach(button => {
                const command = button.dataset.command;
                const isActive = document.queryCommandState(command);
                button.classList.toggle('active', isActive);
            });

            // Update format select
            const formatSelect = document.getElementById('format-select');
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const element = selection.anchorNode.nodeType === Node.TEXT_NODE 
                    ? selection.anchorNode.parentNode 
                    : selection.anchorNode;
                const blockElement = element.closest('h1, h2, h3, h4, h5, h6, p, blockquote');
                if (blockElement) {
                    formatSelect.value = blockElement.tagName.toLowerCase();
                }
            }
        }

        showToolbar(element) {
            const rect = element.getBoundingClientRect();
            this.toolbar.style.display = 'flex';
            
            // Position toolbar above the element, but keep it within viewport
            let top = rect.top - this.toolbar.offsetHeight - 10;
            if (top < 10) {
                top = rect.bottom + 10;
            }
            
            let left = rect.left;
            const toolbarWidth = this.toolbar.offsetWidth || 400; // Estimate if not yet rendered
            if (left + toolbarWidth > window.innerWidth - 20) {
                left = window.innerWidth - toolbarWidth - 20;
            }
            
            this.toolbar.style.left = Math.max(10, left) + 'px';
            this.toolbar.style.top = top + 'px';
        }

        hideToolbar() {
            this.toolbar.style.display = 'none';
            this.currentEditableElement = null;
        }
    }

    class StyleEditorModal {
        constructor(editor) {
            this.editor = editor;
            this.modal = null;
            this.targetElement = null;
            this.createModal();
        }

        createModal() {
            this.modal = document.createElement('div');
            this.modal.style.display = 'none';
            this.modal.style.position = 'fixed';
            this.modal.style.top = '0';
            this.modal.style.left = '0';
            this.modal.style.width = '100vw';
            this.modal.style.height = '100vh';
            this.modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            this.modal.style.zIndex = '999999';
            this.modal.style.alignItems = 'center';
            this.modal.style.justifyContent = 'center';
            
            this.modal.innerHTML = `
                <div style="background: white; border-radius: 8px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="font-size: 1.5rem; color: #2c3e50; margin: 0;">Style Editor</h2>
                        <button class="modal-close" style="width: 30px; height: 30px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #999;">&times;</button>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Padding (px)</label>
                            <input type="number" class="style-padding" placeholder="e.g., 10" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Margin (px)</label>
                            <input type="number" class="style-margin" placeholder="e.g., 10" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Border Width (px)</label>
                            <input type="number" class="style-border-width" placeholder="e.g., 1" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Border Color</label>
                            <input type="color" class="style-border-color" value="#cccccc" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Border Radius (px)</label>
                            <input type="number" class="style-border-radius" placeholder="e.g., 8" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Background Color</label>
                            <input type="color" class="style-background" value="#ffffff" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Width</label>
                            <input type="text" class="style-width" placeholder="e.g., 100% or 500px" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Height</label>
                            <input type="text" class="style-height" placeholder="e.g., auto or 300px" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Transition (CSS)</label>
                            <input type="text" class="style-transition" placeholder="e.g., all 0.3s ease" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Visibility</label>
                            <select class="style-visibility" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
                                <option value="">Default</option>
                                <option value="hidden">Hidden</option>
                                <option value="visible">Visible</option>
                            </select>
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <label style="font-weight: 500; color: #555; font-size: 0.875rem;">Display</label>
                            <select class="style-display" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.875rem;">
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
                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button class="modal-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button class="modal-save" style="padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
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
            this.modal.style.display = 'flex';
            
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
            this.modal.style.display = 'none';
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

    class CodeEditorModal {
        constructor(editor) {
            this.editor = editor;
            this.modal = null;
            this.targetElement = null;
            this.createModal();
        }

        createModal() {
            this.modal = document.createElement('div');
            this.modal.style.display = 'none';
            this.modal.style.position = 'fixed';
            this.modal.style.top = '0';
            this.modal.style.left = '0';
            this.modal.style.width = '100vw';
            this.modal.style.height = '100vh';
            this.modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            this.modal.style.zIndex = '999999';
            this.modal.style.alignItems = 'center';
            this.modal.style.justifyContent = 'center';
            
            this.modal.innerHTML = `
                <div style="background: white; border-radius: 8px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h2 style="font-size: 1.5rem; color: #2c3e50; margin: 0;">HTML Editor</h2>
                        <button class="modal-close" style="width: 30px; height: 30px; border: none; background: transparent; cursor: pointer; font-size: 24px; color: #999;">&times;</button>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500; color: #555;">Edit HTML</label>
                        <textarea class="code-editor-textarea" style="width: 100%; min-height: 400px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 13px; line-height: 1.5; resize: vertical;"></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
                        <button class="modal-cancel" style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button class="modal-save" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Save</button>
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
            this.modal.style.display = 'flex';
            
            const textarea = this.modal.querySelector('.code-editor-textarea');
            const html = this.getCleanElementHTML(element);
            textarea.value = this.formatHTML(html);
        }

        getCleanElementHTML(element) {
            const clone = element.cloneNode(true);
            clone.querySelectorAll('.edit-icon, .code-icon, .delete-icon, .settings-icon, .drag-handle, .resizer-handle').forEach(el => el.remove());
            return clone.innerHTML;
        }

        formatHTML(html) {
            const formatted = html
                .replace(/></g, '>\n<')
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .join('\n');
            
            let indented = '';
            let indent = 0;
            const lines = formatted.split('\n');
            
            for (let line of lines) {
                if (line.match(/^<\/\w/)) indent--;
                indented += '  '.repeat(Math.max(0, indent)) + line + '\n';
                if (line.match(/^<\w[^>]*[^\/]>.*$/)) indent++;
            }
            
            return indented.trim();
        }

        close() {
            this.modal.style.display = 'none';
            this.targetElement = null;
        }

        save() {
            if (this.targetElement) {
                const textarea = this.modal.querySelector('.code-editor-textarea');
                const newHTML = this.sanitizeHTML(textarea.value);
                
                const existingControls = [];
                this.targetElement.querySelectorAll('.edit-icon, .code-icon, .delete-icon, .settings-icon, .drag-handle, .resizer-handle').forEach(el => {
                    existingControls.push(el.cloneNode(true));
                });
                
                this.targetElement.innerHTML = newHTML;
                
                existingControls.forEach(control => {
                    this.targetElement.appendChild(control);
                });
                
                this.editor.stateHistory.saveState();
            }
            
            this.close();
        }

        sanitizeHTML(html) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            tempDiv.querySelectorAll('script').forEach(el => el.remove());
            tempDiv.querySelectorAll('link[rel="import"]').forEach(el => el.remove());
            tempDiv.querySelectorAll('*').forEach(el => {
                for (let attr of el.attributes) {
                    if (attr.name.startsWith('on')) {
                        el.removeAttribute(attr.name);
                    }
                }
            });
            
            return tempDiv.innerHTML;
        }
    }

    class ImageUploader {
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
                
                const uploadZone = snippet.querySelector('.image-upload-zone');
                if (uploadZone) {
                    uploadZone.remove();
                }
                
                const existingImg = snippet.querySelector('img');
                if (existingImg) {
                    existingImg.remove();
                }
                
                snippet.appendChild(img);
                this.editor.stateHistory.saveState();
            };
            reader.readAsDataURL(file);
        }
    }

    class VideoSettingsModal {
        constructor(editor) {
            this.editor = editor;
            this.modal = null;
            this.targetSnippet = null;
            this.createModal();
        }

        createModal() {
            this.modal = document.createElement('div');
            this.modal.className = 'modal';
            this.modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Video Settings</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Video URL (YouTube, Vimeo, etc.)</label>
                            <input type="url" id="video-url" placeholder="https://www.youtube.com/embed/...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn" id="video-cancel">Cancel</button>
                        <button class="btn btn-primary" id="video-save">Save</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.modal);
            this.attachModalListeners();
        }

        attachModalListeners() {
            this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());
            this.modal.querySelector('#video-cancel').addEventListener('click', () => this.close());
            this.modal.querySelector('#video-save').addEventListener('click', () => this.save());
        }

        open(snippet) {
            this.targetSnippet = snippet;
            this.modal.classList.add('active');
            
            const iframe = snippet.querySelector('iframe');
            if (iframe) {
                document.getElementById('video-url').value = iframe.src;
            }
        }

        close() {
            this.modal.classList.remove('active');
            this.targetSnippet = null;
        }

        save() {
            if (this.targetSnippet) {
                const url = document.getElementById('video-url').value;
                if (url) {
                    this.editor.setupVideoSnippet(this.targetSnippet, url);
                    this.editor.stateHistory.saveState();
                }
            }
            
            this.close();
        }
    }

    class ConfirmationModal {
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
                    <p class="confirm-modal-message">Are you sure you want to delete this?</p>
                    <div class="confirm-modal-buttons">
                        <button class="confirm-modal-btn confirm-modal-btn-cancel">Cancel</button>
                        <button class="confirm-modal-btn confirm-modal-btn-delete">Delete</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.modal);
            this.attachListeners();
        }

        attachListeners() {
            const cancelBtn = this.modal.querySelector('.confirm-modal-btn-cancel');
            const deleteBtn = this.modal.querySelector('.confirm-modal-btn-delete');
            
            cancelBtn.addEventListener('click', () => this.hide(false));
            deleteBtn.addEventListener('click', () => this.hide(true));
            
            // Close on background click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide(false);
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                    this.hide(false);
                }
            });
        }

        show(title, message, onConfirm, onCancel) {
            this.onConfirm = onConfirm;
            this.onCancel = onCancel;
            
            // Update content
            this.modal.querySelector('.confirm-modal-title').textContent = title;
            this.modal.querySelector('.confirm-modal-message').textContent = message;
            
            // Show modal
            this.modal.classList.add('active');
            
            // Focus the cancel button for accessibility
            setTimeout(() => {
                this.modal.querySelector('.confirm-modal-btn-cancel').focus();
            }, 100);
        }

        hide(confirmed) {
            this.modal.classList.remove('active');
            
            if (confirmed && this.onConfirm) {
                this.onConfirm();
            } else if (!confirmed && this.onCancel) {
                this.onCancel();
            }
            
            this.onConfirm = null;
            this.onCancel = null;
        }
    }

    class PageSettingsModal {
        constructor(editor) {
            this.editor = editor;
            this.modal = document.getElementById('page-settings-modal');
            this.pageData = {
                pageName: '',
                pageTitle: '',
                customCSS: '',
                customJavaScript: ''
            };
            this.init();
        }

        init() {
            this.attachListeners();
            this.loadPageData();
        }

        attachListeners() {
            // Gear button to open modal
            const pageSettingsBtn = document.getElementById('page-settings-btn');
            pageSettingsBtn.addEventListener('click', () => this.show());

            // Tab switching
            const tabBtns = this.modal.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
            });

            // Save button
            const saveBtn = document.getElementById('save-page-settings');
            saveBtn.addEventListener('click', () => this.saveSettings());

            // Cancel button and close button (already have onclick in HTML)
            
            // Close on background click
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hide();
                }
            });

            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                    this.hide();
                }
            });
        }

        switchTab(tabName) {
            // Remove active from all tabs and panels
            this.modal.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            this.modal.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

            // Activate selected tab and panel
            this.modal.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            this.modal.querySelector(`#${tabName}-tab`).classList.add('active');
        }

        show() {
            this.loadPageData();
            this.modal.style.display = 'flex';
            
            // Focus the first input
            setTimeout(() => {
                const firstInput = this.modal.querySelector('input[type="text"]');
                if (firstInput) firstInput.focus();
            }, 100);
        }

        hide() {
            this.modal.style.display = 'none';
        }

        saveSettings() {
            // Get values from form
            this.pageData.pageName = document.getElementById('page-name').value;
            this.pageData.pageTitle = document.getElementById('page-title').value;
            this.pageData.customCSS = document.getElementById('page-css').value;
            this.pageData.customJavaScript = document.getElementById('page-javascript').value;

            // Store in localStorage
            localStorage.setItem('pageSettings', JSON.stringify(this.pageData));

            // Update document title if page title is set
            if (this.pageData.pageTitle) {
                document.title = this.pageData.pageTitle;
            }

            // Save state to history
            this.editor.stateHistory.saveState();

            this.hide();
        }

        loadPageData() {
            // Load from localStorage
            const stored = localStorage.getItem('pageSettings');
            if (stored) {
                try {
                    this.pageData = JSON.parse(stored);
                } catch (e) {
                    console.warn('Failed to parse stored page settings');
                }
            }

            // Populate form fields
            document.getElementById('page-name').value = this.pageData.pageName || '';
            document.getElementById('page-title').value = this.pageData.pageTitle || '';
            document.getElementById('page-css').value = this.pageData.customCSS || '';
            document.getElementById('page-javascript').value = this.pageData.customJavaScript || '';
        }

        getPageData() {
            return { ...this.pageData };
        }

        setPageData(data) {
            this.pageData = { ...data };
            this.loadPageData();
        }
    }

    class StateHistory {
        constructor(editor) {
            this.editor = editor;
            this.history = [];
            this.currentIndex = -1;
            this.maxHistorySize = 50;
            this.init();
        }

        init() {
            this.saveState();
        }

        saveState() {
            const state = this.editor.editableArea.innerHTML;
            
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }
            
            this.history.push(state);
            
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
            } else {
                this.currentIndex++;
            }
        }

        undo() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.editor.editableArea.innerHTML = this.history[this.currentIndex];
            }
        }

        redo() {
            if (this.currentIndex < this.history.length - 1) {
                this.currentIndex++;
                this.editor.editableArea.innerHTML = this.history[this.currentIndex];
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.editor = new Editor();
    });

})();