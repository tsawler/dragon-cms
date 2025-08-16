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
            this.buttonSettingsModal = new ButtonSettingsModal(this);
            this.columnResizer = new ColumnResizer(this);
            
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
                // Handle button clicks
                if (e.target.tagName === 'BUTTON' && 
                    !e.target.classList.contains('edit-icon') && 
                    !e.target.classList.contains('code-icon') &&
                    !e.target.classList.contains('delete-icon') &&
                    !e.target.classList.contains('settings-icon')) {
                    
                    if (this.currentMode === 'edit') {
                        // In edit mode, open the settings modal
                        e.preventDefault();
                        e.stopPropagation();
                        this.buttonSettingsModal.open(e.target);
                        return;
                    } else if (this.currentMode === 'display') {
                        // In display mode, navigate if URL exists
                        const url = e.target.getAttribute('data-url');
                        const target = e.target.getAttribute('data-target') || '_self';
                        if (url) {
                            e.preventDefault();
                            window.open(url, target);
                        }
                        return;
                    }
                }
                
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
                    const block = target.closest('.editor-block');
                    const snippet = target.closest('.editor-snippet');
                    
                    if (block && !snippet) {
                        // Settings for block (column management)
                        if (!this.columnSettingsModal) {
                            this.columnSettingsModal = new ColumnSettingsModal(this);
                        }
                        this.columnSettingsModal.open(block);
                    } else if (snippet && snippet.classList.contains('video-snippet')) {
                        // Settings for video snippet
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
            const observer = new MutationObserver((mutations) => {
                // Skip if we're currently setting up column resizers to prevent infinite loops
                if (this.columnResizer && this.columnResizer.setupInProgress) {
                    return;
                }
                
                // Check if any mutation was adding/removing column resize dividers
                const hasResizerMutation = mutations.some(mutation => {
                    if (mutation.type === 'childList') {
                        return Array.from(mutation.addedNodes)
                            .concat(Array.from(mutation.removedNodes))
                            .some(node => node.classList && node.classList.contains('column-resize-divider'));
                    }
                    return false;
                });
                
                // Skip if the mutation was just adding/removing resize dividers
                if (hasResizerMutation) {
                    return;
                }
                
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.stateHistory.saveState();
                    // Only refresh column resize dividers if not currently resizing
                    if (this.columnResizer && !this.columnResizer.isResizing) {
                        this.columnResizer.refresh();
                    }
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
            
            // Refresh column resize dividers when mode changes
            // Temporarily disabled
            // if (this.columnResizer) {
            //     this.columnResizer.refresh();
            // }
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
            
            // Convert button data-url to onclick handlers for export
            clone.querySelectorAll('button[data-url]').forEach(button => {
                const url = button.getAttribute('data-url');
                const target = button.getAttribute('data-target') || '_self';
                if (url) {
                    button.setAttribute('onclick', `window.open('${url}', '${target}')`);
                    button.removeAttribute('data-url');
                    button.removeAttribute('data-target');
                }
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
                        // Look for iframe in video container or directly in snippet
                        const iframe = snippet.querySelector('.video-container iframe') || snippet.querySelector('iframe');
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
                <button class="settings-icon" title="Column Settings">⚙️</button>
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
            if (type === 'video') {
                snippet.innerHTML = controls + '<button class="settings-icon" title="Video Settings">⚙️</button>';
                // Add default video (Big Buck Bunny)
                this.setupVideoSnippet(snippet, 'https://www.youtube.com/embed/aqz-KE-bpKQ');
            } else if (type === 'image') {
                snippet.innerHTML = controls + '<div class="image-upload-zone">Click or drag image here</div>';
            } else if (template) {
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
            
            // Remove any existing video container
            const existingContainer = snippet.querySelector('.video-container');
            if (existingContainer) {
                existingContainer.remove();
            }
            
            // Create responsive video container
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            videoContainer.style.cssText = `
                position: relative;
                width: 100%;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                height: 0;
                overflow: hidden;
            `;
            
            const iframe = document.createElement('iframe');
            iframe.src = url;
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            iframe.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
            `;
            
            videoContainer.appendChild(iframe);
            snippet.appendChild(videoContainer);
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
                            <label>Video URL</label>
                            <input type="url" id="video-url" placeholder="Paste any YouTube, Vimeo, or other video URL">
                            <small style="display: block; margin-top: 5px; color: #666;">
                                Supported: YouTube, Vimeo, Dailymotion, Loom, Wistia<br>
                                URLs will be automatically converted to embed format
                            </small>
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
            
            // Look for iframe in video container or directly in snippet
            const iframe = snippet.querySelector('.video-container iframe') || snippet.querySelector('iframe');
            if (iframe) {
                document.getElementById('video-url').value = iframe.src;
            } else {
                document.getElementById('video-url').value = '';
            }
        }

        close() {
            this.modal.classList.remove('active');
            this.targetSnippet = null;
        }

        convertToEmbedUrl(url) {
            // YouTube conversions
            // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID&t=123s
            // Short URL: https://youtu.be/VIDEO_ID?t=123
            // Already embed URL: https://www.youtube.com/embed/VIDEO_ID
            const youtubeWatchRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)([&?].*)?/;
            const youtubeShortRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)(\?.*)?/;
            const youtubeEmbedRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
            
            // Vimeo conversions
            // Standard URL: https://vimeo.com/VIDEO_ID
            // Already embed URL: https://player.vimeo.com/video/VIDEO_ID
            const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)/;
            const vimeoPlayerRegex = /(?:https?:\/\/)?(?:www\.)?player\.vimeo\.com\/video\/([0-9]+)/;
            
            // Check YouTube formats
            let match = url.match(youtubeWatchRegex);
            if (match) {
                let embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                // Preserve timestamp if present
                if (match[2]) {
                    const timeMatch = match[2].match(/[?&]t=(\d+)/);
                    if (timeMatch) {
                        embedUrl += `?start=${timeMatch[1]}`;
                    }
                }
                return embedUrl;
            }
            
            match = url.match(youtubeShortRegex);
            if (match) {
                let embedUrl = `https://www.youtube.com/embed/${match[1]}`;
                // Preserve timestamp if present
                if (match[2]) {
                    const timeMatch = match[2].match(/[?&]t=(\d+)/);
                    if (timeMatch) {
                        embedUrl += `?start=${timeMatch[1]}`;
                    }
                }
                return embedUrl;
            }
            
            match = url.match(youtubeEmbedRegex);
            if (match) {
                // Already in embed format
                return url;
            }
            
            // Check Vimeo formats
            match = url.match(vimeoRegex);
            if (match) {
                return `https://player.vimeo.com/video/${match[1]}`;
            }
            
            match = url.match(vimeoPlayerRegex);
            if (match) {
                // Already in embed format
                return url;
            }
            
            // Dailymotion
            // Standard: https://www.dailymotion.com/video/VIDEO_ID
            // Embed: https://www.dailymotion.com/embed/video/VIDEO_ID
            const dailymotionRegex = /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9_-]+)/;
            match = url.match(dailymotionRegex);
            if (match) {
                return `https://www.dailymotion.com/embed/video/${match[1]}`;
            }
            
            // Wistia
            // Standard: https://yourcompany.wistia.com/medias/VIDEO_ID
            // Embed: https://fast.wistia.net/embed/iframe/VIDEO_ID
            const wistiaRegex = /(?:https?:\/\/)?(?:[\w-]+\.)?wistia\.com\/medias\/([a-zA-Z0-9]+)/;
            match = url.match(wistiaRegex);
            if (match) {
                return `https://fast.wistia.net/embed/iframe/${match[1]}`;
            }
            
            // Loom
            // Share URL: https://www.loom.com/share/VIDEO_ID
            // Embed URL: https://www.loom.com/embed/VIDEO_ID
            const loomShareRegex = /(?:https?:\/\/)?(?:www\.)?loom\.com\/share\/([a-zA-Z0-9]+)/;
            match = url.match(loomShareRegex);
            if (match) {
                return `https://www.loom.com/embed/${match[1]}`;
            }
            
            // If no conversion needed, return the original URL
            return url;
        }

        save() {
            if (this.targetSnippet) {
                let url = document.getElementById('video-url').value.trim();
                if (url) {
                    // Convert to embed-friendly URL
                    const embedUrl = this.convertToEmbedUrl(url);
                    this.editor.setupVideoSnippet(this.targetSnippet, embedUrl);
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

    class ButtonSettingsModal {
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
            
            this.modal.classList.add('active');
        }

        close() {
            this.modal.classList.remove('active');
            this.targetButton = null;
            this.originalValues = null;
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

    class ColumnResizer {
        constructor(editor) {
            this.editor = editor;
            this.isResizing = false;
            this.currentDivider = null;
            this.leftColumn = null;
            this.rightColumn = null;
            this.startX = 0;
            this.leftStartWidth = 0;
            this.rightStartWidth = 0;
            this.containerWidth = 0;
            
            this.init();
        }
        
        init() {
            // Add or update resize dividers when DOM changes
            // Initial setup after a delay to ensure DOM is ready
            setTimeout(() => {
                this.setupResizeDividers();
            }, 500);
            
            // Listen for mouse events
            document.addEventListener('mousedown', this.handleMouseDown.bind(this));
            document.addEventListener('mousemove', this.handleMouseMove.bind(this));
            document.addEventListener('mouseup', this.handleMouseUp.bind(this));
            
            // Add global function for testing
            window.debugColumnResizer = () => {
                console.log('Manual column resizer trigger');
                this.setupResizeDividers();
            };
        }
        
        setupResizeDividers() {
            // Prevent recursive calls
            if (this.setupInProgress) return;
            this.setupInProgress = true;
            
            // Find all elements that contain multiple .column children
            const allElements = document.querySelectorAll('*');
            const containers = [];
            
            allElements.forEach(element => {
                const columns = element.querySelectorAll(':scope > .column');
                if (columns.length > 1) {
                    containers.push(element);
                }
            });
            
            console.log('Setting up resize dividers, found containers:', containers.length);
            
            containers.forEach(container => {
                const columns = container.querySelectorAll('.column');
                console.log('Container has columns:', columns.length);
                
                // Remove existing dividers first
                container.querySelectorAll('.column-resize-divider').forEach(d => d.remove());
                
                // Make container relative for absolute positioning
                container.style.position = 'relative';
                
                // Add dividers between columns (in edit mode only)
                if (this.editor.currentMode === 'edit' && columns.length > 1) {
                    for (let i = 0; i < columns.length - 1; i++) {
                        const divider = document.createElement('div');
                        divider.className = 'column-resize-divider';
                        divider.dataset.leftIndex = i;
                        divider.dataset.rightIndex = i + 1;
                        
                        // Calculate position based on column positions
                        const leftColumn = columns[i];
                        const rightColumn = columns[i + 1];
                        
                        // Position divider in the container, not the column
                        container.appendChild(divider);
                        
                        // Position it between the columns
                        const updateDividerPosition = () => {
                            const leftRect = leftColumn.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();
                            const position = leftRect.right - containerRect.left; // Right edge of left column
                            divider.style.left = position + 'px';
                        };
                        
                        updateDividerPosition();
                        
                        // Store update function for later use if needed
                        divider.updatePosition = updateDividerPosition;
                    }
                }
            });
            
            // Reset the flag
            this.setupInProgress = false;
        }
        
        handleMouseDown(e) {
            if (!e.target.classList.contains('column-resize-divider')) return;
            if (this.editor.currentMode !== 'edit') return;
            
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Starting column resize');
            this.isResizing = true;
            this.currentDivider = e.target;
            
            // Find the container that holds this divider
            const container = this.currentDivider.parentNode;
            if (!container) {
                console.error('No container found for divider');
                return;
            }
            
            console.log('Container found:', container);
            const columns = Array.from(container.querySelectorAll(':scope > .column'));
            console.log('Columns found:', columns.length);
            
            const leftIndex = parseInt(this.currentDivider.dataset.leftIndex);
            const rightIndex = parseInt(this.currentDivider.dataset.rightIndex);
            
            this.leftColumn = columns[leftIndex];
            this.rightColumn = columns[rightIndex];
            this.startX = e.clientX;
            this.containerWidth = container.getBoundingClientRect().width;
            
            // Get current widths
            const leftRect = this.leftColumn.getBoundingClientRect();
            const rightRect = this.rightColumn.getBoundingClientRect();
            this.leftStartWidth = leftRect.width;
            this.rightStartWidth = rightRect.width;
            
            // Add resizing class for visual feedback
            document.body.classList.add('column-resizing');
            this.currentDivider.classList.add('active');
        }
        
        handleMouseMove(e) {
            if (!this.isResizing) return;
            
            e.preventDefault();
            const deltaX = e.clientX - this.startX;
            
            // Calculate new widths
            const newLeftWidth = this.leftStartWidth + deltaX;
            const newRightWidth = this.rightStartWidth - deltaX;
            
            // Minimum column width (50px)
            const minWidth = 50;
            
            if (newLeftWidth >= minWidth && newRightWidth >= minWidth) {
                // Calculate percentages
                const totalWidth = this.leftStartWidth + this.rightStartWidth;
                const leftPercent = (newLeftWidth / totalWidth) * 100;
                const rightPercent = (newRightWidth / totalWidth) * 100;
                
                // Update flex values to maintain proportions
                this.leftColumn.style.flex = `0 0 ${leftPercent}%`;
                this.rightColumn.style.flex = `0 0 ${rightPercent}%`;
                
                // Update divider position visually during drag
                if (this.currentDivider && this.currentDivider.updatePosition) {
                    // Use requestAnimationFrame for smooth visual updates
                    requestAnimationFrame(() => {
                        if (this.currentDivider && this.currentDivider.updatePosition) {
                            this.currentDivider.updatePosition();
                        }
                    });
                }
            }
        }
        
        handleMouseUp(e) {
            if (!this.isResizing) return;
            
            this.isResizing = false;
            document.body.classList.remove('column-resizing');
            
            if (this.currentDivider) {
                this.currentDivider.classList.remove('active');
            }
            
            // Save state
            if (this.editor.stateHistory) {
                this.editor.stateHistory.saveState();
            }
            
            // Reset references
            this.currentDivider = null;
            this.leftColumn = null;
            this.rightColumn = null;
        }
        
        refresh() {
            // Call this when columns are added/removed or mode changes
            // Use setTimeout to ensure DOM is fully rendered
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = setTimeout(() => {
                this.setupResizeDividers();
            }, 100);
        }
    }

    class ColumnSettingsModal {
        constructor(editor) {
            this.editor = editor;
            this.targetBlock = null;
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
            } else if (threeCol) {
                return Array.from(threeCol.querySelectorAll('.column')).map(col => ({
                    content: col.innerHTML,
                    style: col.style.cssText || 'flex: 1;'
                }));
            }
            
            // Single column (no column structure)
            const blockContent = this.targetBlock.innerHTML;
            // Remove control elements
            const cleanContent = blockContent.replace(/<(span|button|div)\s+class="(drag-handle|edit-icon|settings-icon|code-icon|delete-icon|resizer-handle)[^"]*"[^>]*>[\s\S]*?<\/(span|button|div)>/gi, '');
            
            return [{
                content: cleanContent.trim(),
                style: ''
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
            
            // Refresh column resize dividers
            // Temporarily disabled
            // if (this.editor.columnResizer) {
            //     this.editor.columnResizer.refresh();
            // }
            
            this.close();
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