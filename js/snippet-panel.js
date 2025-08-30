export class SnippetPanel {
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
                // Save state before drag operation begins
                this.editor.stateHistory.saveState();
                
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('elementType', item.dataset.type);
                e.dataTransfer.setData('snippetType', item.dataset.snippetType || '');
                e.dataTransfer.setData('template', item.dataset.template || '');
                
                // Set drag operation tracking in editor
                this.editor.currentDragOperation = { 
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
                
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                // Clear drag operation tracking
                this.editor.currentDragOperation = null;
            });
        });
    }
}