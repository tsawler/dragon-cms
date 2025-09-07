import { ImageUploader } from '../js/image-uploader.js';

// Mock dependencies
jest.mock('../js/image-settings-modal.js', () => ({
  ImageSettingsModal: jest.fn().mockImplementation(() => ({
    open: jest.fn()
  }))
}));

// Mock FileReader
global.FileReader = class {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsDataURL(file) {
    // Simulate async operation
    setTimeout(() => {
      if (file && file.type.startsWith('image/')) {
        this.result = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
        this.onload?.({ target: { result: this.result } });
      } else {
        this.onerror?.(new Error('Invalid file type'));
      }
    }, 10);
  }
};

describe('Image Upload and Resize - Comprehensive Tests', () => {
  let imageUploader;
  let mockEditor;
  let container;
  
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="test-container">
        <div class="editor-snippet image-snippet">
          <div class="image-container">
            <img class="editable-image" src="default-image.jpg" alt="Default image">
            <div class="image-upload-zone" style="display: none;">
              <p>Drop image here or click to upload</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    container = document.getElementById('test-container');
    
    mockEditor = {
      stateHistory: {
        saveState: jest.fn()
      },
      mode: 'edit'
    };
    
    imageUploader = new ImageUploader(mockEditor);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Upload Zone Interaction Edge Cases', () => {
    test('should handle rapid hover events without errors', () => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      const imageContainer = snippet.querySelector('.image-container');
      const uploadZone = snippet.querySelector('.image-upload-zone');
      
      expect(() => {
        // Rapid fire hover events
        for (let i = 0; i < 10; i++) {
          imageContainer.dispatchEvent(new MouseEvent('mouseenter'));
          imageContainer.dispatchEvent(new MouseEvent('mouseleave'));
        }
      }).not.toThrow();
      
      // Upload zone should be hidden after mouseleave
      expect(uploadZone.style.display).toBe('none');
    });

    test('should handle upload zone click without file selection', () => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      const uploadZone = snippet.querySelector('.image-upload-zone');
      
      // Mock input.click() to not trigger actual file dialog
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn((tagName) => {
        if (tagName === 'input') {
          const mockInput = originalCreateElement.call(document, 'input');
          mockInput.click = jest.fn();
          return mockInput;
        }
        return originalCreateElement.call(document, tagName);
      });
      
      expect(() => {
        uploadZone.dispatchEvent(new MouseEvent('click'));
      }).not.toThrow();
      
      document.createElement = originalCreateElement;
    });

    test('should handle drag events with invalid data', () => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      const imageContainer = snippet.querySelector('.image-container');
      
      const mockDragEvent = {
        preventDefault: jest.fn(),
        dataTransfer: {
          files: []
        }
      };
      
      expect(() => {
        imageContainer.dispatchEvent(new CustomEvent('dragover'));
        imageContainer.dispatchEvent(new CustomEvent('drop', { detail: mockDragEvent }));
      }).not.toThrow();
    });
  });

  describe('File Processing Edge Cases', () => {
    test('should handle corrupted image files gracefully', (done) => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      const corruptedFile = new File(['corrupted data'], 'corrupted.jpg', { type: 'image/jpeg' });
      
      // Override FileReader to simulate corruption
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        constructor() {
          this.onload = null;
          this.onerror = null;
        }
        readAsDataURL() {
          setTimeout(() => {
            this.onerror?.(new Error('File corrupted'));
          }, 10);
        }
      };
      
      expect(() => {
        imageUploader.processImage(corruptedFile, snippet);
      }).not.toThrow();
      
      setTimeout(() => {
        global.FileReader = originalFileReader;
        done();
      }, 50);
    });

    test('should handle very large image files', (done) => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      // Create a mock large file
      const largeFile = new File(['x'.repeat(10000000)], 'large.jpg', { type: 'image/jpeg' });
      
      expect(() => {
        imageUploader.processImage(largeFile, snippet);
      }).not.toThrow();
      
      setTimeout(() => {
        // Should have created a resize container
        const resizeContainer = snippet.querySelector('.image-resize-container');
        expect(resizeContainer).toBeTruthy();
        done();
      }, 50);
    });

    test('should handle files with unusual MIME types', () => {
      const snippet = document.querySelector('.image-snippet');
      const event = {
        target: {
          files: [new File(['data'], 'image.webp', { type: 'image/webp' })]
        }
      };
      
      expect(() => {
        imageUploader.handleFileSelect(event, snippet);
      }).not.toThrow();
    });

    test('should reject non-image files silently', () => {
      const snippet = document.querySelector('.image-snippet');
      const event = {
        target: {
          files: [new File(['data'], 'document.pdf', { type: 'application/pdf' })]
        }
      };
      
      expect(() => {
        imageUploader.handleFileSelect(event, snippet);
      }).not.toThrow();
      
      // Should not create a resize container for non-images
      const resizeContainer = snippet.querySelector('.image-resize-container');
      expect(resizeContainer).toBeFalsy();
    });
  });

  describe('Resize Container Creation Edge Cases', () => {
    test('should handle missing image element in createImageResizeContainer', () => {
      expect(() => {
        const result = imageUploader.createImageResizeContainer(null);
        expect(result).toBeTruthy();
        expect(result.className).toContain('image-resize-container');
      }).not.toThrow();
    });

    test('should create all required resize handles', () => {
      const img = document.createElement('img');
      img.src = 'test.jpg';
      
      const container = imageUploader.createImageResizeContainer(img);
      
      const handles = container.querySelectorAll('.image-resize-handle');
      expect(handles.length).toBe(8);
      
      const expectedPositions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
      expectedPositions.forEach(position => {
        const handle = container.querySelector(`.image-resize-handle.${position}`);
        expect(handle).toBeTruthy();
        expect(handle.dataset.position).toBe(position);
      });
    });

    test('should create browse and settings icons', () => {
      const img = document.createElement('img');
      const container = imageUploader.createImageResizeContainer(img);
      
      const browseIcon = container.querySelector('.image-browse-icon');
      const settingsIcon = container.querySelector('.image-settings-icon');
      
      expect(browseIcon).toBeTruthy();
      expect(settingsIcon).toBeTruthy();
      expect(browseIcon.style.display).toBe('none'); // Initially hidden
      expect(settingsIcon.style.display).toBe('none'); // Initially hidden
    });
  });

  describe('Resize Functionality Edge Cases', () => {
    test('should maintain aspect ratio during corner resize', () => {
      const img = document.createElement('img');
      img.style.width = '200px';
      img.style.height = '100px';
      
      // Mock offsetWidth and offsetHeight
      Object.defineProperty(img, 'offsetWidth', { value: 200 });
      Object.defineProperty(img, 'offsetHeight', { value: 100 });
      
      const container = imageUploader.createImageResizeContainer(img);
      document.body.appendChild(container); // Add to DOM for event handling
      
      imageUploader.addResizeHandlers(container);
      
      const seHandle = container.querySelector('.image-resize-handle.se');
      
      // Simulate mousedown on southeast handle
      const mousedownEvent = new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100,
        bubbles: true
      });
      
      seHandle.dispatchEvent(mousedownEvent);
      
      // Simulate mouse movement
      const mousemoveEvent = new MouseEvent('mousemove', {
        clientX: 150, // +50 pixels right
        clientY: 125, // +25 pixels down
        bubbles: true
      });
      
      document.dispatchEvent(mousemoveEvent);
      
      // Check that aspect ratio is maintained (2:1)
      const newWidth = parseInt(img.style.width);
      const newHeight = parseInt(img.style.height);
      expect(newWidth / newHeight).toBeCloseTo(2, 1);
      
      // Cleanup
      document.dispatchEvent(new MouseEvent('mouseup'));
      document.body.removeChild(container);
    });

    test('should enforce minimum size constraints', () => {
      const img = document.createElement('img');
      img.style.width = '200px';
      img.style.height = '200px';
      
      Object.defineProperty(img, 'offsetWidth', { value: 200 });
      Object.defineProperty(img, 'offsetHeight', { value: 200 });
      
      const container = imageUploader.createImageResizeContainer(img);
      document.body.appendChild(container);
      
      imageUploader.addResizeHandlers(container);
      
      const wHandle = container.querySelector('.image-resize-handle.w');
      
      // Try to resize to very small size
      wHandle.dispatchEvent(new MouseEvent('mousedown', {
        clientX: 100,
        clientY: 100
      }));
      
      // Move far to the right (should shrink width significantly)
      document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: 300, // +200 pixels right (should make width very small)
        clientY: 100
      }));
      
      const finalWidth = parseInt(img.style.width);
      expect(finalWidth).toBeGreaterThanOrEqual(50); // Minimum size should be enforced
      
      document.dispatchEvent(new MouseEvent('mouseup'));
      document.body.removeChild(container);
    });

    test('should handle rapid resize operations', () => {
      const img = document.createElement('img');
      Object.defineProperty(img, 'offsetWidth', { value: 200 });
      Object.defineProperty(img, 'offsetHeight', { value: 200 });
      
      const container = imageUploader.createImageResizeContainer(img);
      document.body.appendChild(container);
      
      imageUploader.addResizeHandlers(container);
      
      const handle = container.querySelector('.image-resize-handle.se');
      
      expect(() => {
        // Start resize
        handle.dispatchEvent(new MouseEvent('mousedown', {
          clientX: 100,
          clientY: 100
        }));
        
        // Rapid mouse movements
        for (let i = 0; i < 10; i++) {
          document.dispatchEvent(new MouseEvent('mousemove', {
            clientX: 100 + i * 5,
            clientY: 100 + i * 5
          }));
        }
        
        // End resize
        document.dispatchEvent(new MouseEvent('mouseup'));
      }).not.toThrow();
      
      document.body.removeChild(container);
    });

    test('should handle resize on detached container', () => {
      const img = document.createElement('img');
      const container = imageUploader.createImageResizeContainer(img);
      // Don't add to DOM - test detached behavior
      
      expect(() => {
        imageUploader.addResizeHandlers(container);
        
        const handle = container.querySelector('.image-resize-handle.n');
        handle.dispatchEvent(new MouseEvent('mousedown'));
        document.dispatchEvent(new MouseEvent('mousemove', {
          clientX: 100,
          clientY: 50
        }));
        document.dispatchEvent(new MouseEvent('mouseup'));
      }).not.toThrow();
    });
  });

  describe('State Management Edge Cases', () => {
    test('should handle missing state history gracefully', () => {
      const editorWithoutHistory = {};
      const uploader = new ImageUploader(editorWithoutHistory);
      
      const snippet = document.querySelector('.image-snippet');
      const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
      
      expect(() => {
        uploader.processImage(file, snippet);
      }).not.toThrow();
    });

    test('should save state after image replacement', (done) => {
      const snippet = document.querySelector('.image-snippet');
      const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
      
      imageUploader.processImage(file, snippet);
      
      setTimeout(() => {
        expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        done();
      }, 50);
    });

    test('should save state after resize operation', () => {
      const img = document.createElement('img');
      const container = imageUploader.createImageResizeContainer(img);
      
      imageUploader.addResizeHandlers(container);
      
      const handle = container.querySelector('.image-resize-handle.e');
      
      // Start and end resize
      handle.dispatchEvent(new MouseEvent('mousedown'));
      document.dispatchEvent(new MouseEvent('mouseup'));
      
      expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
    });
  });

  describe('Icon Interaction Edge Cases', () => {
    test('should handle browse icon click without editor context', () => {
      const img = document.createElement('img');
      const container = imageUploader.createImageResizeContainer(img);
      const browseIcon = container.querySelector('.image-browse-icon');
      
      // Mock input creation and click
      const mockInput = { click: jest.fn() };
      const originalCreateElement = document.createElement;
      document.createElement = jest.fn(() => mockInput);
      
      expect(() => {
        browseIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }).not.toThrow();
      
      document.createElement = originalCreateElement;
    });

    test('should handle settings icon click', () => {
      const img = document.createElement('img');
      const container = imageUploader.createImageResizeContainer(img);
      const settingsIcon = container.querySelector('.image-settings-icon');
      
      expect(() => {
        settingsIcon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }).not.toThrow();
    });

    test('should handle missing icons during reattachment', () => {
      const container = document.createElement('div');
      container.className = 'image-resize-container';
      
      expect(() => {
        imageUploader.reattachImageHandlers(container);
      }).not.toThrow();
      
      // Should create missing icons
      const browseIcon = container.querySelector('.image-browse-icon');
      const settingsIcon = container.querySelector('.image-settings-icon');
      
      expect(browseIcon).toBeTruthy();
      expect(settingsIcon).toBeTruthy();
    });
  });

  describe('Integration with Existing Content', () => {
    test('should handle conversion of existing simple images', () => {
      const snippet = document.querySelector('.image-snippet');
      const img = snippet.querySelector('.editable-image');
      
      // Simulate image load
      expect(() => {
        imageUploader.convertToResizableContainer(snippet, img);
      }).not.toThrow();
      
      const resizeContainer = snippet.querySelector('.image-resize-container');
      expect(resizeContainer).toBeTruthy();
      expect(snippet.classList.contains('has-image-container')).toBe(true);
    });

    test('should handle existing resize containers gracefully', () => {
      const snippet = document.querySelector('.image-snippet');
      
      // Add an existing resize container
      const existingContainer = document.createElement('div');
      existingContainer.className = 'image-resize-container';
      snippet.appendChild(existingContainer);
      
      expect(() => {
        imageUploader.setupImageSnippet(snippet);
      }).not.toThrow();
    });

    test('should handle malformed snippet structure', () => {
      const malformedSnippet = document.createElement('div');
      malformedSnippet.className = 'image-snippet';
      // Missing required child elements
      
      expect(() => {
        imageUploader.setupImageSnippet(malformedSnippet);
      }).not.toThrow();
    });
  });

  describe('Memory Management', () => {
    test('should not create memory leaks with repeated operations', () => {
      const snippet = document.querySelector('.image-snippet');
      
      // Repeatedly setup and process images
      for (let i = 0; i < 10; i++) {
        imageUploader.setupImageSnippet(snippet);
        
        const file = new File(['data'], `test${i}.jpg`, { type: 'image/jpeg' });
        imageUploader.processImage(file, snippet);
      }
      
      // Should not accumulate excessive event listeners or DOM elements
      const containers = snippet.querySelectorAll('.image-resize-container');
      expect(containers.length).toBeLessThanOrEqual(2); // At most one active container
    });

    test('should clean up event listeners on container replacement', (done) => {
      const snippet = document.querySelector('.image-snippet');
      imageUploader.setupImageSnippet(snippet);
      
      const originalContainer = snippet.querySelector('.image-container');
      
      // Process an image (should replace container)
      const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
      imageUploader.processImage(file, snippet);
      
      // Wait for async FileReader operation
      setTimeout(() => {
        // Original container should be removed from DOM
        expect(snippet.contains(originalContainer)).toBe(false);
        
        // Should now have a resize container instead
        const resizeContainer = snippet.querySelector('.image-resize-container');
        expect(resizeContainer).toBeTruthy();
        
        done();
      }, 50);
    });
  });

  describe('Cross-browser Compatibility Edge Cases', () => {
    test('should handle browsers without drag and drop support', () => {
      const snippet = document.querySelector('.image-snippet');
      
      // Temporarily remove drag event support
      const originalAddEventListener = Element.prototype.addEventListener;
      Element.prototype.addEventListener = jest.fn((event, handler) => {
        if (!event.includes('drag')) {
          originalAddEventListener.call(this, event, handler);
        }
      });
      
      expect(() => {
        imageUploader.setupImageSnippet(snippet);
      }).not.toThrow();
      
      Element.prototype.addEventListener = originalAddEventListener;
    });

    test('should handle missing FileReader support', () => {
      const snippet = document.querySelector('.image-snippet');
      const originalFileReader = global.FileReader;
      
      global.FileReader = undefined;
      
      expect(() => {
        const file = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
        imageUploader.processImage(file, snippet);
      }).not.toThrow();
      
      global.FileReader = originalFileReader;
    });
  });
});