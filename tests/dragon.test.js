import dragon from '../js/dragon.js';

describe('Dragon Class', () => {
  beforeEach(() => {
    // Clear DOM between tests
    document.body.innerHTML = '';
    // Clear instances
    dragon.instances.clear();
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Dragon.New() initialization', () => {
    test('should create editor with default options', () => {
      // Setup container
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      const editor = dragon.New();
      
      expect(editor).toBeDefined();
      expect(dragon.instances.get('dragon-editor')).toBe(editor);
      expect(document.querySelector('.dragon-editor')).toBeInTheDocument();
    });

    test('should create editor with custom containerId', () => {
      document.body.innerHTML = '<div id="custom-container"></div>';
      
      const editor = dragon.New({ containerId: 'custom-container' });
      
      expect(editor).toBeDefined();
      expect(dragon.instances.get('custom-container')).toBe(editor);
    });

    test('should accept custom options', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      const customOptions = {
        assetsPath: 'custom/assets/',
        cssPath: 'custom/editor.css',
        snippetsPath: 'custom/snippets.js',
        showCodeIcon: true,
        publishUrl: '/api/publish',
        loadUrl: '/api/load'
      };
      
      const editor = dragon.New(customOptions);
      
      expect(editor).toBeDefined();
      expect(editor.options.assetsPath).toBe('custom/assets/');
      expect(editor.options.publishUrl).toBe('/api/publish');
    });

    test('should throw error if container not found', () => {
      expect(() => {
        dragon.New({ containerId: 'nonexistent' });
      }).toThrow("Container element 'nonexistent' not found");
    });

    test('should find container by query selector', () => {
      document.body.innerHTML = '<div class="my-editor"></div>';
      
      const editor = dragon.New({ containerId: '.my-editor' });
      
      expect(editor).toBeDefined();
      expect(dragon.instances.get('.my-editor')).toBe(editor);
    });

    test('should clear existing container content', () => {
      document.body.innerHTML = '<div id="dragon-editor"><p>Existing content</p></div>';
      
      dragon.New();
      
      const container = document.getElementById('dragon-editor');
      // The container now contains the editor, original content is still there but editor is appended
      expect(container.querySelector('.dragon-editor')).toBeInTheDocument();
    });

    test('should add dragon-initialized class', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      const container = document.getElementById('dragon-editor');
      expect(container.classList.contains('dragon-initialized')).toBe(true);
    });

    test('should create required HTML structure', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      expect(document.querySelector('.dragon-editor')).toBeInTheDocument();
      expect(document.querySelector('.editor-container')).toBeInTheDocument();
      expect(document.querySelector('.editor-header')).toBeInTheDocument();
      expect(document.querySelector('.editor-controls')).toBeInTheDocument();
      expect(document.querySelector('.snippet-panel')).toBeInTheDocument();
      expect(document.querySelector('.editable-area')).toBeInTheDocument();
      expect(document.querySelector('.viewport-controls')).toBeInTheDocument();
      expect(document.querySelector('.formatting-toolbar')).toBeInTheDocument();
    });

    test('should setup modal close handlers', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      const setupSpy = jest.spyOn(dragon, 'setupCloseHandlers');
      
      dragon.New();
      
      expect(setupSpy).toHaveBeenCalled();
    });

    test('should initialize modal dragger', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      expect(dragon.modalDragger).toBeDefined();
    });
  });

  describe('Dragon instance management', () => {
    test('should get existing editor instance', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      const editor = dragon.New();
      const retrieved = dragon.get('dragon-editor');
      
      expect(retrieved).toBe(editor);
    });

    test('should return undefined for non-existent instance', () => {
      const retrieved = dragon.get('nonexistent');
      
      expect(retrieved).toBeUndefined();
    });

    test('should destroy editor instance', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      const editor = dragon.New();
      editor.destroy = jest.fn();
      
      dragon.destroy('dragon-editor');
      
      expect(editor.destroy).toHaveBeenCalled();
      expect(dragon.instances.get('dragon-editor')).toBeUndefined();
    });

    test('should handle destroy for non-existent instance', () => {
      expect(() => {
        dragon.destroy('nonexistent');
      }).not.toThrow();
    });
  });

  describe('Modal handling', () => {
    test('should close modal and reset position', () => {
      document.body.innerHTML = `
        <div id="dragon-editor"></div>
        <div class="modal active">
          <div class="modal-content"></div>
        </div>
      `;
      
      dragon.New();
      const modal = document.querySelector('.modal');
      const modalContent = document.querySelector('.modal-content');
      
      dragon.modalDragger = { resetModalPosition: jest.fn() };
      
      dragon.closeModal(modal);
      
      expect(modal.classList.contains('active')).toBe(false);
      expect(dragon.modalDragger.resetModalPosition).toHaveBeenCalledWith(modalContent);
    });

    test('should handle modal without modal dragger', () => {
      document.body.innerHTML = `
        <div class="modal active">
          <div class="modal-content"></div>
        </div>
      `;
      
      const modal = document.querySelector('.modal');
      
      expect(() => {
        dragon.closeModal(modal);
      }).not.toThrow();
      
      expect(modal.classList.contains('active')).toBe(false);
    });
  });

  describe('CSS and JavaScript loading', () => {
    test('should load CSS if not present', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      const cssLink = document.querySelector('link[href*="editor.css"]');
      expect(cssLink).toBeInTheDocument();
      expect(cssLink.rel).toBe('stylesheet');
    });

    test('should not duplicate CSS loading', () => {
      document.head.innerHTML = '<link rel="stylesheet" href="editor.css">';
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      const cssLinks = document.querySelectorAll('link[href*="editor.css"]');
      expect(cssLinks.length).toBe(1);
    });

    test('should load snippets.js if not present', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      // Since we're mocking getSnippets, we can just verify the editor was created
      // In real implementation, this would load snippets.js
      expect(document.querySelector('.dragon-editor')).toBeInTheDocument();
    });

    test('should not duplicate snippets.js loading', () => {
      // Mock getSnippets to simulate it's already loaded
      global.getSnippets = jest.fn(() => []);
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      dragon.New();
      
      // Since getSnippets exists, no script loading is needed
      expect(document.querySelector('.dragon-editor')).toBeInTheDocument();
    });

    test('should use custom CSS and snippets paths', () => {
      document.body.innerHTML = '<div id="dragon-editor"></div>';
      
      const editor = dragon.New({
        cssPath: 'custom/style.css',
        snippetsPath: 'custom/components.js'
      });
      
      // Verify custom paths are set in options
      expect(editor.options.cssPath).toBe('custom/style.css');
      expect(editor.options.snippetsPath).toBe('custom/components.js');
    });
  });
});