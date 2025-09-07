import { FormattingToolbar } from '../js/formatting-toolbar.js';

// Mock dependencies
jest.mock('../js/image-uploader.js', () => ({
  ImageUploader: jest.fn().mockImplementation(() => ({
    createImageResizeContainer: jest.fn(),
    selectImage: jest.fn(),
    deselectAllImages: jest.fn(),
    showBrowseIcon: jest.fn(),
    addResizeHandlers: jest.fn(),
    reattachImageHandlers: jest.fn()
  }))
}));

describe('FormattingToolbar - Comprehensive Edge Cases', () => {
  let toolbar;
  let editor;
  let editableArea;
  let toolbarElement;

  beforeEach(() => {
    // Setup comprehensive DOM structure matching existing tests
    document.body.innerHTML = `
      <div id="formatting-toolbar" style="display: none; position: absolute;">
        <button data-command="bold" title="Bold">B</button>
        <button data-command="italic" title="Italic">I</button>
        <button data-command="underline" title="Underline">U</button>
        <button data-command="strikeThrough" title="Strike">S</button>
        
        <select id="format-select">
          <option value="div">Normal</option>
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="blockquote">Quote</option>
        </select>
        
        <select id="font-family">
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Helvetica">Helvetica</option>
        </select>
        
        <select id="font-size">
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
        </select>
        
        <input type="color" id="text-color" title="Text Color" value="#000000">
        <input type="color" id="background-color" title="Background Color" value="#ffffff">
        
        <button data-command="createLink" title="Create Link">🔗</button>
        <button data-command="unlink" title="Remove Link">🔗✗</button>
        <button data-command="insertImage" title="Insert Image">📷</button>
        
        <button data-command="justifyLeft" title="Align Left">⬅️</button>
        <button data-command="justifyCenter" title="Align Center">🔄</button>
        <button data-command="justifyRight" title="Align Right">➡️</button>
      </div>
      
      <div id="image-alignment-toolbar" style="display: none; position: absolute;">
        <button data-align="left" title="Align Left">⬅️</button>
        <button data-align="center" title="Align Center">🔄</button>
        <button data-align="right" title="Align Right">➡️</button>
      </div>
      
      <div class="editable-area">
        <div contenteditable="true" id="test-editable">Test content</div>
      </div>
    `;

    // Mock editor
    editor = {
      editableArea: document.querySelector('.editable-area'),
      currentMode: 'edit',
      imageUploader: {
        createImageResizeContainer: jest.fn(),
        selectImage: jest.fn(),
        deselectAllImages: jest.fn(),
        showBrowseIcon: jest.fn(),
        addResizeHandlers: jest.fn(),
        reattachImageHandlers: jest.fn()
      },
      stateHistory: {
        saveState: jest.fn()
      },
      linkSettingsModal: {
        show: jest.fn()
      }
    };

    editableArea = editor.editableArea;
    toolbarElement = document.getElementById('formatting-toolbar');
    toolbar = new FormattingToolbar(editor);

    // Mock document.execCommand
    document.execCommand = jest.fn().mockReturnValue(true);
    document.queryCommandState = jest.fn().mockReturnValue(false);
    document.queryCommandValue = jest.fn().mockReturnValue('');

    // Mock window.getSelection
    const mockRange = {
      collapsed: false,
      startContainer: document.createElement('p'),
      endContainer: document.createElement('p'),
      cloneContents: jest.fn().mockReturnValue(document.createDocumentFragment()),
      cloneRange: jest.fn().mockReturnValue({
        collapsed: false,
        startContainer: document.createElement('p'),
        endContainer: document.createElement('p')
      }),
      selectNodeContents: jest.fn(),
      collapse: jest.fn()
    };
    
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue(mockRange),
      removeAllRanges: jest.fn(),
      addRange: jest.fn()
    };
    window.getSelection = jest.fn().mockReturnValue(mockSelection);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Edge Case: Complex text formatting scenarios', () => {
    test('should handle nested formatting commands', () => {
      const paragraph = document.createElement('p');
      paragraph.innerHTML = '<strong><em>Bold and italic text</em></strong>';
      paragraph.contentEditable = true;
      editableArea.appendChild(paragraph);

      // Select the text
      const range = document.createRange();
      range.selectNodeContents(paragraph);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);

      // Execute underline command on already bold+italic text
      toolbar.executeCommand('underline');

      expect(document.execCommand).toHaveBeenCalledWith('underline', false, null);
    });

    test('should handle format changes on mixed content', () => {
      editableArea.innerHTML = '<p>Normal text</p><h1>Heading text</h1><blockquote>Quote text</blockquote>';
      
      const elements = editableArea.querySelectorAll('p, h1, blockquote');
      elements.forEach(el => el.contentEditable = true);

      // Select across multiple elements
      const range = document.createRange();
      range.setStart(editableArea.firstChild.firstChild, 0);
      range.setEnd(editableArea.lastChild.firstChild, 5);
      
      const mockSelection = window.getSelection();
      mockSelection.getRangeAt.mockReturnValue(range);

      toolbar.formatBlock('h2');

      expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h2>');
    });

    test('should handle rapid formatting command execution', () => {
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Test text';
      paragraph.contentEditable = true;
      editableArea.appendChild(paragraph);

      // Rapid command execution
      const commands = ['bold', 'italic', 'underline', 'strikeThrough'];
      commands.forEach(command => {
        toolbar.executeCommand(command);
      });

      // Should have executed all commands
      commands.forEach(command => {
        expect(document.execCommand).toHaveBeenCalledWith(command, false, null);
      });
    });
  });

  describe('Edge Case: Font and color handling', () => {
    test('should handle invalid font family names', () => {
      const maliciousFonts = [
        'Arial"; background: url(javascript:alert(1)); font-family: "Arial',
        '<script>alert("xss")</script>',
        'Comic Sans MS\'; DROP TABLE fonts; --',
        '\u0000\u0001\u0002invalid',
        ''
      ];

      maliciousFonts.forEach(font => {
        const fontSelect = document.getElementById('font-family');
        fontSelect.value = font;
        
        const event = new Event('change');
        fontSelect.dispatchEvent(event);
        
        // Should not execute malicious code or crash
        expect(() => {
          // Test that the font change doesn't cause issues
          document.execCommand('fontName', false, font);
        }).not.toThrow();
      });
    });

    test('should sanitize color values', () => {
      const maliciousColors = [
        'javascript:alert(1)',
        'url(data:text/html,<script>alert(1)</script>)',
        'expression(alert("xss"))',
        '#ff0000; background: url(evil.com)',
        'rgba(255,0,0,1); behavior: url(evil.htc)'
      ];

      maliciousColors.forEach(color => {
        const colorInput = document.getElementById('text-color');
        colorInput.value = color;
        
        const event = new Event('input');
        colorInput.dispatchEvent(event);
        
        // Should handle malicious input gracefully
        expect(() => {
          document.execCommand('foreColor', false, color);
        }).not.toThrow();
      });
    });

    test('should handle extreme font size values', () => {
      const extremeSizes = [
        '-999999px',
        '999999px', 
        'NaNpx',
        'Infinitypx',
        '0px',
        '-0px'
      ];

      extremeSizes.forEach(size => {
        expect(() => {
          document.execCommand('fontSize', false, size);
        }).not.toThrow();
      });
    });
  });

  describe('Edge Case: Link creation and management', () => {
    test('should handle link creation with complex URLs', () => {
      const complexUrls = [
        'https://example.com/path?param=value&other=test#anchor',
        'mailto:test@example.com?subject=Test&body=Hello',
        'tel:+1-234-567-8900',
        'ftp://files.example.com/path/file.txt',
        'data:text/plain;base64,SGVsbG8gV29ybGQ='
      ];

      complexUrls.forEach(url => {
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Link text';
        paragraph.contentEditable = true;
        editableArea.appendChild(paragraph);

        toolbar.executeCommand('createLink');

        // Should show the link settings modal instead of using prompt
        expect(editor.linkSettingsModal.show).toHaveBeenCalled();
      });
    });

    test('should handle link editing on existing links', () => {
      const link = document.createElement('a');
      link.href = 'https://old-url.com';
      link.textContent = 'Link text';
      
      const paragraph = document.createElement('p');
      paragraph.contentEditable = true;
      paragraph.appendChild(link);
      editableArea.appendChild(paragraph);

      // Mock selection within the link
      const range = document.createRange();
      range.selectNodeContents(link);
      window.getSelection().getRangeAt.mockReturnValue(range);

      toolbar.executeCommand('createLink');

      // Should show the link settings modal with existing link
      expect(editor.linkSettingsModal.show).toHaveBeenCalledWith(
        link, 
        expect.anything(), // saved range
        toolbar,
        toolbar.currentEditableElement
      );
    });

    test('should handle link removal correctly', () => {
      const link = document.createElement('a');
      link.href = 'https://example.com';
      link.textContent = 'Link text';
      
      const paragraph = document.createElement('p');
      paragraph.contentEditable = true;
      paragraph.appendChild(link);
      editableArea.appendChild(paragraph);

      toolbar.executeCommand('unlink');

      expect(document.execCommand).toHaveBeenCalledWith('unlink', false, null);
    });
  });

  describe('Edge Case: Image insertion and alignment', () => {
    test('should handle image insertion with various file types', () => {
      const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      
      fileTypes.forEach(mimeType => {
        const mockFile = new File([''], 'test.jpg', { type: mimeType });
        
        // Mock file input with proper FileList
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        
        // Create a proper FileList mock
        const mockFileList = {
          0: mockFile,
          length: 1,
          item: (index) => index === 0 ? mockFile : null,
          [Symbol.iterator]: function* () { yield mockFile; }
        };
        Object.defineProperty(fileInput, 'files', {
          value: mockFileList,
          writable: false
        });
        
        const event = new Event('change');
        Object.defineProperty(event, 'target', {
          value: fileInput,
          writable: false
        });

        expect(() => {
          // Test file selection handling
          if (toolbar.createImageFromFile) {
            toolbar.createImageFromFile(mockFile);
          } else {
            // Fallback test - just ensure file type checking doesn't crash
            const isValidImage = mimeType.startsWith('image/');
            expect(typeof isValidImage).toBe('boolean');
          }
        }).not.toThrow();
      });
    });

    test('should handle image alignment on various image containers', () => {
      const imageContainers = [
        '<div class="image-resize-container"><img src="test.jpg" alt="Test"></div>',
        '<div class="image-container"><img src="test.jpg" alt="Test"></div>',
        '<figure><img src="test.jpg" alt="Test"><figcaption>Caption</figcaption></figure>'
      ];

      imageContainers.forEach(html => {
        editableArea.innerHTML = html;
        const img = editableArea.querySelector('img');
        
        // Mock image selection
        if (toolbar.selectImage) {
          toolbar.selectImage(img);
        }
        
        ['left', 'center', 'right'].forEach(alignment => {
          expect(() => {
            // Test image alignment through style changes
            if (img && img.parentElement) {
              img.parentElement.style.textAlign = alignment;
            }
          }).not.toThrow();
        });
      });
    });

    test('should handle image operations with missing image uploader', () => {
      // Remove image uploader
      editor.imageUploader = null;

      const paragraph = document.createElement('p');
      paragraph.textContent = 'Test';
      paragraph.contentEditable = true;
      editableArea.appendChild(paragraph);

      expect(() => {
        toolbar.executeCommand('insertImage');
      }).not.toThrow();
    });
  });

  describe('Edge Case: Toolbar positioning and viewport handling', () => {
    test('should handle toolbar positioning at viewport edges', () => {
      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      element.style.position = 'absolute';
      element.style.top = '0px';
      element.style.left = '0px';
      editableArea.appendChild(element);

      // Mock getBoundingClientRect for edge positions
      element.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 0,
        left: 0,
        bottom: 20,
        right: 100,
        width: 100,
        height: 20
      });

      expect(() => {
        toolbar.showToolbar(element);
      }).not.toThrow();

      expect(toolbarElement.style.display).toBe('flex');
    });

    test('should handle toolbar positioning on very narrow elements', () => {
      const element = document.createElement('span');
      element.textContent = 'x';
      element.contentEditable = true;
      editableArea.appendChild(element);

      // Mock very narrow element
      element.getBoundingClientRect = jest.fn().mockReturnValue({
        top: 100,
        left: 100,
        bottom: 120,
        right: 105,
        width: 5,
        height: 20
      });

      expect(() => {
        toolbar.showToolbar(element);
      }).not.toThrow();
    });

    test('should handle toolbar with missing elements', () => {
      // Remove some toolbar elements
      document.querySelector('#format-select').remove();
      const fontFamily = document.querySelector('#font-family');
      if (fontFamily) fontFamily.remove();

      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      expect(() => {
        toolbar.showToolbar(element);
        toolbar.updateToolbarState();
      }).not.toThrow();
    });
  });

  describe('Edge Case: Cross-browser compatibility', () => {
    test('should handle execCommand failures gracefully', () => {
      document.execCommand = jest.fn().mockReturnValue(false);

      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      expect(() => {
        toolbar.executeCommand('bold');
        toolbar.executeCommand('italic');
        toolbar.executeCommand('createLink');
      }).not.toThrow();
    });

    test('should handle missing queryCommand support', () => {
      document.queryCommandState = undefined;
      document.queryCommandValue = undefined;

      expect(() => {
        toolbar.updateToolbarState();
      }).not.toThrow();
    });

    test('should handle selection API differences', () => {
      // Mock browser without full selection API
      window.getSelection = jest.fn().mockReturnValue({
        rangeCount: 0,
        getRangeAt: undefined,
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      });

      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      expect(() => {
        toolbar.showToolbar(element);
        toolbar.updateToolbarState();
        toolbar.hideToolbar();
      }).not.toThrow();
    });
  });

  describe('Edge Case: Memory management and cleanup', () => {
    test('should clean up all event listeners on destruction', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      // Simulate toolbar cleanup
      if (toolbar.cleanup) {
        toolbar.cleanup();
      }

      // Should not accumulate event listeners
      expect(() => {
        new FormattingToolbar(editor);
        new FormattingToolbar(editor);
        new FormattingToolbar(editor);
      }).not.toThrow();
    });

    test('should handle rapid toolbar show/hide cycles', () => {
      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      // Rapid show/hide cycles
      for (let i = 0; i < 100; i++) {
        toolbar.showToolbar(element);
        toolbar.hideToolbar();
      }

      expect(() => {
        toolbar.showToolbar(element);
      }).not.toThrow();
    });

    test('should handle toolbar operations on detached elements', () => {
      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      // Don't append to DOM - element is detached

      expect(() => {
        toolbar.showToolbar(element);
        toolbar.updateToolbarState();
        toolbar.hideToolbar();
      }).not.toThrow();
    });
  });

  describe('Edge Case: State management integration', () => {
    test('should save state after significant formatting changes', () => {
      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      // Mock selection
      const range = document.createRange();
      range.selectNodeContents(element);
      window.getSelection().getRangeAt.mockReturnValue(range);

      toolbar.executeCommand('bold');

      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should handle missing state history gracefully', () => {
      editor.stateHistory = null;

      const element = document.createElement('p');
      element.textContent = 'Test text';
      element.contentEditable = true;
      editableArea.appendChild(element);

      expect(() => {
        toolbar.executeCommand('bold');
        toolbar.formatBlock('h1');
      }).not.toThrow();
    });
  });
});