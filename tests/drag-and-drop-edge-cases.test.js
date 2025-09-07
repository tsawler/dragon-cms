import { Editor } from '../js/editor-core.js';

// Polyfill for DragEvent which is not available in jsdom
class DragEvent extends MouseEvent {
  constructor(type, init = {}) {
    super(type, init);
    this.dataTransfer = init.dataTransfer || null;
  }
}
global.DragEvent = DragEvent;

// Mock dependencies
jest.mock('../js/state-history.js', () => ({
  StateHistory: jest.fn().mockImplementation(() => ({
    saveState: jest.fn()
  }))
}));
jest.mock('../js/formatting-toolbar.js');
jest.mock('../js/image-uploader.js');
jest.mock('../js/video-settings-modal.js');
jest.mock('../js/modals.js');
jest.mock('../js/snippet-panel.js');
jest.mock('../js/column-resizer.js');
jest.mock('../js/page-settings-modal.js');
jest.mock('../js/modal-dragger.js');
jest.mock('../js/button-settings-modal.js');

describe('Drag and Drop Edge Cases and Stress Tests', () => {
  let editor;
  let editableArea;
  let mockDataTransfer;
  
  beforeEach(() => {
    // Setup DOM structure
    document.body.innerHTML = `
      <div id="dragon-editor">
        <div class="dragon-editor">
          <div class="editor-container">
            <div class="editor-header">
              <div class="editor-controls">
                <button id="toggle-mode-btn">Switch to Display Mode</button>
                <button id="undo-btn">↶</button>
                <button id="redo-btn">↷</button>
              </div>
            </div>
            <div class="editor-main">
              <aside id="snippet-panel" class="snippet-panel">
                <div class="snippet-list">
                  <div class="panel-item" draggable="true" data-type="snippet" data-snippet-type="text" data-template="<p>Text snippet</p>">
                    Text Snippet
                  </div>
                  <div class="panel-item" draggable="true" data-type="block" data-template="<div>Block content</div>">
                    Block Item
                  </div>
                </div>
              </aside>
              <main id="editable-area" class="editable-area" data-mode="edit">
                <div class="drop-zone-placeholder"></div>
              </main>
            </div>
          </div>
          <div class="viewport-controls">
            <button id="mobile-viewport" class="viewport-btn">📱</button>
            <button id="tablet-viewport" class="viewport-btn">📟</button>
            <button id="desktop-viewport" class="viewport-btn active">🖥️</button>
          </div>
        </div>
      </div>
    `;
    
    editor = new Editor({
      assetsPath: 'assets/',
      showCodeIcon: true
    });
    
    editableArea = document.getElementById('editable-area');
    
    // Mock DataTransfer object
    mockDataTransfer = {
      effectAllowed: '',
      dropEffect: '',
      data: {},
      setData: jest.fn((key, value) => {
        mockDataTransfer.data[key] = value;
      }),
      getData: jest.fn((key) => mockDataTransfer.data[key] || ''),
      clearData: jest.fn(() => {
        mockDataTransfer.data = {};
      })
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Edge Case: Drop without dragstart', () => {
    test('should handle drop event when no drag was initiated', () => {
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });

      expect(() => {
        editableArea.dispatchEvent(dropEvent);
      }).not.toThrow();

      // Should not create any elements
      expect(editableArea.querySelectorAll('.editor-block').length).toBe(0);
      expect(editableArea.querySelectorAll('.editor-snippet').length).toBe(0);
    });

    test('should handle drop with partial data', () => {
      mockDataTransfer.setData('elementType', 'block');
      // Missing template data
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });

      expect(() => {
        editableArea.dispatchEvent(dropEvent);
      }).not.toThrow();
    });
  });

  describe('Edge Case: Invalid drop targets', () => {
    test('should restore original position when dropping snippet outside block', () => {
      // Create a block with a snippet
      const block = document.createElement('div');
      block.className = 'editor-block';
      const snippet = document.createElement('div');
      snippet.className = 'editor-snippet';
      snippet.draggable = true;
      block.appendChild(snippet);
      editableArea.appendChild(block);

      // Store original position
      editor.originalPosition = {
        parent: block,
        nextSibling: null
      };

      // Simulate dragging snippet
      const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      snippet.dispatchEvent(dragstartEvent);

      // Try to drop directly in editable area (invalid for snippets)
      mockDataTransfer.setData('elementType', 'snippet');
      mockDataTransfer.setData('snippetType', 'existing');
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      
      // Set drop target to editableArea directly
      Object.defineProperty(dropEvent, 'target', {
        value: editableArea,
        writable: false
      });

      editableArea.dispatchEvent(dropEvent);

      // Snippet should remain in original block
      expect(block.contains(snippet)).toBe(true);
    });
  });

  describe('Edge Case: Rapid successive operations', () => {
    test('should handle multiple rapid drag operations without errors', () => {
      const panelItem = document.querySelector('.panel-item[data-type="block"]');
      
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(() => {
          const dragstartEvent = new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            dataTransfer: mockDataTransfer
          });
          panelItem.dispatchEvent(dragstartEvent);

          const dragendEvent = new DragEvent('dragend', {
            bubbles: true,
            cancelable: true
          });
          panelItem.dispatchEvent(dragendEvent);
        });
      }

      expect(() => {
        operations.forEach(op => op());
      }).not.toThrow();
    });

    test('should clear visual indicators between rapid operations', () => {
      // Simulate rapid dragover events
      for (let i = 0; i < 5; i++) {
        const dragoverEvent = new DragEvent('dragover', {
          bubbles: true,
          cancelable: true,
          dataTransfer: mockDataTransfer,
          clientY: 100 + (i * 10)
        });
        editableArea.dispatchEvent(dragoverEvent);
      }

      // Check that only one indicator exists at a time
      const indicators = document.querySelectorAll('.drop-indicator');
      expect(indicators.length).toBeLessThanOrEqual(1);
      
      const overlays = document.querySelectorAll('.drop-zone-overlay');
      expect(overlays.length).toBeLessThanOrEqual(1);
    });
  });

  describe('Edge Case: Corrupted drag data', () => {
    test('should handle malformed template data gracefully', () => {
      mockDataTransfer.setData('elementType', 'block');
      mockDataTransfer.setData('template', '<div>Unclosed div');
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });

      expect(() => {
        editableArea.dispatchEvent(dropEvent);
      }).not.toThrow();
    });

    test('should handle null or undefined in drag data', () => {
      mockDataTransfer.setData('elementType', null);
      mockDataTransfer.setData('template', undefined);
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });

      expect(() => {
        editableArea.dispatchEvent(dropEvent);
      }).not.toThrow();
    });
  });

  describe('Edge Case: State preservation', () => {
    test('should properly manage currentDragOperation through complete cycle', () => {
      const panelItem = document.querySelector('.panel-item[data-type="block"]');
      
      // Set up dataTransfer data as if dragging from panel
      mockDataTransfer.setData('elementType', 'block');
      mockDataTransfer.setData('template', '<div>Block content</div>');
      
      // Start drag
      const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      Object.defineProperty(dragstartEvent, 'target', {
        value: panelItem,
        writable: false
      });
      panelItem.dispatchEvent(dragstartEvent);
      
      // For panel items, currentDragOperation is set during dragover, not dragstart
      const dragoverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      editableArea.dispatchEvent(dragoverEvent);
      
      // Complete drop
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      editableArea.dispatchEvent(dropEvent);
      
      // currentDragOperation should be cleared
      expect(editor.currentDragOperation).toBeNull();
    });

    test('should handle activeExistingDrag fallback correctly', () => {
      // Create an existing element
      const block = document.createElement('div');
      block.className = 'editor-block';
      block.draggable = true;
      editableArea.appendChild(block);
      
      // Set activeExistingDrag and simulate proper drag data
      editor.activeExistingDrag = block;
      mockDataTransfer.setData('elementType', 'block');
      mockDataTransfer.setData('isExisting', 'true');
      
      // Simulate drop without draggingElement class
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      
      editableArea.dispatchEvent(dropEvent);
      
      // activeExistingDrag should be cleared after successful drop processing
      // Note: The actual clearing happens in dragend, not drop
      const dragendEvent = new DragEvent('dragend', {
        bubbles: true,
        cancelable: true
      });
      Object.defineProperty(dragendEvent, 'target', {
        value: block,
        writable: false
      });
      editableArea.dispatchEvent(dragendEvent);
      
      expect(editor.activeExistingDrag).toBeNull();
    });
  });

  describe('Edge Case: Drop zone boundaries', () => {
    test('should handle drops at exact boundary positions', () => {
      // Create multiple blocks
      for (let i = 0; i < 3; i++) {
        const block = document.createElement('div');
        block.className = 'editor-block';
        block.style.height = '100px';
        block.getBoundingClientRect = jest.fn(() => ({
          top: i * 100,
          bottom: (i + 1) * 100,
          height: 100
        }));
        editableArea.appendChild(block);
      }

      // Set up drag data for block
      mockDataTransfer.setData('elementType', 'block');
      mockDataTransfer.setData('template', '<div>Block content</div>');
      
      // Test drop at exact midpoint
      const dragoverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer,
        clientY: 150 // Exactly between first and second block
      });

      editableArea.dispatchEvent(dragoverEvent);
      
      // Should have created an insertion line (not drop-indicator)
      const indicator = document.querySelector('.drop-insertion-line');
      expect(indicator).toBeTruthy();
    });
  });

  describe('Edge Case: Nested drag handle scenarios', () => {
    test('should only allow drag from handle when flag is set', () => {
      const block = document.createElement('div');
      block.className = 'editor-block';
      block.draggable = true;
      
      const dragHandle = document.createElement('span');
      dragHandle.className = 'drag-handle';
      block.appendChild(dragHandle);
      
      editableArea.appendChild(block);

      // Try drag without using handle
      const dragstartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: mockDataTransfer
      });
      
      // Should be prevented if not from handle
      block.dispatchEvent(dragstartEvent);
      
      // Now simulate drag from handle
      block.dataset.dragFromHandle = 'true';
      block.dispatchEvent(dragstartEvent);
      
      // Should be allowed
      expect(mockDataTransfer.setData).toHaveBeenCalled();
    });
  });

  describe('Edge Case: Memory cleanup', () => {
    test('should clean up orphaned visual indicators', () => {
      // Create multiple indicators manually
      for (let i = 0; i < 5; i++) {
        const indicator = document.createElement('div');
        indicator.className = 'drop-indicator';
        editableArea.appendChild(indicator);
      }

      // Verify we created 5 indicators
      expect(editableArea.querySelectorAll('.drop-indicator').length).toBe(5);

      // Trigger cleanup through clearVisualIndicators
      editor.clearVisualIndicators();

      // Should have cleaned up all indicators
      const indicators = editableArea.querySelectorAll('.drop-indicator');
      expect(indicators.length).toBe(0);
    });

    test('should clear all states on dragend', () => {
      const block = document.createElement('div');
      block.className = 'editor-block dragging-element';
      block.dataset.dragFromHandle = 'true';
      editableArea.appendChild(block);

      const dragendEvent = new DragEvent('dragend', {
        bubbles: true,
        cancelable: true
      });
      block.dispatchEvent(dragendEvent);

      expect(block.classList.contains('dragging-element')).toBe(false);
      expect(block.dataset.dragFromHandle).toBeUndefined();
    });
  });
});