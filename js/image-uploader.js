export class ImageUploader {
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