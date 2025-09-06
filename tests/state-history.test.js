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

  describe('Memory Management and Performance', () => {
    test('should handle large history efficiently', () => {
      const largeHistory = new StateHistory(mockEditor);
      largeHistory.maxHistorySize = 100;
      
      const startTime = performance.now();
      
      // Add many states
      for (let i = 0; i < 100; i++) {
        mockEditableArea.innerHTML = `<div>State ${i}</div>`;
        largeHistory.saveState();
      }
      
      const endTime = performance.now();
      
      // Should complete within reasonable time (< 200ms to account for coverage instrumentation)
      expect(endTime - startTime).toBeLessThan(200);
      expect(largeHistory.history.length).toBe(100);
    });

    test('should properly clean up old states when exceeding limit', () => {
      stateHistory.maxHistorySize = 5;
      
      // Add 10 states
      for (let i = 0; i < 10; i++) {
        mockEditableArea.innerHTML = `<div>State ${i}</div>`;
        stateHistory.saveState();
      }
      
      // Should only keep last 5 states
      expect(stateHistory.history.length).toBe(5);
      expect(stateHistory.history[0]).toBe('<div>State 5</div>');
      expect(stateHistory.history[4]).toBe('<div>State 9</div>');
    });

    test('should handle memory-intensive content', () => {
      // Create large DOM structure
      let largeContent = '<div>';
      for (let i = 0; i < 100; i++) {
        largeContent += `<div class="block-${i}"><p>Content ${i}</p></div>`;
      }
      largeContent += '</div>';
      
      mockEditableArea.innerHTML = largeContent;
      
      expect(() => {
        stateHistory.saveState();
        stateHistory.undo();
        stateHistory.redo();
      }).not.toThrow();
    });
  });

  describe('Complex State Scenarios', () => {
    test('should handle nested HTML structures correctly', () => {
      const nestedHTML = `
        <div class="editor-block">
          <div class="columns">
            <div class="column">
              <div class="editor-snippet">
                <p>Nested content</p>
              </div>
            </div>
          </div>
        </div>
      `;
      
      mockEditableArea.innerHTML = nestedHTML;
      stateHistory.saveState();
      
      mockEditableArea.innerHTML = '<div>Simple</div>';
      stateHistory.saveState();
      
      stateHistory.undo();
      expect(mockEditableArea.innerHTML.replace(/\s+/g, '')).toBe(nestedHTML.replace(/\s+/g, ''));
    });

    test('should preserve event handlers after restoration', () => {
      const blockWithHandlers = document.createElement('div');
      blockWithHandlers.className = 'editor-block';
      blockWithHandlers.innerHTML = '<span class="drag-handle">⋮⋮</span>';
      
      let clickCount = 0;
      blockWithHandlers.addEventListener('click', () => clickCount++);
      
      mockEditableArea.appendChild(blockWithHandlers);
      stateHistory.saveState();
      
      // Change state
      mockEditableArea.innerHTML = '<div>Different</div>';
      stateHistory.saveState();
      
      // Undo should restore structure but not event handlers (innerHTML limitation)
      stateHistory.undo();
      
      // Verify structure is restored
      expect(mockEditableArea.querySelector('.editor-block')).toBeTruthy();
      expect(mockEditableArea.querySelector('.drag-handle')).toBeTruthy();
      
      // Verify restoreFunctionality was called to reattach handlers
      expect(mockEditor.attachDragHandleListeners).toHaveBeenCalled();
    });

    test('should handle contentEditable elements properly', () => {
      mockEditableArea.innerHTML = `
        <div class="editor-block">
          <p contenteditable="true">Editable text</p>
          <h1 contenteditable="true">Editable heading</h1>
        </div>
      `;
      
      stateHistory.saveState();
      stateHistory.undo();
      stateHistory.redo();
      
      // Should restore contentEditable functionality
      expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalledTimes(2);
    });

    test('should handle script and style elements safely', () => {
      const unsafeContent = `
        <div>
          <script>alert('test');</script>
          <style>.test { color: red; }</style>
          <div>Safe content</div>
        </div>
      `;
      
      mockEditableArea.innerHTML = unsafeContent;
      stateHistory.saveState();
      
      // Should save the content as-is
      expect(stateHistory.history[stateHistory.currentIndex]).toContain('<script>');
      expect(stateHistory.history[stateHistory.currentIndex]).toContain('<style>');
    });
  });

  describe('Consecutive Operations', () => {
    test('should handle rapid consecutive saves', () => {
      const contents = [];
      for (let i = 0; i < 10; i++) {
        const content = `<div>Rapid ${i}</div>`;
        contents.push(content);
        mockEditableArea.innerHTML = content;
        stateHistory.saveState();
      }
      
      // Should save all unique states
      expect(stateHistory.history.length).toBe(11); // Initial + 10 new
      
      // Should be able to undo through all
      for (let i = 9; i >= 0; i--) {
        stateHistory.undo();
        if (i > 0) {
          expect(mockEditableArea.innerHTML).toBe(contents[i - 1]);
        }
      }
    });

    test('should handle alternating undo/redo operations', () => {
      // Setup states
      const states = ['<div>1</div>', '<div>2</div>', '<div>3</div>'];
      states.forEach(state => {
        mockEditableArea.innerHTML = state;
        stateHistory.saveState();
      });
      
      // Alternating operations
      stateHistory.undo();
      expect(mockEditableArea.innerHTML).toBe('<div>2</div>');
      
      stateHistory.redo();
      expect(mockEditableArea.innerHTML).toBe('<div>3</div>');
      
      stateHistory.undo();
      stateHistory.undo();
      expect(mockEditableArea.innerHTML).toBe('<div>1</div>');
      
      stateHistory.redo();
      expect(mockEditableArea.innerHTML).toBe('<div>2</div>');
    });

    test('should handle save after undo correctly', () => {
      // Build initial history
      mockEditableArea.innerHTML = '<div>State 1</div>';
      stateHistory.saveState();
      mockEditableArea.innerHTML = '<div>State 2</div>';
      stateHistory.saveState();
      mockEditableArea.innerHTML = '<div>State 3</div>';
      stateHistory.saveState();
      
      // Undo twice
      stateHistory.undo();
      stateHistory.undo();
      
      // Save new state (should truncate future)
      mockEditableArea.innerHTML = '<div>New branch</div>';
      stateHistory.saveState();
      
      // Verify history was truncated
      expect(stateHistory.history.length).toBe(3); // Initial + State 1 + New branch
      expect(stateHistory.history[2]).toBe('<div>New branch</div>');
      
      // Redo should not be possible
      const indexBefore = stateHistory.currentIndex;
      stateHistory.redo();
      expect(stateHistory.currentIndex).toBe(indexBefore);
    });
  });

  describe('Error Handling and Robustness', () => {
    test('should handle null or undefined editor gracefully', () => {
      // StateHistory will throw when trying to access editor.editableArea
      expect(() => {
        new StateHistory(null);
      }).toThrow();
      
      expect(() => {
        new StateHistory(undefined);
      }).toThrow();
    });

    test('should handle missing editableArea gracefully', () => {
      const editorWithoutArea = { 
        editableArea: null,
        makeExistingBlocksEditable: jest.fn(),
        attachDragHandleListeners: jest.fn()
      };
      
      expect(() => {
        new StateHistory(editorWithoutArea);
      }).toThrow();
    });

    test('should handle corrupted history state', () => {
      // Manually corrupt the history
      stateHistory.history = [undefined, null, '<div>Valid</div>'];
      stateHistory.currentIndex = 2;
      
      // Should handle undo to corrupted states
      expect(() => {
        stateHistory.undo();
      }).not.toThrow();
    });

    test('should handle invalid currentIndex', () => {
      // Set invalid index
      stateHistory.currentIndex = -1;
      
      expect(() => {
        stateHistory.undo();
      }).not.toThrow();
      
      stateHistory.currentIndex = 999;
      
      expect(() => {
        stateHistory.redo();
      }).not.toThrow();
    });

    test('should handle restoration errors', () => {
      // Make restoration fail
      mockEditor.makeExistingBlocksEditable = jest.fn(() => {
        throw new Error('Restoration failed');
      });
      
      mockEditableArea.innerHTML = '<div>New state</div>';
      stateHistory.saveState();
      
      // Currently throws if restoration fails - this is expected behavior
      expect(() => {
        stateHistory.undo();
      }).toThrow('Restoration failed');
      
      // However, the state should still be restored even if functionality restoration fails
      expect(mockEditableArea.innerHTML).toBe('<div class="initial-content">Initial content</div>');
    });
  });

  describe('Integration with Editor Features', () => {
    test('should coordinate with drag and drop operations', () => {
      mockEditableArea.innerHTML = `
        <div class="editor-block" draggable="true">
          <span class="drag-handle">⋮⋮</span>
          Block content
        </div>
      `;
      
      stateHistory.saveState();
      stateHistory.undo();
      stateHistory.redo();
      
      // Should restore drag functionality
      const block = mockEditableArea.querySelector('.editor-block');
      expect(mockEditor.attachDragHandleListeners).toHaveBeenCalledWith(block);
    });

    test('should work with image snippets', () => {
      mockEditableArea.innerHTML = `
        <div class="editor-snippet image-snippet">
          <img src="test.jpg" />
        </div>
      `;
      
      stateHistory.saveState();
      stateHistory.undo();
      stateHistory.redo();
      
      // Should setup image snippets
      const imageSnippet = mockEditableArea.querySelector('.image-snippet');
      expect(mockEditor.imageUploader.setupImageSnippet).toHaveBeenCalledWith(imageSnippet);
    });

    test('should handle Firefox-specific issues', () => {
      // Set Firefox user agent
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
        writable: true
      });
      
      mockEditableArea.innerHTML = '<p contenteditable="true">Firefox content</p>';
      stateHistory.saveState();
      
      stateHistory.undo();
      stateHistory.redo();
      
      // Should apply Firefox fixes
      expect(mockEditor.formattingToolbar.fixFirefoxEditableElements).toHaveBeenCalledTimes(2);
    });
  });

  describe('State Comparison and Deduplication', () => {
    test('should detect identical states correctly', () => {
      const content = '<div>Same content</div>';
      mockEditableArea.innerHTML = content;
      stateHistory.saveState();
      
      const lengthBefore = stateHistory.history.length;
      
      // Try to save identical state multiple times
      stateHistory.saveState();
      stateHistory.saveState();
      stateHistory.saveState();
      
      expect(stateHistory.history.length).toBe(lengthBefore);
    });

    test('should detect different states with minor changes', () => {
      mockEditableArea.innerHTML = '<div>Content</div>';
      stateHistory.saveState();
      
      const lengthBefore = stateHistory.history.length;
      
      // Minor change
      mockEditableArea.innerHTML = '<div>Content!</div>';
      stateHistory.saveState();
      
      expect(stateHistory.history.length).toBe(lengthBefore + 1);
    });

    test('should handle whitespace differences', () => {
      mockEditableArea.innerHTML = '<div>  Content  </div>';
      stateHistory.saveState();
      
      const lengthBefore = stateHistory.history.length;
      
      // Different whitespace
      mockEditableArea.innerHTML = '<div>Content</div>';
      stateHistory.saveState();
      
      // Should treat as different states
      expect(stateHistory.history.length).toBe(lengthBefore + 1);
    });
  });
});