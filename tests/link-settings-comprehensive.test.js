import { LinkSettingsModal } from '../js/modals.js';
import { Utilities } from '../js/utilities.js';

describe('LinkSettingsModal - Comprehensive Tests', () => {
  let modal;
  let editor;
  let mockFormattingToolbar;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div class="editable-area">
        <div contenteditable="true" id="test-editable">
          <p>Some text with <a href="https://example.com" id="existing-link">existing link</a> here.</p>
          <p>Text without links</p>
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

    // Mock formatting toolbar
    mockFormattingToolbar = {
      restoreSelection: jest.fn(),
      currentEditableElement: document.getElementById('test-editable')
    };

    modal = new LinkSettingsModal(editor);

    // Mock window.alert
    window.alert = jest.fn();

    // Mock document.execCommand
    document.execCommand = jest.fn().mockReturnValue(true);

    // Mock window.getSelection
    const mockSelection = {
      rangeCount: 1,
      getRangeAt: jest.fn().mockReturnValue({
        createContextualFragment: jest.fn().mockReturnValue({
          firstChild: document.createElement('a')
        }),
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        collapse: jest.fn()
      }),
      removeAllRanges: jest.fn(),
      addRange: jest.fn()
    };
    window.getSelection = jest.fn().mockReturnValue(mockSelection);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('Modal Creation and Structure', () => {
    test('should create modal with correct structure', () => {
      expect(modal.modal).toBeTruthy();
      expect(modal.modal.className).toBe('modal');
      
      // Check for required elements
      expect(modal.modal.querySelector('.modal-header h2').textContent).toBe('Link Settings');
      expect(modal.modal.querySelector('#link-url')).toBeTruthy();
      expect(modal.modal.querySelector('#link-new-window')).toBeTruthy();
      expect(modal.modal.querySelector('.modal-apply')).toBeTruthy();
      expect(modal.modal.querySelector('.modal-cancel')).toBeTruthy();
      expect(modal.modal.querySelector('.modal-remove')).toBeTruthy();
      expect(modal.modal.querySelector('.modal-close')).toBeTruthy();
    });

    test('should append modal to document body', () => {
      expect(document.body.contains(modal.modal)).toBe(true);
    });

    test('should attach event listeners correctly', () => {
      const closeBtn = modal.modal.querySelector('.modal-close');
      const cancelBtn = modal.modal.querySelector('.modal-cancel');
      const applyBtn = modal.modal.querySelector('.modal-apply');
      const removeBtn = modal.modal.querySelector('.modal-remove');

      expect(closeBtn).toBeTruthy();
      expect(cancelBtn).toBeTruthy();
      expect(applyBtn).toBeTruthy();
      expect(removeBtn).toBeTruthy();
    });
  });

  describe('Showing Modal for Existing Links', () => {
    test('should populate form with existing link data', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      
      expect(urlInput.value).toBe('https://example.com/');
      expect(newWindowCheckbox.checked).toBe(false);
      expect(modal.modal.style.display).toBe('flex');
    });

    test('should show remove button for existing links', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const removeBtn = modal.modal.querySelector('.modal-remove');
      const footer = modal.modal.querySelector('.modal-footer');
      
      expect(removeBtn.style.display).toBe('inline-block');
      expect(footer.style.justifyContent).toBe('space-between');
    });

    test('should handle links with target="_blank"', () => {
      const existingLink = document.getElementById('existing-link');
      existingLink.target = '_blank';
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      expect(newWindowCheckbox.checked).toBe(true);
    });

    test('should handle links with missing href attribute', () => {
      const existingLink = document.getElementById('existing-link');
      existingLink.removeAttribute('href');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      expect(urlInput.value).toBe('');
    });
  });

  describe('Showing Modal for New Links', () => {
    test('should show modal for new link creation', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      const removeBtn = modal.modal.querySelector('.modal-remove');
      const footer = modal.modal.querySelector('.modal-footer');
      
      expect(urlInput.value).toBe('');
      expect(newWindowCheckbox.checked).toBe(false);
      expect(removeBtn.style.display).toBe('none');
      expect(footer.style.justifyContent).toBe('flex-end');
      expect(modal.modal.style.display).toBe('flex');
    });

    test('should store formatting toolbar reference', () => {
      const mockRange = { collapsed: false };
      
      modal.show(null, mockRange, mockFormattingToolbar, document.getElementById('test-editable'));
      
      expect(modal.savedRange).toBe(mockRange);
      expect(modal.formattingToolbar).toBe(mockFormattingToolbar);
      expect(modal.currentEditableElement).toBe(document.getElementById('test-editable'));
    });
  });

  describe('URL Validation and Sanitization', () => {
    test('should validate basic HTTP URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://sub.example.com/path',
        'https://example.com/path?query=value#anchor'
      ];

      validUrls.forEach(url => {
        expect(() => {
          const sanitized = Utilities.Validation.sanitizeURL(url);
          expect(typeof sanitized).toBe('string');
        }).not.toThrow();
      });
    });

    test('should handle special protocol URLs', () => {
      const specialUrls = [
        'mailto:test@example.com',
        'tel:+1234567890',
        'ftp://files.example.com'
      ];

      specialUrls.forEach(url => {
        expect(() => {
          Utilities.Validation.sanitizeURL(url);
        }).not.toThrow();
      });
    });

    test('should reject dangerous URLs', () => {
      const dangerousUrls = [
        'javascript:alert("xss")',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("xss")',
        'file:///etc/passwd'
      ];

      dangerousUrls.forEach(url => {
        expect(() => {
          const sanitized = Utilities.Validation.sanitizeURL(url);
          expect(sanitized).toBeFalsy();
        }).not.toThrow();
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const malformedUrls = [
        'not-a-url',
        'http://',
        'https://',
        '://invalid',
        ''
      ];

      malformedUrls.forEach(url => {
        expect(() => {
          Utilities.Validation.sanitizeURL(url);
        }).not.toThrow();
      });
    });
  });

  describe('Link Creation', () => {
    test('should create new link with valid URL', () => {
      // Provide saved range and editable element to trigger full selection restoration
      const testElement = document.getElementById('test-editable');
      const mockRange = {
        collapsed: false,
        commonAncestorContainer: {
          nodeType: Node.ELEMENT_NODE,
          querySelector: jest.fn().mockReturnValue(null) // No existing link found
        }
      };
      
      modal.show(null, mockRange, mockFormattingToolbar, testElement);
      
      const urlInput = modal.modal.querySelector('#link-url');
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      
      urlInput.value = 'https://newlink.com';
      newWindowCheckbox.checked = false; // Test without target="_blank" first
      
      modal.apply();
      
      // Should restore selection and create link
      expect(window.getSelection().removeAllRanges).toHaveBeenCalled();
      expect(window.getSelection().addRange).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://newlink.com');
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should reject empty URL', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = '';
      
      modal.apply();
      
      expect(window.alert).toHaveBeenCalledWith('Please enter a URL');
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    test('should reject dangerous URL', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'javascript:alert("xss")';
      
      modal.apply();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid or dangerous URL. Please enter a valid URL.');
      expect(document.execCommand).not.toHaveBeenCalled();
    });

    test('should handle new link with target="_blank"', () => {
      // Create a mock link element that will be found by the LinkSettingsModal
      const mockLink = document.createElement('a');
      mockLink.href = 'https://newlink.com';
      mockLink.textContent = 'test link';
      
      const testElement = document.getElementById('test-editable');
      testElement.appendChild(mockLink);
      
      // Create proper mock range structure that the LinkSettingsModal expects
      const mockContainer = {
        nodeType: Node.ELEMENT_NODE,
        querySelector: jest.fn().mockReturnValue(mockLink) // Return the mock link
      };
      
      const mockRange = {
        collapsed: false,
        commonAncestorContainer: mockContainer
      };
      
      // Mock the current selection after execCommand to return the range containing the link
      const currentSelectionRange = {
        commonAncestorContainer: mockContainer
      };
      
      const currentSelection = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(currentSelectionRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };
      
      // Override getSelection to return proper mocks for all calls
      const originalGetSelection = window.getSelection;
      const selectionRestorationMock = {
        rangeCount: 1,
        getRangeAt: jest.fn().mockReturnValue(mockRange),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };
      
      let callCount = 0;
      window.getSelection = jest.fn(() => {
        callCount++;
        if (callCount <= 2) {
          // First two calls for selection restoration - return proper mock
          return selectionRestorationMock;
        } else {
          // Third call for finding the newly created link
          return currentSelection;
        }
      });
      
      modal.show(null, mockRange, mockFormattingToolbar, testElement);
      
      const urlInput = modal.modal.querySelector('#link-url');
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      
      urlInput.value = 'https://newlink.com';
      newWindowCheckbox.checked = true;
      
      modal.apply();
      
      expect(mockLink.target).toBe('_blank');
      expect(mockLink.getAttribute('target')).toBe('_blank');
      
      // Restore original getSelection
      window.getSelection = originalGetSelection;
    });
  });

  describe('Link Editing', () => {
    test('should update existing link URL', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://updated.com';
      
      modal.apply();
      
      expect(existingLink.href).toBe('https://updated.com/');
      expect(existingLink.getAttribute('href')).toBe('https://updated.com');
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should update target attribute', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      newWindowCheckbox.checked = true;
      
      modal.apply();
      
      expect(existingLink.target).toBe('_blank');
    });

    test('should remove target attribute when unchecked', () => {
      const existingLink = document.getElementById('existing-link');
      existingLink.target = '_blank';
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const newWindowCheckbox = modal.modal.querySelector('#link-new-window');
      newWindowCheckbox.checked = false;
      
      modal.apply();
      
      expect(existingLink.hasAttribute('target')).toBe(false);
    });

    test('should reject invalid URL for existing link', () => {
      const existingLink = document.getElementById('existing-link');
      const originalHref = existingLink.href;
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'javascript:alert("xss")';
      
      modal.apply();
      
      expect(window.alert).toHaveBeenCalledWith('Invalid or dangerous URL. Please enter a valid URL.');
      expect(existingLink.href).toBe(originalHref); // Should remain unchanged
    });
  });

  describe('Link Removal', () => {
    test('should remove existing link', () => {
      const existingLink = document.getElementById('existing-link');
      const parentElement = existingLink.parentElement;
      const originalText = existingLink.textContent;
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      modal.removeLink();
      
      // Should have removed the link element and preserved text
      expect(parentElement.querySelector('#existing-link')).toBeNull();
      expect(parentElement.textContent).toContain(originalText);
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
      expect(modal.modal.style.display).toBe('none');
    });

    test('should handle missing formatting toolbar gracefully', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, null);
      
      expect(() => {
        modal.removeLink();
      }).not.toThrow();
    });
  });

  describe('Modal Interaction', () => {
    test('should close modal on cancel button click', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const cancelBtn = modal.modal.querySelector('.modal-cancel');
      cancelBtn.click();
      
      expect(modal.modal.style.display).toBe('none');
    });

    test('should close modal on close button click', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const closeBtn = modal.modal.querySelector('.modal-close');
      closeBtn.click();
      
      expect(modal.modal.style.display).toBe('none');
    });

    test('should close modal on background click', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', {
        value: modal.modal,
        writable: false
      });
      
      modal.modal.dispatchEvent(event);
      
      expect(modal.modal.style.display).toBe('none');
    });

    test('should not close modal on content click', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const modalContent = modal.modal.querySelector('.modal-content');
      const event = new MouseEvent('click');
      Object.defineProperty(event, 'target', {
        value: modalContent,
        writable: false
      });
      
      modal.modal.dispatchEvent(event);
      
      expect(modal.modal.style.display).toBe('flex');
    });

    test('should close modal on Escape key', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      expect(modal.modal.style.display).toBe('none');
    });

    test('should not close modal on other keys', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
      
      expect(modal.modal.style.display).toBe('flex');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle missing state history gracefully', () => {
      editor.stateHistory = null;
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://updated.com';
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });

    test('should handle execCommand failure gracefully', () => {
      document.execCommand = jest.fn().mockReturnValue(false);
      
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://newlink.com';
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });

    test('should handle missing range gracefully', () => {
      window.getSelection = jest.fn().mockReturnValue({
        rangeCount: 0,
        getRangeAt: jest.fn(),
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      });
      
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://newlink.com';
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });

    test('should handle malformed DOM structure', () => {
      // Remove required form elements
      modal.modal.querySelector('#link-url').remove();
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });

    test('should handle whitespace-only URLs', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = '   \n\t   ';
      
      modal.apply();
      
      expect(window.alert).toHaveBeenCalledWith('Please enter a URL');
    });

    test('should handle very long URLs', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      urlInput.value = longUrl;
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });

    test('should handle international domain names', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://тест.рф';
      
      expect(() => {
        modal.apply();
      }).not.toThrow();
    });
  });

  describe('State Management Integration', () => {
    test('should save state after successful link creation', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://newlink.com';
      
      modal.apply();
      
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should save state after successful link update', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = 'https://updated.com';
      
      modal.apply();
      
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should save state after link removal', () => {
      const existingLink = document.getElementById('existing-link');
      
      modal.show(existingLink, null, mockFormattingToolbar);
      
      modal.removeLink();
      
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should not save state on validation failure', () => {
      modal.show(null, null, mockFormattingToolbar);
      
      const urlInput = modal.modal.querySelector('#link-url');
      urlInput.value = '';
      
      modal.apply();
      
      expect(editor.stateHistory.saveState).not.toHaveBeenCalled();
    });
  });
});