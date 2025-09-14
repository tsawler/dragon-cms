export class SnippetPanel {
    constructor(editor) {
        this.editor = editor;
        this.snippetList = document.getElementById('snippet-list');
        this.panelTitle = document.getElementById('panel-title');
        this.filterInput = document.getElementById('filter-input');
        this.currentTab = 'sections';
        this.allContent = {
            sections: [],
            blocks: [],
            snippets: []
        };
        this.init();
    }

    init() {
        this.loadAllContent();
        this.setupTabNavigation();
        this.setupFiltering();
        // Panel starts closed - user clicks icon to open
    }

    loadAllContent() {
        // Load sections
        const sections = (typeof getSections === 'function') ? getSections() : [];
        this.allContent.sections = sections || [];
        
        // Load blocks (both default and custom)
        const blocks = (typeof getBlocks === 'function') ? getBlocks() : [];
        const customBlocks = (typeof window.DragonBlocks !== 'undefined' && window.DragonBlocks.getAllCustomBlocks) 
            ? window.DragonBlocks.getAllCustomBlocks() 
            : [];
        this.allContent.blocks = [...blocks, ...customBlocks];
        
        // Load snippets (both default and custom)
        const snippets = (typeof getSnippets === 'function') ? getSnippets() : [];
        const customSnippets = (typeof window.DragonSnippets !== 'undefined' && window.DragonSnippets.getAllCustomSnippets) 
            ? window.DragonSnippets.getAllCustomSnippets() 
            : [];
        this.allContent.snippets = [...snippets, ...customSnippets];
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.icon-strip-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab) {
                    this.showTab(tab);
                }
            });
        });
    }

    setupFiltering() {
        if (this.filterInput) {
            this.filterInput.addEventListener('input', (e) => {
                this.filterContent(e.target.value);
            });
        }
    }

    showTab(tabName) {
        const panel = document.getElementById('snippet-panel');
        const editorMain = document.querySelector('.editor-main');
        const clickedButton = document.querySelector(`[data-tab="${tabName}"]`);

        // Check if elements exist and this tab is already active and panel is open
        if (!panel || !editorMain || !clickedButton) {
            return;
        }

        const isCurrentTabActive = clickedButton.classList.contains('active');
        const isPanelOpen = panel.classList.contains('open');
        
        if (isCurrentTabActive && isPanelOpen) {
            // Close the panel (toggle off)
            panel.classList.remove('open');
            editorMain.classList.remove('panel-open');
            clickedButton.classList.remove('active');
            return;
        }
        
        // Update current tab
        this.currentTab = tabName;
        
        // Update active tab button
        document.querySelectorAll('.icon-strip-button').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');
        
        // Update panel title
        const titles = {
            sections: 'Sections',
            blocks: 'Blocks',
            snippets: 'Snippets'
        };
        if (this.panelTitle) {
            this.panelTitle.textContent = titles[tabName];
        }

        // Clear filter
        if (this.filterInput) {
            this.filterInput.value = '';
        }
        
        // Show panel and render content
        panel.classList.add('open');
        editorMain.classList.add('panel-open');

        this.renderCurrentTab();
    }

    renderCurrentTab(filter = '') {
        if (!this.snippetList) {
            return;
        }

        this.snippetList.innerHTML = '';

        const items = this.allContent[this.currentTab] || [];
        const filteredItems = filter
            ? items.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
            : items;

        if (filteredItems.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.style.cssText = 'text-align: center; color: #6b7280; padding: 2rem 1rem;';
            emptyMessage.textContent = filter ? 'No items match your search' : `No ${this.currentTab} available`;
            this.snippetList.appendChild(emptyMessage);
            return;
        }
        
        filteredItems.forEach(item => {
            const itemElement = this.createSnippetItem(item);
            this.snippetList.appendChild(itemElement);
        });
    }

    filterContent(searchTerm) {
        this.renderCurrentTab(searchTerm);
    }

    // Legacy method for compatibility
    loadSnippets() {
        this.loadAllContent();
        this.renderCurrentTab();
    }

    loadCustomSnippets() {
        // This is now handled in loadAllContent()
        // Keep for compatibility but make it a no-op
    }

    createSnippetItem(item) {
        const listItem = document.createElement('div');
        listItem.className = 'snippet-item';
        listItem.draggable = true;
        listItem.dataset.type = item.type;
        listItem.dataset.id = item.id;

        // Style the snippet item
        listItem.style.cssText = `
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            background: white;
            cursor: grab;
            transition: all 0.2s;
            user-select: none;
        `;

        // Preview section
        const preview = document.createElement('div');
        preview.className = 'snippet-preview';
        preview.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        `;

        // Preview image or icon
        const previewVisual = document.createElement('div');
        previewVisual.style.cssText = `
            width: 60px;
            height: 40px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            flex-shrink: 0;
        `;

        if (item.preview === 'image' && item.previewImage) {
            const img = document.createElement('img');
            img.src = item.previewImage;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
            `;
            img.onerror = () => {
                previewVisual.textContent = '🧱';
                previewVisual.style.fontSize = '20px';
            };
            previewVisual.appendChild(img);
        } else {
            // Default icons based on type
            const icons = {
                section: '📋',
                block: '🧱',
                snippet: '⚡'
            };
            previewVisual.textContent = icons[item.type] || '📄';
            previewVisual.style.fontSize = '20px';
        }

        // Name and description
        const textContent = document.createElement('div');
        textContent.style.cssText = 'flex: 1; min-width: 0;';
        
        const name = document.createElement('div');
        name.textContent = item.name;
        name.style.cssText = `
            font-weight: 500;
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        const description = document.createElement('div');
        description.textContent = item.description || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} component`;
        description.style.cssText = `
            font-size: 12px;
            color: #6b7280;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;

        textContent.appendChild(name);
        textContent.appendChild(description);
        preview.appendChild(previewVisual);
        preview.appendChild(textContent);
        listItem.appendChild(preview);

        // Hover effects
        listItem.addEventListener('mouseenter', () => {
            listItem.style.transform = 'translateY(-2px)';
            listItem.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            listItem.style.borderColor = '#cbd5e1';
        });

        listItem.addEventListener('mouseleave', () => {
            listItem.style.transform = 'translateY(0)';
            listItem.style.boxShadow = 'none';
            listItem.style.borderColor = '#e2e8f0';
        });

        // Drag events
        listItem.addEventListener('dragstart', (e) => {
            listItem.style.opacity = '0.5';
            e.dataTransfer.setData('text/html', item.html);
            e.dataTransfer.setData('template', item.html); // Add template for sections
            e.dataTransfer.setData('elementType', item.type);
            e.dataTransfer.setData('itemId', item.id);
        });

        listItem.addEventListener('dragend', () => {
            listItem.style.opacity = '1';
        });

        return listItem;
    }
}