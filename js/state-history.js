import { Utilities } from './utilities.js';

export class StateHistory {
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
        
        // Don't save if the state is identical to the current state
        if (this.history.length > 0 && this.history[this.currentIndex] === state) {
            return;
        }
        
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
            this.restoreFunctionality();
        }
    }

    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.editor.editableArea.innerHTML = this.history[this.currentIndex];
            this.restoreFunctionality();
        }
    }

    restoreFunctionality() {
        // Restore contentEditable functionality and drag handles after innerHTML change
        // Similar to the fix we applied in CodeEditorModal
        
        // Re-initialize all blocks and snippets
        this.editor.makeExistingBlocksEditable();
        
        // Restore drag functionality for all elements
        const allElements = this.editor.editableArea.querySelectorAll('.editor-block, .editor-snippet');
        allElements.forEach(element => {
            this.editor.attachDragHandleListeners(element);
        });
        
        // Apply Firefox fixes if needed
        const isFirefox = Utilities.Browser.isFirefox();
        if (isFirefox && this.editor.formattingToolbar) {
            this.editor.formattingToolbar.fixFirefoxEditableElements();
        }
        
        // Re-setup image snippets
        const imageSnippets = this.editor.editableArea.querySelectorAll('.image-snippet');
        imageSnippets.forEach(snippet => {
            if (this.editor.imageUploader) {
                this.editor.imageUploader.setupImageSnippet(snippet);
            }
        });
    }
}