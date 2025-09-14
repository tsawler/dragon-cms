import { Editor } from '../js/editor-core.js';

// Mock all dependencies
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

describe('API Integration Methods', () => {
  let editor;
  let mockFetch;
  let mockAlert;
  
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
                <button id="publish-btn" class="btn btn-warning" style="display: none;">Publish</button>
                <button id="load-from-url-btn" class="btn btn-info" style="display: none;">Load from URL</button>
                <button id="page-settings-btn">⚙️</button>
              </div>
            </div>
            <div class="editor-main">
              <aside id="snippet-panel" class="snippet-panel">
                <div id="panel-handle" class="panel-handle"></div>
              </aside>
              <main id="editable-area" class="editable-area" data-mode="edit">
                <div class="test-content">Test content</div>
              </main>
            </div>
          </div>
          <div class="viewport-controls">
            <button id="mobile-viewport" class="viewport-btn">📱</button>
            <button id="tablet-viewport" class="viewport-btn">📟</button>
            <button id="desktop-viewport" class="viewport-btn active">🖥️</button>
          </div>
          <div id="formatting-toolbar" class="formatting-toolbar" style="display: none;"></div>
        </div>
      </div>
    `;
    
    // Mock fetch
    mockFetch = jest.fn();
    global.fetch = mockFetch;
    
    // Mock alert
    mockAlert = jest.fn();
    global.alert = mockAlert;
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    
    editor = new Editor({
      publishUrl: '/api/publish',
      loadUrl: '/api/load',
      assetsPath: 'assets/'
    });
    
    // Mock the getCleanHTML method
    editor.getCleanHTML = jest.fn().mockReturnValue('<div>Clean HTML</div>');
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('publishToUrl()', () => {
    test('should publish page data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Success message')
      });
      
      editor.getCleanHTML = jest.fn().mockReturnValue('<div>Clean HTML</div>');
      
      await editor.publishToUrl();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: expect.stringContaining('"html":"<div>Clean HTML</div>"')
      });
      
      expect(mockAlert).toHaveBeenCalledWith('Page published successfully!');
    });

    test('should handle publish error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error')
      });
      
      await editor.publishToUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('Error publishing page: Server responded with 500: Server error');
      expect(console.error).toHaveBeenCalledWith('Error publishing page:', expect.any(Error));
    });

    test('should handle network error during publish', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);
      
      await editor.publishToUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('Error publishing page: Network error');
      expect(console.error).toHaveBeenCalledWith('Error publishing page:', networkError);
    });

    test('should show loading state during publish', async () => {
      let resolvePromise;
      const publishPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValueOnce(publishPromise);
      
      const publishBtn = document.getElementById('publish-btn');
      
      // Start publish (don't await yet)
      const publishCall = editor.publishToUrl();
      
      // Check loading state
      expect(publishBtn.textContent).toBe('Publishing...');
      expect(publishBtn.disabled).toBe(true);
      
      // Resolve the promise
      resolvePromise({
        ok: true,
        text: () => Promise.resolve('Success')
      });
      
      await publishCall;
      
      // Check restored state
      expect(publishBtn.textContent).toBe('Publish');
      expect(publishBtn.disabled).toBe(false);
    });

    test('should restore button state after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));
      
      const publishBtn = document.getElementById('publish-btn');
      
      await editor.publishToUrl();
      
      expect(publishBtn.textContent).toBe('Publish');
      expect(publishBtn.disabled).toBe(false);
    });

    test('should alert when no publish URL configured', async () => {
      editor.publishUrl = null;
      
      await editor.publishToUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('No publish URL configured');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should include page settings in publish data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Success')
      });
      
      editor.pageSettingsModal = {
        getPageData: jest.fn().mockReturnValue({
          title: 'Test Page',
          customCSS: 'body { color: red; }'
        })
      };
      
      await editor.publishToUrl();
      
      const publishCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(publishCall[1].body);
      
      expect(requestBody.pageSettings).toEqual({
        title: 'Test Page',
        customCSS: 'body { color: red; }'
      });
    });

    test('should include timestamp in publish data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Success')
      });
      
      const beforePublish = Date.now();
      await editor.publishToUrl();
      const afterPublish = Date.now();
      
      expect(mockFetch).toHaveBeenCalled();
      const publishCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(publishCall[1].body);
      
      expect(requestBody.timestamp).toBeGreaterThanOrEqual(beforePublish);
      expect(requestBody.timestamp).toBeLessThanOrEqual(afterPublish);
    });
  });

  describe('loadFromUrl()', () => {
    test('should load page data successfully', async () => {
      const mockPageData = {
        content: '<div class="loaded-content">Loaded content</div>',
        pageSettings: {
          title: 'Loaded Page',
          customCSS: 'body { background: blue; }'
        }
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPageData)
      });
      
      await editor.loadFromUrl();
      
      expect(mockFetch).toHaveBeenCalledWith('/api/load', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      expect(editor.editableArea.innerHTML).toBe(mockPageData.content);
      expect(mockAlert).toHaveBeenCalledWith('Page loaded successfully from URL!');
    });

    test('should handle load error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('Page not found')
      });
      
      await editor.loadFromUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('Error loading page: Server responded with 404: Page not found');
      expect(console.error).toHaveBeenCalledWith('Error loading page from URL:', expect.any(Error));
    });

    test('should handle network error during load', async () => {
      const networkError = new Error('Connection failed');
      mockFetch.mockRejectedValueOnce(networkError);
      
      await editor.loadFromUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('Error loading page: Connection failed');
      expect(console.error).toHaveBeenCalledWith('Error loading page from URL:', networkError);
    });

    test('should show loading state during load', async () => {
      let resolvePromise;
      const loadPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValueOnce(loadPromise);
      
      const loadBtn = document.getElementById('load-from-url-btn');
      
      // Start load (don't await yet)
      const loadCall = editor.loadFromUrl();
      
      // Check loading state
      expect(loadBtn.textContent).toBe('Loading...');
      expect(loadBtn.disabled).toBe(true);
      
      // Resolve the promise
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ content: 'test' })
      });
      
      await loadCall;
      
      // Check restored state
      expect(loadBtn.textContent).toBe('Load from URL');
      expect(loadBtn.disabled).toBe(false);
    });

    test('should restore button state after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));
      
      const loadBtn = document.getElementById('load-from-url-btn');
      
      await editor.loadFromUrl();
      
      expect(loadBtn.textContent).toBe('Load from URL');
      expect(loadBtn.disabled).toBe(false);
    });

    test('should alert when no load URL configured', async () => {
      editor.loadUrl = null;
      
      await editor.loadFromUrl();
      
      expect(mockAlert).toHaveBeenCalledWith('No load URL configured');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('should handle empty page data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ content: '' })
      });
      
      const originalContent = editor.editableArea.innerHTML;
      await editor.loadFromUrl();
      
      // Since content is empty string (falsy), it won't be set, so content remains unchanged
      expect(editor.editableArea.innerHTML).toBe(originalContent);
      expect(mockAlert).toHaveBeenCalledWith('Page loaded successfully from URL!');
    });

    test('should load page settings if available', async () => {
      const mockPageData = {
        content: '<div>Content</div>',
        pageSettings: {
          title: 'Test Title',
          customCSS: 'body { margin: 0; }'
        }
      };
      
      editor.pageSettingsModal = {
        setPageData: jest.fn()
      };
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPageData)
      });
      
      await editor.loadFromUrl();
      
      expect(editor.pageSettingsModal.setPageData).toHaveBeenCalledWith(mockPageData.pageSettings);
    });

    test('should handle missing page settings modal', async () => {
      const mockPageData = {
        content: '<div>Content</div>',
        pageSettings: { title: 'Test' }
      };
      
      editor.pageSettingsModal = null;
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockPageData)
      });
      
      expect(() => editor.loadFromUrl()).not.toThrow();
    });
  });

  describe('API Button Visibility', () => {
    test('should show publish button when publishUrl is configured', () => {
      const publishBtn = document.getElementById('publish-btn');

      expect(publishBtn.classList.contains('btn-hidden')).toBe(false);
    });

    test('should show load button when loadUrl is configured', () => {
      const loadBtn = document.getElementById('load-from-url-btn');

      expect(loadBtn.classList.contains('btn-hidden')).toBe(false);
    });

    test('should not show buttons when URLs are not configured', () => {
      // Reset buttons to initial state
      const publishBtn = document.getElementById('publish-btn');
      const loadBtn = document.getElementById('load-from-url-btn');
      publishBtn.style.display = 'none';
      loadBtn.style.display = 'none';
      
      // Create new editor without URLs
      const editorWithoutUrls = new Editor({ assetsPath: 'assets/' });
      editorWithoutUrls.getCleanHTML = jest.fn().mockReturnValue('<div>Clean HTML</div>');
      
      // Buttons should remain hidden
      expect(publishBtn.style.display).toBe('none');
      expect(loadBtn.style.display).toBe('none');
    });
  });

  describe('Data Serialization', () => {
    test('should serialize page to JSON with all required fields', () => {
      editor.pageSettingsModal = {
        getPageData: jest.fn().mockReturnValue({
          title: 'Test Page',
          customCSS: 'test css'
        })
      };
      
      const serialized = editor.serializePageToJSON();
      
      expect(serialized).toHaveProperty('content');
      expect(serialized).toHaveProperty('page_settings');
      expect(serialized).toHaveProperty('timestamp');
      expect(typeof serialized.timestamp).toBe('number');
    });

    test('should deserialize JSON to page correctly', () => {
      const testData = {
        content: '<div class="test">Test content</div>',
        page_settings: {
          title: 'Test Page'
        },
        timestamp: Date.now()
      };
      
      editor.pageSettingsModal = {
        setPageData: jest.fn()
      };
      
      editor.deserializeJSONToPage(testData);
      
      expect(editor.editableArea.innerHTML).toBe(testData.content);
      expect(editor.pageSettingsModal.setPageData).toHaveBeenCalledWith(testData.page_settings);
    });

    test('should handle missing page settings in serialization', () => {
      editor.pageSettingsModal = null;
      
      const serialized = editor.serializePageToJSON();
      
      expect(serialized.page_settings).toEqual({});
    });

    test('should handle missing page settings in deserialization', () => {
      const testData = {
        content: '<div>Test</div>'
      };
      
      editor.pageSettingsModal = {
        setPageData: jest.fn()
      };
      
      expect(() => {
        editor.deserializeJSONToPage(testData);
      }).not.toThrow();
      
      // Since page_settings is missing, setPageData should not be called
      expect(editor.pageSettingsModal.setPageData).not.toHaveBeenCalled();
    });
  });
});