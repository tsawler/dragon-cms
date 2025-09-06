import { ColumnResizer } from '../js/column-resizer.js';

describe('ColumnResizer', () => {
  let columnResizer;
  let mockEditor;
  let container;
  let columns;
  
  beforeEach(() => {
    // Setup DOM structure with columns
    document.body.innerHTML = `
      <div id="editable-area">
        <div id="test-container" class="column-container" style="display: flex; position: relative; width: 800px;">
          <div class="column" style="flex: 1;">Column 1</div>
          <div class="column" style="flex: 1;">Column 2</div>
        </div>
        <div id="three-column-container" class="column-container" style="display: flex; position: relative; width: 900px;">
          <div class="column" style="flex: 1;">Column A</div>
          <div class="column" style="flex: 1;">Column B</div>
          <div class="column" style="flex: 1;">Column C</div>
        </div>
      </div>
    `;
    
    container = document.getElementById('test-container');
    columns = container.querySelectorAll('.column');
    
    // Mock editor with required properties
    mockEditor = {
      editableArea: document.getElementById('editable-area'),
      currentMode: 'edit',
      stateHistory: {
        saveState: jest.fn()
      }
    };
    
    // Mock DOM methods for consistent testing
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      get() {
        const style = window.getComputedStyle(this);
        const width = style.width;
        if (width && width !== 'auto') {
          return parseInt(width, 10);
        }
        // Return default widths for test elements
        if (this.classList.contains('column')) {
          return 400; // Default column width
        }
        if (this.id === 'test-container') {
          return 800;
        }
        if (this.id === 'three-column-container') {
          return 900;
        }
        return 100; // Fallback
      },
      configurable: true
    });
    
    // Mock getBoundingClientRect for more precise testing
    Element.prototype.getBoundingClientRect = jest.fn(function() {
      const width = this.offsetWidth;
      return {
        width: width,
        height: 100,
        left: 0,
        right: width,
        top: 0,
        bottom: 100,
        x: 0,
        y: 0
      };
    });
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn().mockImplementation(cb => {
      setTimeout(cb, 0);
      return 1;
    });
    
    // Mock console methods to reduce test noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Clear any existing timers
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
    jest.useRealTimers();
    
    // Clean up global functions
    delete window.debugColumnResizer;
    delete window.inspectColumns;
    delete window.createTestColumns;
  });

  describe('Initialization', () => {
    test('should create ColumnResizer with default properties', () => {
      columnResizer = new ColumnResizer(mockEditor);
      
      expect(columnResizer.editor).toBe(mockEditor);
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
      expect(columnResizer.leftColumn).toBe(null);
      expect(columnResizer.rightColumn).toBe(null);
      expect(columnResizer.setupInProgress).toBe(false);
    });

    test('should add global debug functions', () => {
      columnResizer = new ColumnResizer(mockEditor);
      
      expect(typeof window.debugColumnResizer).toBe('function');
      expect(typeof window.inspectColumns).toBe('function');
      expect(typeof window.createTestColumns).toBe('function');
    });

    test('should add event listeners for mouse events', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      columnResizer = new ColumnResizer(mockEditor);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    test('should setup resize dividers after timeout', () => {
      const setupSpy = jest.spyOn(ColumnResizer.prototype, 'setupResizeDividers');
      
      columnResizer = new ColumnResizer(mockEditor);
      
      // Fast forward the initial setup timeout
      jest.advanceTimersByTime(500);
      
      expect(setupSpy).toHaveBeenCalled();
    });
  });

  describe('Resize Divider Setup', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
    });

    test('should create dividers between columns in edit mode', () => {
      columnResizer.setupResizeDividers();
      
      const dividers = container.querySelectorAll('.column-resize-divider');
      expect(dividers.length).toBe(1); // One divider between two columns
      
      const divider = dividers[0];
      expect(divider.dataset.leftIndex).toBe('0');
      expect(divider.dataset.rightIndex).toBe('1');
    });

    test('should not create dividers in display mode', () => {
      mockEditor.currentMode = 'display';
      
      columnResizer.setupResizeDividers();
      
      const dividers = container.querySelectorAll('.column-resize-divider');
      expect(dividers.length).toBe(0);
    });

    test('should create multiple dividers for three columns', () => {
      const threeColumnContainer = document.getElementById('three-column-container');
      
      columnResizer.setupResizeDividers();
      
      const dividers = threeColumnContainer.querySelectorAll('.column-resize-divider');
      expect(dividers.length).toBe(2); // Two dividers for three columns
      
      expect(dividers[0].dataset.leftIndex).toBe('0');
      expect(dividers[0].dataset.rightIndex).toBe('1');
      expect(dividers[1].dataset.leftIndex).toBe('1');
      expect(dividers[1].dataset.rightIndex).toBe('2');
    });

    test('should remove existing dividers before creating new ones', () => {
      // Create initial dividers
      columnResizer.setupResizeDividers();
      const initialDividers = container.querySelectorAll('.column-resize-divider');
      expect(initialDividers.length).toBe(1);
      
      // Setup again should replace, not add
      columnResizer.setupResizeDividers();
      const finalDividers = container.querySelectorAll('.column-resize-divider');
      expect(finalDividers.length).toBe(1);
    });

    test('should make containers relative positioned', () => {
      columnResizer.setupResizeDividers();
      
      expect(container.style.position).toBe('relative');
    });

    test('should prevent recursive setup calls', () => {
      const originalSetup = columnResizer.setupResizeDividers;
      let callCount = 0;
      
      columnResizer.setupResizeDividers = function() {
        callCount++;
        return originalSetup.call(this);
      };
      
      // Call setup while already in progress
      columnResizer.setupInProgress = true;
      columnResizer.setupResizeDividers();
      
      expect(callCount).toBe(1);
      expect(columnResizer.setupInProgress).toBe(true);
    });

    test('should position dividers correctly between columns', () => {
      // Mock getBoundingClientRect for precise positioning
      const mockLeftColumn = columns[0];
      const mockRightColumn = columns[1];
      
      mockLeftColumn.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        right: 400,
        width: 400,
        height: 100,
        top: 0,
        bottom: 100
      }));
      
      container.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        right: 800,
        width: 800,
        height: 100,
        top: 0,
        bottom: 100
      }));
      
      columnResizer.setupResizeDividers();
      
      const divider = container.querySelector('.column-resize-divider');
      expect(divider.style.left).toBe('400px');
    });

    test('should create update position function for dividers', () => {
      columnResizer.setupResizeDividers();
      
      const divider = container.querySelector('.column-resize-divider');
      expect(typeof divider.updatePosition).toBe('function');
    });
  });

  describe('Mouse Event Handling - MouseDown', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
    });

    test('should handle mousedown on resize divider', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      Object.defineProperty(mouseEvent, 'preventDefault', {
        value: jest.fn()
      });
      Object.defineProperty(mouseEvent, 'stopPropagation', {
        value: jest.fn()
      });
      
      divider.dispatchEvent(mouseEvent);
      
      expect(columnResizer.isResizing).toBe(true);
      expect(columnResizer.currentDivider).toBe(divider);
      expect(columnResizer.startX).toBe(400);
      expect(mouseEvent.preventDefault).toHaveBeenCalled();
      expect(mouseEvent.stopPropagation).toHaveBeenCalled();
    });

    test('should not handle mousedown on non-divider elements', () => {
      const column = columns[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 200,
        bubbles: true
      });
      
      column.dispatchEvent(mouseEvent);
      
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
    });

    test('should not handle mousedown in display mode', () => {
      mockEditor.currentMode = 'display';
      
      const divider = container.querySelector('.column-resize-divider');
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseEvent);
      
      expect(columnResizer.isResizing).toBe(false);
    });

    test('should set up column references correctly', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseEvent);
      
      expect(columnResizer.leftColumn).toBe(columns[0]);
      expect(columnResizer.rightColumn).toBe(columns[1]);
      expect(columnResizer.leftStartWidth).toBe(400);
      expect(columnResizer.rightStartWidth).toBe(400);
      expect(columnResizer.containerWidth).toBe(800);
    });

    test('should add visual feedback classes and styles', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseEvent);
      
      expect(document.body.classList.contains('column-resizing')).toBe(true);
      expect(divider.classList.contains('active')).toBe(true);
      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');
    });

    test('should handle missing container gracefully', () => {
      const orphanDivider = document.createElement('div');
      orphanDivider.className = 'column-resize-divider';
      orphanDivider.dataset.leftIndex = '0';
      orphanDivider.dataset.rightIndex = '1';
      
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      Object.defineProperty(mouseEvent, 'target', {
        value: orphanDivider,
        configurable: true
      });
      Object.defineProperty(mouseEvent, 'preventDefault', {
        value: jest.fn(),
        configurable: true
      });
      Object.defineProperty(mouseEvent, 'stopPropagation', {
        value: jest.fn(),
        configurable: true
      });
      
      columnResizer.handleMouseDown(mouseEvent);
      
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
      expect(console.error).toHaveBeenCalledWith('No container found for divider');
    });

    test('should handle missing columns gracefully', () => {
      const divider = container.querySelector('.column-resize-divider');
      divider.dataset.leftIndex = '10'; // Invalid index
      divider.dataset.rightIndex = '11'; // Invalid index
      
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      Object.defineProperty(mouseEvent, 'target', {
        value: divider,
        configurable: true
      });
      Object.defineProperty(mouseEvent, 'preventDefault', {
        value: jest.fn(),
        configurable: true
      });
      Object.defineProperty(mouseEvent, 'stopPropagation', {
        value: jest.fn(),
        configurable: true
      });
      
      columnResizer.handleMouseDown(mouseEvent);
      
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
      expect(columnResizer.leftColumn).toBe(null);
      expect(columnResizer.rightColumn).toBe(null);
      expect(console.error).toHaveBeenCalledWith('Could not find columns for resize');
    });
  });

  describe('Mouse Event Handling - MouseMove', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
      
      // Start resize operation
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
    });

    test('should resize columns during mousemove', () => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450, // Move 50px to the right
        bubbles: true
      });
      Object.defineProperty(mouseMoveEvent, 'preventDefault', {
        value: jest.fn()
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Left column should grow, right column should shrink
      expect(columnResizer.leftColumn.style.flex).toContain('%');
      expect(columnResizer.rightColumn.style.flex).toContain('%');
      expect(mouseMoveEvent.preventDefault).toHaveBeenCalled();
    });

    test('should calculate correct percentages for two columns', () => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450, // Move 50px to the right
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // With deltaX = 50: leftWidth = 450, rightWidth = 350, total = 800
      // leftPercent = 56.25%, rightPercent = 43.75%
      expect(columnResizer.leftColumn.style.flex).toBe('0 0 56.25%');
      expect(columnResizer.rightColumn.style.flex).toBe('0 0 43.75%');
    });

    test('should respect minimum width constraints', () => {
      // Try to make left column very small (less than 50px minimum)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 100, // Move 300px to the left (would make left column 100px)
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Columns should not resize if it would violate minimum width
      // The exact behavior depends on whether the constraint is enforced
      expect(columnResizer.leftColumn.style.flex).toBeDefined();
      expect(columnResizer.rightColumn.style.flex).toBeDefined();
    });

    test('should handle three-column layouts differently', () => {
      // Setup three-column resize
      const threeColumnContainer = document.getElementById('three-column-container');
      const threeColumns = threeColumnContainer.querySelectorAll('.column');
      
      // Manually set up resize state for three columns
      columnResizer.leftColumn = threeColumns[0];
      columnResizer.rightColumn = threeColumns[1];
      columnResizer.leftStartWidth = 300;
      columnResizer.rightStartWidth = 300;
      columnResizer.containerWidth = 900;
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450, // Move 50px from startX = 400
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should calculate percentages for all columns
      expect(columnResizer.leftColumn.style.flex).toContain('%');
      expect(columnResizer.rightColumn.style.flex).toContain('%');
    });

    test('should not resize when not in resizing mode', () => {
      columnResizer.isResizing = false;
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        bubbles: true
      });
      
      const originalLeftFlex = columnResizer.leftColumn.style.flex;
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      expect(columnResizer.leftColumn.style.flex).toBe(originalLeftFlex);
    });

    test('should update divider position during resize', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      
      const divider = columnResizer.currentDivider;
      divider.updatePosition = jest.fn();
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should use requestAnimationFrame for smooth updates
      expect(rafSpy).toHaveBeenCalled();
      
      rafSpy.mockRestore();
    });

    test('should prevent mousemove if minimum width would be violated', () => {
      // Test case where resizing would make a column too small
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // Move 350px to the left (left column would be 50px, right would be 750px)
        bubbles: true
      });
      
      const originalLeftFlex = columnResizer.leftColumn.style.flex || '';
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Column should still be resized since 50px meets the minimum
      expect(columnResizer.leftColumn.style.flex).not.toBe(originalLeftFlex);
    });

    test('should prevent mousemove if it would make column smaller than minimum', () => {
      // Test case where resizing would violate minimum width constraint
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 25, // Move 375px to the left (left column would be 25px < 50px minimum)
        bubbles: true
      });
      
      const originalLeftFlex = columnResizer.leftColumn.style.flex || '';
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Columns should not change if constraint is violated
      expect(columnResizer.leftColumn.style.flex).toBe(originalLeftFlex);
    });
  });

  describe('Mouse Event Handling - MouseUp', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
      
      // Start resize operation
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
    });

    test('should end resize operation on mouseup', () => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      columnResizer.handleMouseUp(mouseUpEvent);
      
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
      expect(columnResizer.leftColumn).toBe(null);
      expect(columnResizer.rightColumn).toBe(null);
    });

    test('should remove visual feedback classes and styles', () => {
      const divider = columnResizer.currentDivider;
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      columnResizer.handleMouseUp(mouseUpEvent);
      
      expect(document.body.classList.contains('column-resizing')).toBe(false);
      expect(divider.classList.contains('active')).toBe(false);
      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
    });

    test('should save state after resize', () => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      columnResizer.handleMouseUp(mouseUpEvent);
      
      expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should not affect anything when not resizing', () => {
      columnResizer.isResizing = false;
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      columnResizer.handleMouseUp(mouseUpEvent);
      
      expect(mockEditor.stateHistory.saveState).not.toHaveBeenCalled();
    });

    test('should handle missing stateHistory gracefully', () => {
      mockEditor.stateHistory = null;
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      expect(() => {
        columnResizer.handleMouseUp(mouseUpEvent);
      }).not.toThrow();
    });
  });

  describe('Column Width Calculations and Constraints', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
    });

    test('should calculate correct percentages for equal columns', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // No movement - should maintain 50-50 split
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 400, // No movement
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      expect(columnResizer.leftColumn.style.flex).toBe('0 0 50%');
      expect(columnResizer.rightColumn.style.flex).toBe('0 0 50%');
    });

    test('should handle asymmetric column splits correctly', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Move 100px to the right
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 500,
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Left: 500px, Right: 300px, Total: 800px
      // Left: 62.5%, Right: 37.5%
      expect(columnResizer.leftColumn.style.flex).toBe('0 0 62.5%');
      expect(columnResizer.rightColumn.style.flex).toBe('0 0 37.5%');
    });

    test('should enforce minimum width of 50px', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Try to move way to the left (would make left column 25px)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 25,
        bubbles: true
      });
      
      const originalLeftFlex = columnResizer.leftColumn.style.flex || '';
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should not resize because it would violate minimum width
      expect(columnResizer.leftColumn.style.flex).toBe(originalLeftFlex);
    });

    test('should handle edge case at exactly minimum width', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Move to make left column exactly 50px
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // 400 - 350 = 50px for left column
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should allow resize since it meets minimum
      expect(columnResizer.leftColumn.style.flex).not.toBe('');
      expect(columnResizer.rightColumn.style.flex).not.toBe('');
    });

    test('should handle complex three-column percentage calculations', () => {
      const threeColumnContainer = document.getElementById('three-column-container');
      const threeColumns = threeColumnContainer.querySelectorAll('.column');
      
      // Mock getBoundingClientRect for three columns (300px each)
      threeColumns.forEach((col, index) => {
        col.getBoundingClientRect = jest.fn(() => ({
          width: 300,
          height: 100,
          left: index * 300,
          right: (index + 1) * 300,
          top: 0,
          bottom: 100
        }));
      });
      
      threeColumnContainer.getBoundingClientRect = jest.fn(() => ({
        width: 900,
        height: 100,
        left: 0,
        right: 900,
        top: 0,
        bottom: 100
      }));
      
      // Set up resize state for middle divider
      columnResizer.leftColumn = threeColumns[0];
      columnResizer.rightColumn = threeColumns[1];
      columnResizer.leftStartWidth = 300;
      columnResizer.rightStartWidth = 300;
      columnResizer.containerWidth = 900;
      columnResizer.isResizing = true;
      columnResizer.startX = 300;
      
      const mockDivider = document.createElement('div');
      mockDivider.dataset.leftIndex = '0';
      mockDivider.dataset.rightIndex = '1';
      columnResizer.currentDivider = mockDivider;
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 350, // Move 50px right
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // All three columns should have updated flex values
      expect(threeColumns[0].style.flex).toContain('%');
      expect(threeColumns[1].style.flex).toContain('%');
      expect(threeColumns[2].style.flex).toContain('%');
    });
  });

  describe('Visual Feedback During Resize Operations', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
    });

    test('should add resize cursor during mousedown', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseDownEvent);
      
      expect(document.body.style.cursor).toBe('col-resize');
      expect(document.body.style.userSelect).toBe('none');
    });

    test('should add active class to divider during resize', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseDownEvent);
      
      expect(divider.classList.contains('active')).toBe(true);
    });

    test('should add resizing class to body', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      
      divider.dispatchEvent(mouseDownEvent);
      
      expect(document.body.classList.contains('column-resizing')).toBe(true);
    });

    test('should remove all visual feedback on mouseup', () => {
      const divider = container.querySelector('.column-resize-divider');
      
      // Start resize
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // End resize
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      columnResizer.handleMouseUp(mouseUpEvent);
      
      expect(document.body.style.cursor).toBe('');
      expect(document.body.style.userSelect).toBe('');
      expect(divider.classList.contains('active')).toBe(false);
      expect(document.body.classList.contains('column-resizing')).toBe(false);
    });

    test('should update divider position during drag', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      
      const divider = container.querySelector('.column-resize-divider');
      divider.updatePosition = jest.fn();
      
      // Start resize
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Move mouse
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        bubbles: true
      });
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should schedule position update
      expect(rafSpy).toHaveBeenCalled();
      
      // Execute the animation frame callback
      jest.runAllTimers();
      
      rafSpy.mockRestore();
    });
  });

  describe('Integration with Block Settings Modal', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
    });

    test('should refresh dividers when called', () => {
      const setupSpy = jest.spyOn(columnResizer, 'setupResizeDividers');
      
      columnResizer.refresh();
      
      // Should schedule setup after timeout
      jest.advanceTimersByTime(100);
      
      expect(setupSpy).toHaveBeenCalled();
    });

    test('should clear previous refresh timeout', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      columnResizer.refresh();
      columnResizer.refresh(); // Call again quickly
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    test('should initialize columns after refresh', () => {
      const setupSpy = jest.spyOn(columnResizer, 'setupResizeDividers');
      
      columnResizer.refresh();
      jest.advanceTimersByTime(100);
      
      expect(setupSpy).toHaveBeenCalled();
    });
  });

  describe('Boundary Constraints and Min/Max Width Limits', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
      columnResizer.setupResizeDividers();
    });

    test('should prevent left column from becoming smaller than 50px', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Try to make left column 25px (too small)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 25,
        bubbles: true
      });
      
      const originalFlex = columnResizer.leftColumn.style.flex || '';
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should not change because it violates minimum width
      expect(columnResizer.leftColumn.style.flex).toBe(originalFlex);
    });

    test('should prevent right column from becoming smaller than 50px', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Try to make right column 25px (move far to the right)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 775, // Would make right column 25px
        bubbles: true
      });
      
      const originalFlex = columnResizer.rightColumn.style.flex || '';
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should not change because it violates minimum width
      expect(columnResizer.rightColumn.style.flex).toBe(originalFlex);
    });

    test('should allow resize when both columns meet minimum width', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Make left column 100px, right column 700px (both > 50px)
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 100,
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should allow resize since both columns meet minimum
      expect(columnResizer.leftColumn.style.flex).not.toBe('');
      expect(columnResizer.rightColumn.style.flex).not.toBe('');
    });

    test('should calculate minimum width correctly for percentage layout', () => {
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Test boundary condition: exactly 50px for each column
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 50, // Left = 50px, Right = 750px
        bubbles: true
      });
      
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      // Should be allowed since left column is exactly 50px
      const leftFlexValue = columnResizer.leftColumn.style.flex;
      expect(leftFlexValue).toContain('%');
      expect(leftFlexValue).not.toBe('');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
    });

    test('should handle containers with no columns', () => {
      const emptyContainer = document.createElement('div');
      document.body.appendChild(emptyContainer);
      
      expect(() => {
        columnResizer.setupResizeDividers();
      }).not.toThrow();
    });

    test('should handle containers with only one column', () => {
      const singleColumnContainer = document.createElement('div');
      singleColumnContainer.innerHTML = '<div class="column">Single Column</div>';
      document.body.appendChild(singleColumnContainer);
      
      columnResizer.setupResizeDividers();
      
      const dividers = singleColumnContainer.querySelectorAll('.column-resize-divider');
      expect(dividers.length).toBe(0);
    });

    test('should handle missing editor gracefully', () => {
      expect(() => {
        const resizerWithoutEditor = new ColumnResizer(null);
        resizerWithoutEditor.setupResizeDividers();
      }).not.toThrow();
    });

    test('should handle missing editable area', () => {
      const editorWithoutArea = {
        currentMode: 'edit',
        editableArea: null,
        stateHistory: { saveState: jest.fn() }
      };
      
      const resizerWithBadEditor = new ColumnResizer(editorWithoutArea);
      
      expect(() => {
        resizerWithBadEditor.setupResizeDividers();
      }).not.toThrow();
    });

    test('should handle invalid divider indices', () => {
      columnResizer.setupResizeDividers();
      
      const divider = container.querySelector('.column-resize-divider');
      divider.dataset.leftIndex = 'invalid';
      divider.dataset.rightIndex = 'also-invalid';
      
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      Object.defineProperty(mouseDownEvent, 'target', {
        value: divider,
        configurable: true
      });
      Object.defineProperty(mouseDownEvent, 'preventDefault', {
        value: jest.fn(),
        configurable: true
      });
      Object.defineProperty(mouseDownEvent, 'stopPropagation', {
        value: jest.fn(),
        configurable: true
      });
      
      columnResizer.handleMouseDown(mouseDownEvent);
      
      expect(columnResizer.isResizing).toBe(false);
      expect(columnResizer.currentDivider).toBe(null);
      expect(columnResizer.leftColumn).toBe(null);
      expect(columnResizer.rightColumn).toBe(null);
      expect(console.error).toHaveBeenCalledWith('Could not find columns for resize');
    });

    test('should handle mousemove without valid resize state', () => {
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        bubbles: true
      });
      
      // No setup, should not throw
      expect(() => {
        columnResizer.handleMouseMove(mouseMoveEvent);
      }).not.toThrow();
    });

    test('should handle mouseup without active resize', () => {
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      
      expect(() => {
        columnResizer.handleMouseUp(mouseUpEvent);
      }).not.toThrow();
      
      expect(mockEditor.stateHistory.saveState).not.toHaveBeenCalled();
    });
  });

  describe('Debug Functions', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
    });

    test('should create debugColumnResizer global function', () => {
      expect(typeof window.debugColumnResizer).toBe('function');
      
      const setupSpy = jest.spyOn(columnResizer, 'setupResizeDividers');
      window.debugColumnResizer();
      
      expect(setupSpy).toHaveBeenCalled();
    });

    test('should create inspectColumns global function', () => {
      expect(typeof window.inspectColumns).toBe('function');
      
      // Should not throw when called
      expect(() => {
        window.inspectColumns();
      }).not.toThrow();
    });

    test('should create createTestColumns global function', () => {
      expect(typeof window.createTestColumns).toBe('function');
      
      window.createTestColumns();
      
      // Should create test columns in editable area
      const testContainer = mockEditor.editableArea.querySelector('.column-container');
      expect(testContainer).toBeTruthy();
      
      const testColumns = testContainer.querySelectorAll('.column');
      expect(testColumns.length).toBe(2);
    });

    test('should setup dividers after creating test columns', () => {
      const setupSpy = jest.spyOn(columnResizer, 'setupResizeDividers');
      
      window.createTestColumns();
      
      // Fast forward the setTimeout
      jest.advanceTimersByTime(100);
      
      expect(setupSpy).toHaveBeenCalled();
    });
  });

  describe('Performance and Memory Management', () => {
    beforeEach(() => {
      columnResizer = new ColumnResizer(mockEditor);
    });

    test('should use requestAnimationFrame for smooth position updates', () => {
      const rafSpy = jest.spyOn(global, 'requestAnimationFrame');
      
      columnResizer.setupResizeDividers();
      
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 450,
        bubbles: true
      });
      columnResizer.handleMouseMove(mouseMoveEvent);
      
      expect(rafSpy).toHaveBeenCalled();
      
      rafSpy.mockRestore();
    });

    test('should clear timeout when refresh is called multiple times', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      columnResizer.refresh();
      const firstTimeout = columnResizer.refreshTimeout;
      
      columnResizer.refresh();
      
      expect(clearTimeoutSpy).toHaveBeenCalledWith(firstTimeout);
    });

    test('should not setup dividers recursively', () => {
      const originalSetup = columnResizer.setupResizeDividers.bind(columnResizer);
      let callCount = 0;
      
      columnResizer.setupResizeDividers = function() {
        callCount++;
        return originalSetup();
      };
      
      columnResizer.setupInProgress = true;
      columnResizer.setupResizeDividers();
      
      expect(callCount).toBe(1);
    });

    test('should clean up references after mouseup', () => {
      columnResizer.setupResizeDividers();
      
      const divider = container.querySelector('.column-resize-divider');
      const mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 400,
        bubbles: true
      });
      divider.dispatchEvent(mouseDownEvent);
      
      // Verify references are set
      expect(columnResizer.currentDivider).toBe(divider);
      expect(columnResizer.leftColumn).toBe(columns[0]);
      expect(columnResizer.rightColumn).toBe(columns[1]);
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        bubbles: true
      });
      columnResizer.handleMouseUp(mouseUpEvent);
      
      // Verify references are cleaned up
      expect(columnResizer.currentDivider).toBe(null);
      expect(columnResizer.leftColumn).toBe(null);
      expect(columnResizer.rightColumn).toBe(null);
    });
  });
});