export class VideoSettingsModal {
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
        const youtubeWatchRegex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\\?v=([a-zA-Z0-9_-]+)([&?].*)?/;
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
                const timeMatch = match[2].match(/[?&]t=(\\d+)/);
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
                const timeMatch = match[2].match(/[?&]t=(\\d+)/);
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