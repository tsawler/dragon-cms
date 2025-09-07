// Import and initialize the Dragon editor library
import dragon from './dragon.js';
import { Editor } from './editor-core.js';

// Make dragon available globally
window.dragon = dragon;

// For backwards compatibility, auto-initialize if the DOM is ready and has the expected structure
document.addEventListener('DOMContentLoaded', () => {
    // Only auto-initialize if the old structure exists and hasn't been initialized by dragon.New()
    if (document.getElementById('editable-area') && !document.querySelector('.dragon-initialized')) {
        const editor = new Editor();
        window.editor = editor; // Make it globally accessible for debugging
    }
});