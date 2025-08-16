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