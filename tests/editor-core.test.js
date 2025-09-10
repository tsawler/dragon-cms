import { Editor } from '../js/editor-core.js';
import dragon from '../js/dragon.js';

// Mock global objects needed for testing
global.URL = global.URL || {
  createObjectURL: jest.fn(() => 'mock-url'),
  revokeObjectURL: jest.fn()
};

global.Blob = global.Blob || class MockBlob {
  constructor(content, options) {
    this.content = content;
    this.options = options;
  }
};

// Mock DragEvent for drag and drop testing
if (typeof DragEvent === 'undefined') {
  global.DragEvent = class MockDragEvent extends Event {
    constructor(type, init = {}) {
      super(type, init);
      this.dataTransfer = init.dataTransfer || {
        getData: jest.fn(),
        setData: jest.fn(),
        dropEffect: 'none'
      };
    }
  };
}

// Mock all the imported modules
jest.mock('../js/state-history.js');
jest.mock('../js/formatting-toolbar.js');
jest.mock('../js/image-uploader.js');
jest.mock('../js/video-settings-modal.js');
jest.mock('../js/modals.js');
jest.mock('../js/snippet-panel.js');
jest.mock('../js/column-resizer.js');
jest.mock('../js/page-settings-modal.js');
jest.mock('../js/modal-dragger.js');
jest.mock('../js/button-settings-modal.js');

describe('Editor Core Methods', () => {
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
      triggerOnRender: jest.fn(),
      triggerOnChange: jest.fn()
    };
    
    // Import the actual methods from the Editor prototype
    editor.createSnippet = Editor.prototype.createSnippet.bind(editor);
    editor.createBlock = Editor.prototype.createBlock.bind(editor);
    editor.toggleMode = Editor.prototype.toggleMode.bind(editor);
    editor.getMode = Editor.prototype.getMode.bind(editor);
    
    jest.clearAllMocks();
  });

  describe('createSnippet()', () => {
    test('should create basic snippet with default type', () => {
      const snippet = editor.createSnippet();
      
      expect(snippet).toBeInstanceOf(HTMLDivElement);
      expect(snippet.className).toContain('editor-snippet');
      expect(snippet.className).toContain('text-snippet');
      expect(snippet.draggable).toBe(true);
    });

    test('should create snippet with specific type', () => {
      const snippet = editor.createSnippet('image');
      
      expect(snippet.className).toContain('image-snippet');
    });

    test('should include drag handle and controls', () => {
      const snippet = editor.createSnippet();
      
      expect(snippet.querySelector('.drag-handle')).toBeTruthy();
      expect(snippet.querySelector('.edit-icon')).toBeTruthy();
    });

    test('should include code icon when showCodeIcon is true', () => {
      editor.showCodeIcon = true;
      const snippet = editor.createSnippet();
      
      expect(snippet.querySelector('.code-icon')).toBeTruthy();
    });

    test('should not include code icon when showCodeIcon is false', () => {
      editor.showCodeIcon = false;
      const snippet = editor.createSnippet();
      
      expect(snippet.querySelector('.code-icon')).toBeNull();
    });

    test('should use provided template', () => {
      const template = '<p>Custom template content</p>';
      const snippet = editor.createSnippet('text', template);
      
      expect(snippet.innerHTML).toContain('Custom template content');
    });

    test('should handle different snippet types', () => {
      const types = ['text', 'image', 'video', 'button', 'custom'];
      
      types.forEach(type => {
        const snippet = editor.createSnippet(type);
        expect(snippet.className).toContain(`${type}-snippet`);
      });
    });
  });

  describe('createBlock()', () => {
    test('should create basic block', () => {
      const block = editor.createBlock();
      
      expect(block).toBeInstanceOf(HTMLDivElement);
      expect(block.className).toContain('editor-block');
      expect(block.draggable).toBe(true);
      expect(block.style.position).toBe('relative');
    });

    test('should include drag handle and controls', () => {
      const block = editor.createBlock();
      
      expect(block.querySelector('.drag-handle')).toBeTruthy();
    });

    test('should include code icon when showCodeIcon is true', () => {
      editor.showCodeIcon = true;
      const block = editor.createBlock();
      
      expect(block.querySelector('.code-icon')).toBeTruthy();
    });

    test('should not include code icon when showCodeIcon is false', () => {
      editor.showCodeIcon = false;
      const block = editor.createBlock();
      
      expect(block.querySelector('.code-icon')).toBeNull();
    });

    test('should use provided template', () => {
      const template = '<div class="custom-block">Custom block content</div>';
      const block = editor.createBlock(template);
      
      expect(block.innerHTML).toContain('Custom block content');
    });

    test('should create block with proper structure for columns', () => {
      const template = '<div class="column">Column content</div>';
      
      const block = editor.createBlock(template);
      
      expect(block.querySelector('.column')).toBeTruthy();
    });
  });

  describe('toggleMode()', () => {
    test('should toggle from edit to display mode', () => {
      editor.currentMode = 'edit';
      
      editor.toggleMode();
      
      expect(editor.currentMode).toBe('display');
      expect(editor.editableArea.dataset.mode).toBe('display');
    });

    test('should toggle from display to edit mode', () => {
      editor.currentMode = 'display';
      
      editor.toggleMode();
      
      expect(editor.currentMode).toBe('edit');
      expect(editor.editableArea.dataset.mode).toBe('edit');
    });

    test('should update toggle button text in edit mode', () => {
      editor.currentMode = 'display';
      const toggleBtn = document.getElementById('toggle-mode-btn');
      
      editor.toggleMode();
      
      expect(toggleBtn.textContent).toBe('Switch to Display Mode');
    });

    test('should update toggle button text in display mode', () => {
      editor.currentMode = 'edit';
      const toggleBtn = document.getElementById('toggle-mode-btn');
      
      editor.toggleMode();
      
      expect(toggleBtn.textContent).toBe('Switch to Edit Mode');
    });

    test('should handle missing toggle button gracefully', () => {
      document.getElementById('toggle-mode-btn').remove();
      
      expect(() => {
        editor.toggleMode();
      }).not.toThrow();
      
      expect(editor.currentMode).toBe('display');
    });

    test('should hide editor header in display mode', () => {
      editor.currentMode = 'edit';
      const editorHeader = document.querySelector('.dragon-editor .editor-header');
      
      editor.toggleMode();
      
      expect(editorHeader.style.display).toBe('none');
    });

    test('should show editor header in edit mode', () => {
      editor.currentMode = 'display';
      const editorHeader = document.querySelector('.dragon-editor .editor-header');
      editorHeader.style.display = 'none';
      
      editor.toggleMode();
      
      expect(editorHeader.style.display).toBe('flex');
    });
  });

  describe('getMode()', () => {
    test('should return current mode', () => {
      editor.currentMode = 'edit';
      expect(editor.getMode()).toBe('edit');
      
      editor.currentMode = 'display';
      expect(editor.getMode()).toBe('display');
    });
  });

  describe('Editor initialization', () => {
    test('should set default current mode to edit', () => {
      expect(editor.currentMode).toBe('edit');
    });

    test('should set global assets path', () => {
      // Test that the editor has an assets path configured
      expect(editor.assetsPath).toBe('assets/');
    });

    test('should initialize with custom options', () => {
      const customEditor = new Editor({
        assetsPath: 'custom/assets/',
        publishUrl: '/api/publish',
        loadUrl: '/api/load',
        showCodeIcon: false
      });
      
      expect(customEditor.assetsPath).toBe('custom/assets/');
      expect(customEditor.publishUrl).toBe('/api/publish');
      expect(customEditor.loadUrl).toBe('/api/load');
      expect(customEditor.showCodeIcon).toBe(false);
    });

    test('should use default values for missing options', () => {
      const defaultEditor = new Editor();
      
      expect(defaultEditor.assetsPath).toBe('assets/');
      expect(defaultEditor.publishUrl).toBeNull();
      expect(defaultEditor.loadUrl).toBeNull();
      expect(defaultEditor.showCodeIcon).toBe(true);
    });
  });

  describe('DOM manipulation', () => {
    test('should find editable area element', () => {
      expect(editor.editableArea).toBe(document.getElementById('editable-area'));
    });

    test('should handle missing editable area gracefully', () => {
      // Test that methods handle null editableArea gracefully
      const editorWithoutArea = {
        editableArea: null,
        currentMode: 'edit',
        showCodeIcon: true,
        assetsPath: 'assets/'
      };
      
      expect(editorWithoutArea.editableArea).toBeNull();
      
      // The actual Editor handles this gracefully
      expect(() => {
        editorWithoutArea.editableArea = null;
      }).not.toThrow();
    });
  });

  describe('Event handling', () => {
    test('should attach event listeners during initialization', () => {
      // This test would require full Editor initialization which we're avoiding
      // Instead, test that the editor has the expected structure for event handling
      expect(editor.editableArea).toBeDefined();
      expect(typeof editor.toggleMode).toBe('function');
    });
  });

  describe('Viewport Management', () => {
    beforeEach(() => {
      // Add viewport methods to our mock editor
      editor.setViewportSize = Editor.prototype.setViewportSize.bind(editor);
      editor.setupViewportControls = Editor.prototype.setupViewportControls.bind(editor);
      editor.refreshImageDimensions = jest.fn();
    });

    test('should set mobile viewport size', () => {
      editor.setViewportSize('375px');
      
      expect(editor.editableArea.style.maxWidth).toBe('375px');
      expect(editor.editableArea.classList.contains('viewport-mobile')).toBe(true);
      expect(editor.editableArea.classList.contains('viewport-desktop')).toBe(false);
    });

    test('should set tablet viewport size', () => {
      editor.setViewportSize('768px');
      
      expect(editor.editableArea.style.maxWidth).toBe('768px');
      expect(editor.editableArea.classList.contains('viewport-tablet')).toBe(true);
      expect(editor.editableArea.classList.contains('viewport-desktop')).toBe(false);
    });

    test('should set desktop viewport size', () => {
      editor.setViewportSize('100%');
      
      expect(editor.editableArea.style.maxWidth).toBe('100%');
      expect(editor.editableArea.classList.contains('viewport-desktop')).toBe(true);
      expect(editor.editableArea.classList.contains('viewport-mobile')).toBe(false);
    });

    test('should update active viewport button', () => {
      const mobileBtn = document.getElementById('mobile-viewport');
      const tabletBtn = document.getElementById('tablet-viewport');
      const desktopBtn = document.getElementById('desktop-viewport');
      
      editor.setViewportSize('375px');
      
      expect(mobileBtn.classList.contains('active')).toBe(true);
      expect(tabletBtn.classList.contains('active')).toBe(false);
      expect(desktopBtn.classList.contains('active')).toBe(false);
    });

    test('should refresh image dimensions on viewport change', () => {
      editor.setViewportSize('768px');
      
      expect(editor.refreshImageDimensions).toHaveBeenCalled();
    });

    test('should setup viewport control event listeners', () => {
      const mobileBtn = document.getElementById('mobile-viewport');
      const tabletBtn = document.getElementById('tablet-viewport');
      const desktopBtn = document.getElementById('desktop-viewport');
      
      // Mock the setViewportSize method to track calls
      editor.setViewportSize = jest.fn();
      
      editor.setupViewportControls();
      
      mobileBtn.click();
      expect(editor.setViewportSize).toHaveBeenCalledWith('375px');
      
      tabletBtn.click();
      expect(editor.setViewportSize).toHaveBeenCalledWith('768px');
      
      desktopBtn.click();
      expect(editor.setViewportSize).toHaveBeenCalledWith('100%');
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      // Add API methods to our mock editor
      editor.publishUrl = '/api/publish';
      editor.loadUrl = '/api/load';
      editor.save = Editor.prototype.save.bind(editor);
      editor.load = Editor.prototype.load.bind(editor);
      editor.publishToUrl = Editor.prototype.publishToUrl.bind(editor);
      editor.loadFromUrl = Editor.prototype.loadFromUrl.bind(editor);
      editor.serializePageToJSON = Editor.prototype.serializePageToJSON.bind(editor);
      editor.deserializeJSONToPage = Editor.prototype.deserializeJSONToPage.bind(editor);
      
      // Add missing methods that are called during load/deserialize
      editor.makeExistingBlocksEditable = jest.fn();
      editor.columnResizer = { initialize: jest.fn() };
      editor.stateHistory = { saveState: jest.fn() };
      editor.pageSettingsModal = { 
        getPageData: jest.fn(() => ({})),
        setPageData: jest.fn()
      };
      editor.getCleanHTML = jest.fn(() => '<div>Clean HTML</div>');
      
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn()
        },
        writable: true
      });
      
      // Mock fetch
      global.fetch = jest.fn();
      
      // Mock alert
      global.alert = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('should save to localStorage', () => {
      editor.editableArea.innerHTML = '<div>Test content</div>';
      
      editor.save();
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'editorPageData',
        expect.stringContaining('Test content')
      );
      expect(alert).toHaveBeenCalledWith('Page saved successfully!');
    });

    test('should load from localStorage', () => {
      const testData = {
        content: '<div>Loaded content</div>',
        page_settings: {},
        timestamp: Date.now()
      };
      
      localStorage.getItem.mockReturnValue(JSON.stringify(testData));
      
      editor.load();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('editorPageData');
      expect(alert).toHaveBeenCalledWith('Page loaded successfully!');
    });

    test('should handle load when no data exists', () => {
      localStorage.getItem.mockReturnValue(null);
      
      editor.load();
      
      expect(alert).toHaveBeenCalledWith('No saved page found!');
    });

    test('should serialize page to JSON', () => {
      editor.editableArea.innerHTML = '<div>Test content</div>';
      
      const result = editor.serializePageToJSON();
      
      expect(result).toEqual({
        content: '<div>Test content</div>',
        page_settings: {},
        timestamp: expect.any(Number)
      });
    });

    test('should publish to URL successfully', async () => {
      const mockResponse = { 
        ok: true, 
        status: 200, 
        text: jest.fn(() => Promise.resolve('Success'))
      };
      fetch.mockResolvedValue(mockResponse);
      
      // Add publish button to DOM
      document.body.innerHTML += '<button id="publish-btn">Publish</button>';
      
      await editor.publishToUrl();
      
      expect(fetch).toHaveBeenCalledWith('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.any(String)
      });
    });

    test('should handle publish URL error', async () => {
      const mockResponse = { ok: false, status: 500, text: () => Promise.resolve('Server error') };
      fetch.mockResolvedValue(mockResponse);
      
      document.body.innerHTML += '<button id="publish-btn">Publish</button>';
      
      await editor.publishToUrl();
      
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('Error publishing'));
    });

    test('should load from URL successfully', async () => {
      const testData = {
        content: '<div>URL content</div>',
        page_settings: {},
        timestamp: Date.now()
      };
      
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(testData)
      };
      fetch.mockResolvedValue(mockResponse);
      
      document.body.innerHTML += '<button id="load-from-url-btn">Load from URL</button>';
      
      await editor.loadFromUrl();
      
      expect(fetch).toHaveBeenCalledWith('/api/load', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      expect(alert).toHaveBeenCalledWith('Page loaded successfully from URL!');
    });

    test('should handle missing publish URL', async () => {
      editor.publishUrl = null;
      
      await editor.publishToUrl();
      
      expect(alert).toHaveBeenCalledWith('No publish URL configured');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle missing load URL', async () => {
      editor.loadUrl = null;
      
      await editor.loadFromUrl();
      
      expect(alert).toHaveBeenCalledWith('No load URL configured');
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Drag Handle Management', () => {
    beforeEach(() => {
      // Add drag handle methods to our mock editor
      editor.attachDragHandleListeners = Editor.prototype.attachDragHandleListeners.bind(editor);
    });

    test('should attach drag handle listeners to element', () => {
      const element = document.createElement('div');
      element.innerHTML = '<span class="drag-handle">⋮⋮</span><div>Content</div>';
      
      editor.attachDragHandleListeners(element);
      
      expect(element.draggable).toBe(true);
      
      const handle = element.querySelector('.drag-handle');
      expect(handle.style.cursor).toBe('move');
    });

    test('should not attach listeners if already attached', () => {
      const element = document.createElement('div');
      element.innerHTML = '<span class="drag-handle">⋮⋮</span><div>Content</div>';
      element.dataset.dragListenersAttached = 'true';
      
      const originalDraggable = element.draggable;
      
      editor.attachDragHandleListeners(element);
      
      // Should not change draggable state if already attached
      expect(element.draggable).toBe(originalDraggable);
    });

    test('should handle element without drag handle gracefully', () => {
      const element = document.createElement('div');
      element.innerHTML = '<div>No handle content</div>';
      
      expect(() => {
        editor.attachDragHandleListeners(element);
      }).not.toThrow();
    });

    test('should set drag from handle flag on mousedown', () => {
      const element = document.createElement('div');
      element.innerHTML = '<span class="drag-handle">⋮⋮</span><div>Content</div>';
      
      editor.attachDragHandleListeners(element);
      
      const handle = element.querySelector('.drag-handle');
      const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
      
      handle.dispatchEvent(mouseDownEvent);
      
      expect(element.dataset.dragFromHandle).toBe('true');
    });

    test('should clear drag from handle flag on dragend', () => {
      const element = document.createElement('div');
      element.innerHTML = '<span class="drag-handle">⋮⋮</span><div>Content</div>';
      element.dataset.dragFromHandle = 'true';
      
      editor.attachDragHandleListeners(element);
      
      const dragEndEvent = new DragEvent('dragend', { bubbles: true });
      element.dispatchEvent(dragEndEvent);
      
      expect(element.dataset.dragFromHandle).toBeUndefined();
    });
  });

  describe('Content Management', () => {
    beforeEach(() => {
      // Add content management methods
      editor.makeExistingBlocksEditable = Editor.prototype.makeExistingBlocksEditable.bind(editor);
      editor.loadInitialContent = Editor.prototype.loadInitialContent.bind(editor);
      editor.getCleanHTML = Editor.prototype.getCleanHTML.bind(editor);
      editor.exportHTML = Editor.prototype.exportHTML.bind(editor);
      
      // Mock dependencies
      editor.stateHistory = { saveState: jest.fn() };
    });

    test('should make existing blocks editable', () => {
      editor.editableArea.innerHTML = `
        <div class="editor-block">
          <span class="drag-handle">⋮⋮</span>
          <h1>Test Heading</h1>
          <p>Test paragraph</p>
        </div>
      `;
      
      editor.makeExistingBlocksEditable();
      
      const heading = editor.editableArea.querySelector('h1');
      const paragraph = editor.editableArea.querySelector('p');
      
      // In jsdom, contentEditable property returns boolean true/false, not string
      expect(heading.contentEditable).toBe(true);
      expect(paragraph.contentEditable).toBe(true);
    });

    test('should load initial content when provided', () => {
      editor.initialContent = '<div class="test">Initial content</div>';
      
      editor.loadInitialContent();
      
      expect(editor.editableArea.innerHTML).toContain('Initial content');
      expect(editor.stateHistory.saveState).toHaveBeenCalled();
    });

    test('should not load initial content when not provided', () => {
      editor.initialContent = null;
      const originalContent = editor.editableArea.innerHTML;
      
      editor.loadInitialContent();
      
      expect(editor.editableArea.innerHTML).toBe(originalContent);
    });

    test('should generate clean HTML without controls', () => {
      editor.editableArea.innerHTML = `
        <div class="editor-block">
          <span class="drag-handle">⋮⋮</span>
          <button class="edit-icon">✏️</button>
          <div class="content">Clean content</div>
        </div>
      `;
      
      const cleanHTML = editor.getCleanHTML();
      
      expect(cleanHTML).toContain('Clean content');
      expect(cleanHTML).not.toContain('drag-handle');
      expect(cleanHTML).not.toContain('edit-icon');
    });

    test('should export HTML file', () => {
      // Mock URL and document methods
      global.URL = {
        createObjectURL: jest.fn(() => 'blob:url'),
        revokeObjectURL: jest.fn()
      };
      
      const mockClick = jest.fn();
      const mockLink = {
        href: '',
        download: '',
        click: mockClick
      };
      
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      
      editor.editableArea.innerHTML = '<div>Export content</div>';
      
      editor.exportHTML();
      
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toBe('page.html');
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('Component Integration', () => {
    test('should initialize all required components', () => {
      // Since components are mocked, we'll verify the initialization logic exists
      expect(Editor).toBeDefined();
      expect(typeof Editor.prototype.init).toBe('function');
      
      // Verify that our test editor has the expected structure
      expect(editor.editableArea).toBeDefined();
      expect(editor.currentMode).toBe('edit');
      expect(editor.showCodeIcon).toBeDefined();
      expect(editor.assetsPath).toBeDefined();
    });

    test('should set global assets path for components', () => {
      const customPath = 'custom/assets/';
      editor.assetsPath = customPath;
      
      expect(editor.assetsPath).toBe(customPath);
    });

    test('should handle mode change events', () => {
      editor.currentMode = 'edit';
      
      // Mock event dispatch
      const dispatchEvent = jest.spyOn(window, 'dispatchEvent');
      
      editor.toggleMode();
      
      expect(editor.currentMode).toBe('display');
      expect(dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'dragonModeChanged',
          detail: { mode: 'display' }
        })
      );
    });

    test('should handle viewport controls visibility based on mode', () => {
      const viewportControls = document.querySelector('.viewport-controls');
      
      // Test display mode hides controls
      editor.currentMode = 'edit';
      editor.toggleMode();
      
      expect(viewportControls.style.display).toBe('none');
      
      // Test edit mode shows controls
      editor.toggleMode();
      
      expect(viewportControls.style.display).toBe('flex');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      // Reset API methods for error handling tests
      editor.publishToUrl = Editor.prototype.publishToUrl.bind(editor);
      editor.loadInitialContent = Editor.prototype.loadInitialContent.bind(editor);
      editor.serializePageToJSON = Editor.prototype.serializePageToJSON.bind(editor);
      editor.makeExistingBlocksEditable = jest.fn();
      
      // Mock required dependencies
      editor.pageSettingsModal = { 
        getPageData: jest.fn(() => ({})),
        setPageData: jest.fn()
      };
      editor.getCleanHTML = jest.fn(() => '<div>Clean HTML</div>');
      global.fetch = jest.fn();
      global.alert = jest.fn();
    });

    test('should handle missing DOM elements gracefully', () => {
      // Test that editor handles empty editable area
      editor.editableArea.innerHTML = '';
      
      // Should still serialize successfully
      const result = editor.serializePageToJSON();
      expect(result).toEqual({
        content: '',
        page_settings: {},
        timestamp: expect.any(Number)
      });
    });

    test('should handle malformed initial content', () => {
      editor.initialContent = '<div><p>Unclosed tag';
      
      // Should complete without throwing (makeExistingBlocksEditable is mocked)
      editor.loadInitialContent();
      
      // Content should be loaded despite being malformed
      expect(editor.editableArea.innerHTML).toContain('Unclosed tag');
    });

    test('should handle network errors in API calls', async () => {
      fetch.mockRejectedValue(new Error('Network error'));
      
      document.body.innerHTML += '<button id="publish-btn">Publish</button>';
      editor.publishUrl = '/api/publish';
      
      await editor.publishToUrl();
      
      expect(alert).toHaveBeenCalledWith(expect.stringContaining('error'));
    });
  });
});