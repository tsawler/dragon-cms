import { StateHistory } from '../js/state-history.js';

describe('StateHistory', () => {
  let mockEditor;
  let stateHistory;
  let mockEditableArea;

  beforeEach(() => {
    // Create mock editable area
    mockEditableArea = document.createElement('div');
    mockEditableArea.id = 'editable-area';
    mockEditableArea.innerHTML = '<div class="initial-content">Initial content</div>';
    document.body.appendChild(mockEditableArea);

    // Create mock editor
    mockEditor = {
      editableArea: mockEditableArea,
      makeExistingBlocksEditable: jest.fn(),
      attachDragHandleListeners: jest.fn(),
      formattingToolbar: {
        fixFirefoxEditableElements: jest.fn()
      },
      imageUploader: {
        setupImageSnippet: jest.fn()
      }
    };

    // Mock navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'Mozilla/5.0 (Chrome)'
    });

    stateHistory = new StateHistory(mockEditor);
    jest.clearAllMocks();
  });

  afterEach(() => {
    document.body.removeChild(mockEditableArea);
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct default values', () => {
      expect(stateHistory.editor).toBe(mockEditor);
      expect(stateHistory.history).toEqual(expect.any(Array));
      expect(stateHistory.currentIndex).toBe(0); // Should be 0 after initial save
      expect(stateHistory.maxHistorySize).toBe(50);
    });

    test('should save initial state on initialization', () => {
      expect(stateHistory.history.length).toBe(1);
      expect(stateHistory.history[0]).toBe('<div class="initial-content">Initial content</div>');
    });
  });

  describe('saveState()', () => {
    test('should save new state and increment index', () => {
      mockEditableArea.innerHTML = '<div>New content</div>';
      
      stateHistory.saveState();
      
      expect(stateHistory.history.length).toBe(2);
      expect(stateHistory.currentIndex).toBe(1);
      expect(stateHistory.history[1]).toBe('<div>New content</div>');
    });

    test('should not save duplicate state', () => {
      const initialLength = stateHistory.history.length;
      const initialIndex = stateHistory.currentIndex;
      
      // Try to save the same content again
      stateHistory.saveState();
      
      expect(stateHistory.history.length).toBe(initialLength);
      expect(stateHistory.currentIndex).toBe(initialIndex);
    });

    test('should truncate future history when saving from middle', () => {
      // Add some states
      mockEditableArea.innerHTML = '<div>State 2</div>';
      stateHistory.saveState();
      mockEditableArea.innerHTML = '<div>State 3</div>';
      stateHistory.saveState();
      
      // Go back to state 1
      stateHistory.undo();
      stateHistory.undo();
      
      // Save new state from middle
      mockEditableArea.innerHTML = '<div>New branch</div>';
      stateHistory.saveState();
      
      expect(stateHistory.history.length).toBe(2);
      expect(stateHistory.history[1]).toBe('<div>New branch</div>');
      expect(stateHistory.currentIndex).toBe(1);
    });

    test('should maintain max history size limit', () => {
      stateHistory.maxHistorySize = 3;
      
      // Add states beyond the limit
      for (let i = 1; i <= 5; i++) {
        mockEditableArea.innerHTML = `<div>State ${i}</div>`;
        stateHistory.saveState();
      }
      
      expect(stateHistory.history.length).toBe(3);
      expect(stateHistory.currentIndex).toBe(2);
      // Should contain the last 3 states
      expect(stateHistory.history[2]).toBe('<div>State 5</div>');
    });
  });

  describe('undo()', () => {
    beforeEach(() => {
      // Setup some history
      mockEditableArea.innerHTML = '<div>State 1</div>';
      stateHistory.saveState();
      mockEditableArea.innerHTML = '<div>State 2</div>';
      stateHistory.saveState();
    });

    test('should undo to previous state', () => {
      stateHistory.undo();
      
      expect(stateHistory.currentIndex).toBe(1);
      expect(mockEditableArea.innerHTML).toBe('<div>State 1</div>');
      expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalled();
    });

    test('should not undo beyond first state', () => {
      // Undo to first state
      stateHistory.undo();
      stateHistory.undo();
      
      const initialIndex = stateHistory.currentIndex;
      const initialContent = mockEditableArea.innerHTML;
      
      // Try to undo beyond first state
      stateHistory.undo();
      
      expect(stateHistory.currentIndex).toBe(initialIndex);
      expect(mockEditableArea.innerHTML).toBe(initialContent);
    });

    test('should call restoreFunctionality after undo', () => {
      const restoreSpy = jest.spyOn(stateHistory, 'restoreFunctionality');
      
      stateHistory.undo();
      
      expect(restoreSpy).toHaveBeenCalled();
    });
  });

  describe('redo()', () => {
    beforeEach(() => {
      // Setup history and undo once
      mockEditableArea.innerHTML = '<div>State 1</div>';
      stateHistory.saveState();
      mockEditableArea.innerHTML = '<div>State 2</div>';
      stateHistory.saveState();
      stateHistory.undo(); // Go back to State 1
    });

    test('should redo to next state', () => {
      stateHistory.redo();
      
      expect(stateHistory.currentIndex).toBe(2);
      expect(mockEditableArea.innerHTML).toBe('<div>State 2</div>');
      expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalled();
    });

    test('should not redo beyond last state', () => {
      stateHistory.redo(); // Go to last state
      
      const initialIndex = stateHistory.currentIndex;
      const initialContent = mockEditableArea.innerHTML;
      
      // Try to redo beyond last state
      stateHistory.redo();
      
      expect(stateHistory.currentIndex).toBe(initialIndex);
      expect(mockEditableArea.innerHTML).toBe(initialContent);
    });

    test('should call restoreFunctionality after redo', () => {
      const restoreSpy = jest.spyOn(stateHistory, 'restoreFunctionality');
      
      stateHistory.redo();
      
      expect(restoreSpy).toHaveBeenCalled();
    });
  });

  describe('restoreFunctionality()', () => {
    beforeEach(() => {
      // Add some mock elements to the editable area
      mockEditableArea.innerHTML = `
        <div class="editor-block">Block</div>
        <div class="editor-snippet image-snippet">Snippet</div>
        <div class="editor-snippet">Another snippet</div>
      `;
    });

    test('should restore contentEditable functionality', () => {
      stateHistory.restoreFunctionality();
      
      expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalled();
    });

    test('should reattach drag handle listeners to all elements', () => {
      stateHistory.restoreFunctionality();
      
      expect(mockEditor.attachDragHandleListeners).toHaveBeenCalledTimes(3);
    });

    test('should apply Firefox fixes when using Firefox', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Firefox)'
      });
      
      stateHistory.restoreFunctionality();
      
      expect(mockEditor.formattingToolbar.fixFirefoxEditableElements).toHaveBeenCalled();
    });

    test('should not apply Firefox fixes for other browsers', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Chrome)'
      });
      
      stateHistory.restoreFunctionality();
      
      expect(mockEditor.formattingToolbar.fixFirefoxEditableElements).not.toHaveBeenCalled();
    });

    test('should setup image snippets', () => {
      stateHistory.restoreFunctionality();
      
      expect(mockEditor.imageUploader.setupImageSnippet).toHaveBeenCalledTimes(1);
      expect(mockEditor.imageUploader.setupImageSnippet).toHaveBeenCalledWith(
        expect.objectContaining({ className: 'editor-snippet image-snippet' })
      );
    });

    test('should handle missing formattingToolbar gracefully', () => {
      mockEditor.formattingToolbar = null;
      
      expect(() => {
        stateHistory.restoreFunctionality();
      }).not.toThrow();
    });

    test('should handle missing imageUploader gracefully', () => {
      mockEditor.imageUploader = null;
      
      expect(() => {
        stateHistory.restoreFunctionality();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty editable area', () => {
      mockEditableArea.innerHTML = '';
      
      expect(() => {
        stateHistory.saveState();
      }).not.toThrow();
      
      expect(stateHistory.history[stateHistory.currentIndex]).toBe('');
    });

    test('should handle very long content', () => {
      const longContent = '<div>' + 'A'.repeat(10000) + '</div>';
      mockEditableArea.innerHTML = longContent;
      
      expect(() => {
        stateHistory.saveState();
      }).not.toThrow();
      
      expect(stateHistory.history[stateHistory.currentIndex]).toBe(longContent);
    });

    test('should handle special characters in content', () => {
      const specialContent = '<div>Special: &lt;&gt;&amp;"\'</div>';
      mockEditableArea.innerHTML = specialContent;
      
      stateHistory.saveState();
      
      expect(stateHistory.history[stateHistory.currentIndex]).toBe(specialContent);
    });
  });

  describe('History Navigation Edge Cases', () => {
    test('should handle undo/redo when only one state exists', () => {
      const singleStateHistory = new StateHistory(mockEditor);
      
      expect(() => {
        singleStateHistory.undo();
        singleStateHistory.redo();
      }).not.toThrow();
      
      expect(singleStateHistory.currentIndex).toBe(0);
    });

    test('should maintain state consistency after multiple undo/redo operations', () => {
      // Build history
      const states = ['<div>A</div>', '<div>B</div>', '<div>C</div>'];
      states.forEach(state => {
        mockEditableArea.innerHTML = state;
        stateHistory.saveState();
      });
      
      // Complex navigation
      stateHistory.undo(); // C -> B
      stateHistory.undo(); // B -> A
      stateHistory.redo();  // A -> B
      stateHistory.undo(); // B -> A
      
      expect(mockEditableArea.innerHTML).toBe('<div>A</div>');
      expect(stateHistory.currentIndex).toBe(1);
    });
  });
});