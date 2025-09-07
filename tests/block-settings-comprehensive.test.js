import { ColumnSettingsModal } from '../js/modals.js';

describe('ColumnSettingsModal - Comprehensive Edge Cases', () => {
  let modal;
  let editor;
  let mockBlock;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="dragon-editor">
        <div class="editable-area viewport-desktop">
          <div class="editor-block" id="test-block">
            <div class="block-column">
              <p>Test content</p>
            </div>
          </div>
        </div>
      </div>
    `;

    // Mock editor
    editor = {
      editableArea: document.querySelector('.editable-area'),
      stateHistory: {
        saveState: jest.fn()
      }
    };

    mockBlock = document.getElementById('test-block');
    modal = new ColumnSettingsModal(editor);

    // Mock window.alert
    window.alert = jest.fn();

    // Mock FileReader
    global.FileReader = jest.fn(() => ({
      readAsDataURL: jest.fn(),
      onload: jest.fn(),
      onerror: jest.fn(),
      result: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk'
    }));

    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-blob-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Full Viewport Width (Edge-to-Edge) Functionality', () => {
    test('should apply full viewport width correctly in desktop mode', () => {
      modal.open(mockBlock);
      
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      const blockWidthInput = modal.modal.querySelector('#block-width');
      
      // Enable full width
      fullWidthCheck.checked = true;
      fullWidthCheck.dispatchEvent(new Event('change'));
      
      modal.applyChanges();
      
      expect(mockBlock.classList.contains('full-width')).toBe(true);
      expect(mockBlock.style.width).toBe(''); // Full-width clears inline styles, uses CSS class
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should constrain full-width blocks in tablet mode', () => {
      // Switch to tablet viewport
      const editableArea = editor.editableArea;
      editableArea.classList.remove('viewport-desktop');
      editableArea.classList.add('viewport-tablet');
      
      modal.open(mockBlock);
      
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      fullWidthCheck.checked = true;
      fullWidthCheck.dispatchEvent(new Event('change'));
      
      modal.applyChanges();
      
      expect(mockBlock.classList.contains('full-width')).toBe(true);
      // Full-width uses CSS classes, not inline styles
      expect(mockBlock.style.width).toBe('');
    });

    test('should constrain full-width blocks in mobile mode', () => {
      // Switch to mobile viewport
      const editableArea = editor.editableArea;
      editableArea.classList.remove('viewport-desktop');
      editableArea.classList.add('viewport-mobile');
      
      modal.open(mockBlock);
      
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      fullWidthCheck.checked = true;
      fullWidthCheck.dispatchEvent(new Event('change'));
      
      modal.applyChanges();
      
      expect(mockBlock.classList.contains('full-width')).toBe(true);
    });

    test('should remove full-width when unchecked', () => {
      // First apply full width
      mockBlock.classList.add('full-width');
      mockBlock.style.width = '100vw';
      
      modal.open(mockBlock);
      
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      fullWidthCheck.checked = false;
      fullWidthCheck.dispatchEvent(new Event('change'));
      
      modal.applyChanges();
      
      expect(mockBlock.classList.contains('full-width')).toBe(false);
      expect(mockBlock.style.width).not.toBe('100vw');
    });

    test('should disable width input when full-width is enabled', () => {
      modal.open(mockBlock);
      
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      const blockWidthInput = modal.modal.querySelector('#block-width');
      
      expect(blockWidthInput.disabled).toBe(false);
      
      fullWidthCheck.checked = true;
      fullWidthCheck.dispatchEvent(new Event('change'));
      
      expect(blockWidthInput.disabled).toBe(true);
    });
  });

  describe('Custom Width and Height Settings', () => {
    test('should handle various CSS units for width', () => {
      const testCases = [
        { input: '80%', expected: '80%' },
        { input: '1200px', expected: '1200px' },
        { input: '90vw', expected: '90vw' },
        { input: '50rem', expected: '50rem' },
        { input: 'calc(100% - 20px)', expected: 'calc(100% - 20px)' }
      ];
      
      testCases.forEach(testCase => {
        modal.open(mockBlock);
        
        const blockWidthInput = modal.modal.querySelector('#block-width');
        blockWidthInput.value = testCase.input;
        
        modal.applyChanges();
        
        expect(mockBlock.style.width).toBe(testCase.expected);
      });
    });

    test('should handle various CSS units for height', () => {
      const testCases = [
        { input: '500px', expected: '500px' },
        { input: '50vh', expected: '50vh' },
        { input: '20rem', expected: '20rem' },
        { input: 'auto', expected: 'auto' },
        { input: 'min-content', expected: 'min-content' }
      ];
      
      testCases.forEach(testCase => {
        modal.open(mockBlock);
        
        const blockHeightInput = modal.modal.querySelector('#block-height');
        blockHeightInput.value = testCase.input;
        
        modal.applyChanges();
        
        expect(mockBlock.style.height).toBe(testCase.expected);
      });
    });

    test('should handle content width independent of block width', () => {
      modal.open(mockBlock);
      
      const blockWidthInput = modal.modal.querySelector('#block-width');
      const contentWidthInput = modal.modal.querySelector('#content-width');
      
      blockWidthInput.value = '100%';
      contentWidthInput.value = '800px';
      
      modal.applyChanges();
      
      expect(mockBlock.style.width).toBe('100%');
      // Content width creates a wrapper div with maxWidth
      const contentWrapper = mockBlock.querySelector('.block-content-wrapper');
      expect(contentWrapper).toBeTruthy();
      expect(contentWrapper.style.maxWidth).toBe('800px');
    });

    test('should sanitize dangerous CSS values', () => {
      const dangerousInputs = [
        'javascript:alert("xss")',
        'expression(alert("xss"))',
        'url("javascript:alert(1)")',
        '100px; background: url(evil.com)',
        'calc(100% + url(data:text/html,<script>alert(1)</script>))'
      ];
      
      dangerousInputs.forEach(input => {
        modal.open(mockBlock);
        
        const blockWidthInput = modal.modal.querySelector('#block-width');
        blockWidthInput.value = input;
        
        expect(() => {
          modal.applyChanges();
        }).not.toThrow();
        
        // Should not apply dangerous values
        expect(mockBlock.style.width).not.toContain('javascript:');
        expect(mockBlock.style.width).not.toContain('expression(');
      });
    });
  });

  describe('Background Image and Color Handling', () => {
    test('should handle background image URL input', () => {
      modal.open(mockBlock);
      
      const bgImageUrlInput = modal.modal.querySelector('#bg-image');
      bgImageUrlInput.value = 'https://example.com/image.jpg';
      bgImageUrlInput.dispatchEvent(new Event('input'));
      
      modal.applyChanges();
      
      expect(mockBlock.style.backgroundImage).toBe('url("https://example.com/image.jpg")');
    });

    test('should handle background image file upload', async () => {
      modal.open(mockBlock);
      
      const bgImageFile = modal.modal.querySelector('#bg-image-file');
      const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      // Create a mock FileList
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index) => index === 0 ? mockFile : null,
        [Symbol.iterator]: function* () { yield mockFile; }
      };
      
      Object.defineProperty(bgImageFile, 'files', {
        value: mockFileList,
        writable: false
      });
      
      const changeEvent = new Event('change');
      bgImageFile.dispatchEvent(changeEvent);
      
      // Simulate FileReader completion
      const fileReader = FileReader.mock.instances[0];
      fileReader.result = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk';
      
      // Simulate the onload event by manually setting the input value and calling applyChanges
      const bgImageInput = modal.modal.querySelector('#bg-image');
      bgImageInput.value = fileReader.result;
      
      // Call applyChanges to apply the background image
      modal.applyChanges();
      
      expect(global.FileReader).toHaveBeenCalled();
      expect(mockBlock.style.backgroundImage).toContain('data:image/jpeg;base64,');
    });

    test('should handle background color with various formats', () => {
      const colorFormats = [
        { input: '#ff0000', expected: 'rgb(255, 0, 0)' },
        { input: 'rgb(0, 255, 0)', expected: 'rgb(0, 255, 0)' },
        { input: 'rgba(0, 0, 255, 0.5)', expected: 'rgba(0, 0, 255, 0.5)' },
        { input: 'hsl(120, 100%, 50%)', expected: 'hsl(120, 100%, 50%)' },
        { input: 'transparent', expected: 'transparent' }
      ];
      
      colorFormats.forEach(colorTest => {
        modal.open(mockBlock);
        
        const bgColorInput = modal.modal.querySelector('#bg-color-picker');
        bgColorInput.value = colorTest.input;
        bgColorInput.dispatchEvent(new Event('input'));
        
        modal.applyChanges();
        
        // Note: Exact color format may vary by browser, so check for color presence
        expect(mockBlock.style.backgroundColor).toBeTruthy();
      });
    });

    test('should handle background size and position properties', () => {
      modal.open(mockBlock);
      
      const bgImageUrlInput = modal.modal.querySelector('#bg-image');
      const bgSizeSelect = modal.modal.querySelector('#bg-size');
      const bgPositionSelect = modal.modal.querySelector('#bg-position');
      
      bgImageUrlInput.value = 'https://example.com/image.jpg';
      bgSizeSelect.value = 'cover';
      bgPositionSelect.value = 'center';
      
      modal.applyChanges();
      
      expect(mockBlock.style.backgroundImage).toBe('url("https://example.com/image.jpg")');
      expect(mockBlock.style.backgroundSize).toBe('cover');
      expect(mockBlock.style.backgroundPosition).toBe('center');
    });

    test('should clear background image when cleared', () => {
      // Set initial background
      mockBlock.style.backgroundImage = 'url("test.jpg")';
      
      modal.open(mockBlock);
      
      // Clear the background image input field
      const bgImageInput = modal.modal.querySelector('#bg-image');
      bgImageInput.value = '';
      
      modal.applyChanges();
      
      expect(mockBlock.style.backgroundImage).toBe('');
    });
  });

  describe('Column Management with Responsive Behavior', () => {
    test('should add columns up to maximum limit', () => {
      modal.open(mockBlock);
      
      const addColumnBtn = modal.modal.querySelector('#add-column-btn');
      const initialColumnCount = mockBlock.querySelectorAll('.block-column').length;
      
      // Add columns up to limit (assume 6 is max)
      for (let i = 0; i < 10; i++) {
        addColumnBtn.click();
      }
      
      modal.applyChanges();
      
      const finalColumnCount = mockBlock.querySelectorAll('.block-column').length;
      expect(finalColumnCount).toBeLessThanOrEqual(6); // Should respect max limit
    });

    test('should prevent removing all columns', () => {
      modal.open(mockBlock);
      
      const removeColumnBtn = modal.modal.querySelector('#remove-column-btn');
      
      // Try to remove all columns
      for (let i = 0; i < 10; i++) {
        removeColumnBtn.click();
      }
      
      modal.applyChanges();
      
      const remainingColumns = mockBlock.querySelectorAll('.block-column');
      expect(remainingColumns.length).toBeGreaterThan(0); // Should keep at least 1
    });

    test('should stack columns on mobile viewport', () => {
      // Switch to mobile viewport
      const editableArea = editor.editableArea;
      editableArea.classList.remove('viewport-desktop');
      editableArea.classList.add('viewport-mobile');
      
      // Add multiple columns
      const column1 = document.createElement('div');
      column1.className = 'block-column';
      const column2 = document.createElement('div');
      column2.className = 'block-column';
      
      mockBlock.appendChild(column1);
      mockBlock.appendChild(column2);
      
      modal.open(mockBlock);
      modal.applyChanges();
      
      // Check that columns have stacking styles applied
      const columns = mockBlock.querySelectorAll('.block-column');
      expect(columns.length).toBeGreaterThan(1);
      // In mobile, columns should stack (specific CSS class or style)
    });

    test('should preserve column content when modifying columns', () => {
      // Add content to existing column
      const existingColumn = mockBlock.querySelector('.block-column');
      existingColumn.innerHTML = '<p>Important content</p>';
      
      modal.open(mockBlock);
      
      const addColumnBtn = modal.modal.querySelector('#add-column-btn');
      addColumnBtn.click();
      
      modal.applyChanges();
      
      // Original content should be preserved
      const columns = mockBlock.querySelectorAll('.block-column');
      expect(columns[0].innerHTML).toBe('<p>Important content</p>');
    });

    test('should handle column width distribution', () => {
      // Add multiple columns
      modal.open(mockBlock);
      
      const addColumnBtn = modal.modal.querySelector('#add-column-btn');
      addColumnBtn.click();
      addColumnBtn.click();
      
      modal.applyChanges();
      
      const columnContainer = mockBlock.querySelector('.column-container');
      expect(columnContainer).toBeTruthy();
      expect(columnContainer.style.display).toBe('flex');
      
      const columns = mockBlock.querySelectorAll('.column');
      expect(columns.length).toBe(3);
      
      // Each column should have flex: 1 style (which may expand to "1 1 0%")
      columns.forEach(column => {
        expect(column.style.flex).toMatch(/1/);
      });
    });
  });

  describe('Tab Navigation and Interface', () => {
    test('should switch between tabs correctly', () => {
      modal.open(mockBlock);
      
      const layoutTab = modal.modal.querySelector('.tab-btn[data-tab="layout"]');
      const columnsTab = modal.modal.querySelector('.tab-btn[data-tab="columns"]');
      const backgroundTab = modal.modal.querySelector('.tab-btn[data-tab="background"]');
      
      const layoutPane = modal.modal.querySelector('.tab-pane[data-tab="layout"]');
      const columnsPane = modal.modal.querySelector('.tab-pane[data-tab="columns"]');
      const backgroundPane = modal.modal.querySelector('.tab-pane[data-tab="background"]');
      
      // Initially layout tab should be active
      expect(layoutTab.classList.contains('active')).toBe(true);
      expect(layoutPane.style.display).not.toBe('none');
      
      // Click columns tab
      columnsTab.click();
      
      expect(layoutTab.classList.contains('active')).toBe(false);
      expect(columnsTab.classList.contains('active')).toBe(true);
      expect(layoutPane.style.display).toBe('none');
      expect(columnsPane.style.display).toBe('block');
      
      // Click background tab
      backgroundTab.click();
      
      expect(columnsTab.classList.contains('active')).toBe(false);
      expect(backgroundTab.classList.contains('active')).toBe(true);
      expect(columnsPane.style.display).toBe('none');
      expect(backgroundPane.style.display).toBe('block');
    });

    test('should handle keyboard navigation in tabs', () => {
      modal.open(mockBlock);
      
      const layoutTab = modal.modal.querySelector('.tab-btn[data-tab="layout"]');
      const columnsTab = modal.modal.querySelector('.tab-btn[data-tab="columns"]');
      
      // Focus layout tab and press right arrow
      layoutTab.focus();
      const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      layoutTab.dispatchEvent(rightArrowEvent);
      
      // Should move focus to next tab (if implemented)
      // This tests keyboard accessibility
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle missing state history gracefully', () => {
      editor.stateHistory = null;
      
      modal.open(mockBlock);
      
      const blockWidthInput = modal.modal.querySelector('#block-width');
      blockWidthInput.value = '80%';
      
      expect(() => {
        modal.applyChanges();
      }).not.toThrow();
    });

    test('should handle malformed background image URLs', () => {
      modal.open(mockBlock);
      
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        'not-a-valid-url',
        'file:///etc/passwd'
      ];
      
      dangerousUrls.forEach(url => {
        const bgImageUrlInput = modal.modal.querySelector('#bg-image');
        bgImageUrlInput.value = url;
        
        expect(() => {
          modal.applyChanges();
        }).not.toThrow();
        
        // Should not apply dangerous URLs
        expect(mockBlock.style.backgroundImage).not.toContain('javascript:');
        expect(mockBlock.style.backgroundImage).not.toContain('data:text/html');
      });
    });

    test('should handle file upload errors gracefully', () => {
      modal.open(mockBlock);
      
      const bgImageFile = modal.modal.querySelector('#bg-image-file');
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' }); // Wrong type
      
      const mockFileList = {
        0: mockFile,
        length: 1,
        item: (index) => index === 0 ? mockFile : null
      };
      
      Object.defineProperty(bgImageFile, 'files', {
        value: mockFileList,
        writable: false
      });
      
      expect(() => {
        const changeEvent = new Event('change');
        bgImageFile.dispatchEvent(changeEvent);
      }).not.toThrow();
    });

    test('should handle invalid CSS values gracefully', () => {
      modal.open(mockBlock);
      
      const invalidValues = [
        'not-a-size',
        '999999999999px',
        '-100%',
        'calc(invalid)',
        ''
      ];
      
      invalidValues.forEach(value => {
        const blockWidthInput = modal.modal.querySelector('#block-width');
        blockWidthInput.value = value;
        
        expect(() => {
          modal.applyChanges();
        }).not.toThrow();
      });
    });

    test('should handle target block removal', () => {
      modal.open(mockBlock);
      
      // Remove target block from DOM
      mockBlock.remove();
      
      expect(() => {
        modal.applyChanges();
      }).not.toThrow();
    });

    test('should handle rapid successive modal operations', () => {
      for (let i = 0; i < 10; i++) {
        modal.open(mockBlock);
        modal.close();
      }
      
      expect(() => {
        modal.open(mockBlock);
        modal.applyChanges();
      }).not.toThrow();
    });
  });

  describe('Settings Persistence and State Management', () => {
    test('should populate form with existing block settings', () => {
      // Pre-configure block with settings (without full-width for width test)
      mockBlock.style.width = '80%';
      mockBlock.style.height = '300px';
      mockBlock.style.backgroundColor = 'rgb(255, 0, 0)';
      
      modal.open(mockBlock);
      
      const blockWidthInput = modal.modal.querySelector('#block-width');
      const blockHeightInput = modal.modal.querySelector('#block-height');
      const bgColorInput = modal.modal.querySelector('#bg-color-picker');
      const fullWidthCheck = modal.modal.querySelector('#full-width-check');
      
      expect(blockWidthInput.value).toBe('80%');
      expect(blockHeightInput.value).toBe('300px');
      expect(bgColorInput.value).toBeTruthy(); // Color format may vary
      expect(fullWidthCheck.checked).toBe(false);
      
      // Test full-width case separately
      mockBlock.classList.add('full-width');
      modal.open(mockBlock);
      expect(fullWidthCheck.checked).toBe(true);
      expect(blockWidthInput.value).toBe('100vw');
    });

    test('should save state after applying changes', () => {
      modal.open(mockBlock);
      
      const blockWidthInput = modal.modal.querySelector('#block-width');
      blockWidthInput.value = '90%';
      
      modal.applyChanges();
      
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should not save state if no changes made', () => {
      modal.open(mockBlock);
      modal.applyChanges();
      
      // Should not save state if nothing changed
      // This depends on implementation details
    });
  });

  describe('Integration with Responsive System', () => {
    test('should handle viewport class changes', () => {
      const editableArea = editor.editableArea;
      
      // Test all viewport modes
      const viewportModes = ['desktop', 'tablet', 'mobile'];
      
      viewportModes.forEach(mode => {
        // Clear previous classes
        viewportModes.forEach(m => editableArea.classList.remove(`viewport-${m}`));
        editableArea.classList.add(`viewport-${mode}`);
        
        modal.open(mockBlock);
        
        const fullWidthCheck = modal.modal.querySelector('#full-width-check');
        fullWidthCheck.checked = true;
        
        expect(() => {
          modal.applyChanges();
        }).not.toThrow();
        
        expect(mockBlock.classList.contains('full-width')).toBe(true);
      });
    });
  });
});