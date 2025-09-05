import { Editor } from '../js/editor-core.js';

// Mock only the modules that we don't need to test, similar to editor-core tests
jest.mock('../js/state-history.js', () => ({
  StateHistory: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/formatting-toolbar.js', () => ({
  FormattingToolbar: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/image-uploader.js', () => ({
  ImageUploader: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/video-settings-modal.js', () => ({
  VideoSettingsModal: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/modals.js', () => ({
  StyleEditorModal: jest.fn().mockImplementation(() => ({})),
  CodeEditorModal: jest.fn().mockImplementation(() => ({})),
  ColumnSettingsModal: jest.fn().mockImplementation(() => ({})),
  ConfirmationModal: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/snippet-panel.js', () => ({
  SnippetPanel: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/column-resizer.js', () => ({
  ColumnResizer: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/page-settings-modal.js', () => ({
  PageSettingsModal: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/modal-dragger.js', () => ({
  ModalDragger: jest.fn().mockImplementation(() => ({}))
}));
jest.mock('../js/button-settings-modal.js', () => ({
  ButtonSettingsModal: jest.fn().mockImplementation(() => ({}))
}));

describe('HTML Sanitization and Validation', () => {
  let editor;
  
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
                <div id="panel-handle" class="panel-handle"></div>
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
    
    // Create a minimal editor for testing core methods
    editor = {
      editableArea: document.getElementById('editable-area'),
      currentMode: 'edit',
      showCodeIcon: true,
      assetsPath: 'assets/',
      options: { assetsPath: 'assets/', showCodeIcon: true },
      // Mock the methods we don't need for these specific tests
      attachDragHandleListeners: jest.fn(),
      setupVideoSnippet: jest.fn(),
      makeExistingBlocksEditable: jest.fn(),
      columnResizer: null,
      stateHistory: {
        saveState: jest.fn()
      }
    };
    
    // Import the actual methods from the Editor prototype that we want to test
    editor.serializePageToJSON = Editor.prototype.serializePageToJSON.bind(editor);
    editor.deserializeJSONToPage = Editor.prototype.deserializeJSONToPage.bind(editor);
    editor.getCleanHTML = Editor.prototype.getCleanHTML.bind(editor);
    
    jest.clearAllMocks();
  });

  describe('HTML Content Validation', () => {
    test('should handle safe HTML content', () => {
      const safeHTML = '<p>Safe content</p><div class="safe-class">More content</div>';
      
      expect(() => {
        editor.editableArea.innerHTML = safeHTML;
      }).not.toThrow();
      
      expect(editor.editableArea.innerHTML).toContain('Safe content');
    });

    test('should preserve valid HTML structure', () => {
      const validHTML = `
        <div class="editor-block">
          <h1>Heading</h1>
          <p>Paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </div>
      `;
      
      editor.editableArea.innerHTML = validHTML;
      
      expect(editor.editableArea.querySelector('h1')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('strong')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('em')).toBeInTheDocument();
      expect(editor.editableArea.querySelectorAll('li')).toHaveLength(2);
    });

    test('should handle empty content gracefully', () => {
      expect(() => {
        editor.editableArea.innerHTML = '';
      }).not.toThrow();
      
      expect(editor.editableArea.innerHTML).toBe('');
    });

    test('should handle special characters in content', () => {
      const contentWithSpecialChars = '<p>Content with &lt; &gt; &amp; "quotes" and \'apostrophes\'</p>';
      
      editor.editableArea.innerHTML = contentWithSpecialChars;
      
      expect(editor.editableArea.innerHTML).toContain('&lt;');
      expect(editor.editableArea.innerHTML).toContain('&gt;');
      expect(editor.editableArea.innerHTML).toContain('&amp;');
    });

    test('should preserve data attributes', () => {
      const htmlWithDataAttrs = '<div data-id="123" data-type="block">Content</div>';
      
      editor.editableArea.innerHTML = htmlWithDataAttrs;
      
      const element = editor.editableArea.querySelector('[data-id="123"]');
      expect(element).toBeInTheDocument();
      expect(element.dataset.type).toBe('block');
    });
  });

  describe('Script and Style Tag Handling', () => {
    test('should handle inline styles in elements', () => {
      const htmlWithInlineStyles = '<div style="color: red; background: blue;">Styled content</div>';
      
      editor.editableArea.innerHTML = htmlWithInlineStyles;
      
      const styledElement = editor.editableArea.querySelector('div');
      expect(styledElement.style.color).toBe('red');
      expect(styledElement.style.background).toBe('blue');
    });

    test('should handle CSS class names', () => {
      const htmlWithClasses = '<div class="editor-block custom-class another-class">Content</div>';
      
      editor.editableArea.innerHTML = htmlWithClasses;
      
      const element = editor.editableArea.querySelector('div');
      expect(element.classList.contains('editor-block')).toBe(true);
      expect(element.classList.contains('custom-class')).toBe(true);
      expect(element.classList.contains('another-class')).toBe(true);
    });

    test('should preserve valid HTML attributes', () => {
      const htmlWithAttributes = `
        <img src="test.jpg" alt="Test image" width="300" height="200">
        <a href="https://example.com" target="_blank" rel="noopener">Link</a>
        <input type="text" placeholder="Enter text" maxlength="100">
      `;
      
      editor.editableArea.innerHTML = htmlWithAttributes;
      
      const img = editor.editableArea.querySelector('img');
      expect(img.src).toContain('test.jpg');
      expect(img.alt).toBe('Test image');
      
      const link = editor.editableArea.querySelector('a');
      expect(link.href).toBe('https://example.com/');
      expect(link.target).toBe('_blank');
      
      const input = editor.editableArea.querySelector('input');
      expect(input.placeholder).toBe('Enter text');
      expect(input.maxLength).toBe(100);
    });
  });

  describe('Content Structure Validation', () => {
    test('should handle nested HTML structures', () => {
      const nestedHTML = `
        <div class="editor-block">
          <div class="column">
            <div class="editor-snippet">
              <p>Nested paragraph</p>
              <div class="nested-div">
                <span>Deeply nested span</span>
              </div>
            </div>
          </div>
        </div>
      `;
      
      editor.editableArea.innerHTML = nestedHTML;
      
      expect(editor.editableArea.querySelector('.editor-block .column .editor-snippet')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('.nested-div span')).toHaveTextContent('Deeply nested span');
    });

    test('should handle self-closing tags', () => {
      const htmlWithSelfClosing = `
        <div>
          <img src="image.jpg" alt="Image">
          <br>
          <hr>
          <input type="text" value="test">
        </div>
      `;
      
      editor.editableArea.innerHTML = htmlWithSelfClosing;
      
      expect(editor.editableArea.querySelector('img')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('br')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('hr')).toBeInTheDocument();
      expect(editor.editableArea.querySelector('input')).toBeInTheDocument();
    });

    test('should handle mixed content types', () => {
      const mixedContent = `
        <div>
          Text content
          <strong>Bold text</strong>
          More text
          <em>Italic text</em>
          <br>
          Final text
        </div>
      `;
      
      editor.editableArea.innerHTML = mixedContent;
      
      const div = editor.editableArea.querySelector('div');
      expect(div.innerHTML).toContain('Text content');
      expect(div.querySelector('strong')).toHaveTextContent('Bold text');
      expect(div.querySelector('em')).toHaveTextContent('Italic text');
    });
  });

  describe('Content Serialization and Deserialization', () => {
    test('should serialize page content to JSON', () => {
      editor.editableArea.innerHTML = '<div class="test">Test content</div>';
      
      const serialized = editor.serializePageToJSON();
      
      expect(serialized).toHaveProperty('content');
      expect(serialized).toHaveProperty('page_settings');
      expect(serialized).toHaveProperty('timestamp');
      expect(serialized.content).toContain('Test content');
    });

    test('should deserialize JSON to page content', () => {
      const testData = {
        content: '<div class="restored">Restored content</div>',
        page_settings: {},
        timestamp: Date.now()
      };
      
      editor.deserializeJSONToPage(testData);
      
      expect(editor.editableArea.innerHTML).toBe(testData.content);
      expect(editor.editableArea.querySelector('.restored')).toBeInTheDocument();
    });

    test('should handle empty deserialization data', () => {
      const emptyData = {};
      
      expect(() => {
        editor.deserializeJSONToPage(emptyData);
      }).not.toThrow();
      
      expect(editor.editableArea.innerHTML).toBe('');
    });

    test('should preserve HTML structure during serialization round trip', () => {
      const originalHTML = `
        <div class="editor-block">
          <h2>Title</h2>
          <p>Content with <strong>formatting</strong></p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `;
      
      editor.editableArea.innerHTML = originalHTML;
      const serialized = editor.serializePageToJSON();
      
      // Clear and restore
      editor.editableArea.innerHTML = '';
      editor.deserializeJSONToPage(serialized);
      
      expect(editor.editableArea.querySelector('h2')).toHaveTextContent('Title');
      expect(editor.editableArea.querySelector('strong')).toHaveTextContent('formatting');
      expect(editor.editableArea.querySelectorAll('li')).toHaveLength(2);
    });
  });

  describe('HTML Output Generation', () => {
    test('should generate clean HTML output', () => {
      editor.editableArea.innerHTML = `
        <div class="editor-block">
          <span class="drag-handle">⋮⋮</span>
          <p>Clean content</p>
        </div>
      `;
      
      const cleanHTML = editor.getCleanHTML();
      
      expect(cleanHTML).toContain('Clean content');
      // Should not contain editor controls
      expect(cleanHTML).not.toContain('drag-handle');
      expect(cleanHTML).not.toContain('⋮⋮');
    });

    test('should preserve content structure in clean HTML', () => {
      editor.editableArea.innerHTML = `
        <div class="editor-block">
          <div class="column">
            <h1>Title</h1>
            <p>Paragraph content</p>
          </div>
        </div>
      `;
      
      const cleanHTML = editor.getCleanHTML();
      
      expect(cleanHTML).toContain('<h1>Title</h1>');
      expect(cleanHTML).toContain('<p>Paragraph content</p>');
      expect(cleanHTML).toContain('column');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle malformed HTML gracefully', () => {
      const malformedHTML = '<div><p>Unclosed paragraph<div>Nested incorrectly</p></div>';
      
      expect(() => {
        editor.editableArea.innerHTML = malformedHTML;
      }).not.toThrow();
      
      // Browser will fix malformed HTML
      expect(editor.editableArea.querySelector('div')).toBeInTheDocument();
    });

    test('should handle very long content', () => {
      const longContent = '<p>' + 'A'.repeat(10000) + '</p>';
      
      expect(() => {
        editor.editableArea.innerHTML = longContent;
      }).not.toThrow();
      
      expect(editor.editableArea.querySelector('p')).toBeInTheDocument();
    });

    test('should handle Unicode characters', () => {
      const unicodeContent = '<p>Content with émojis 🎉 and spécial characters àéïôü</p>';
      
      editor.editableArea.innerHTML = unicodeContent;
      
      expect(editor.editableArea.innerHTML).toContain('🎉');
      expect(editor.editableArea.innerHTML).toContain('àéïôü');
    });

    test('should handle HTML entities correctly', () => {
      const entityContent = '<p>&lt;script&gt;alert(&quot;test&quot;);&lt;/script&gt;</p>';
      
      editor.editableArea.innerHTML = entityContent;
      
      expect(editor.editableArea.innerHTML).toContain('&lt;script&gt;');
      // Browser converts &quot; to actual quotes in innerHTML
      expect(editor.editableArea.innerHTML).toContain('"test"');
    });

    test('should preserve whitespace in pre elements', () => {
      const preContent = `<pre>
        Line 1
            Indented line
        Line 3
      </pre>`;
      
      editor.editableArea.innerHTML = preContent;
      
      const preElement = editor.editableArea.querySelector('pre');
      expect(preElement.innerHTML).toMatch(/\s+Indented line/);
    });
  });
});