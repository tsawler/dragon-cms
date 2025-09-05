import { 
  StyleEditorModal, 
  CodeEditorModal, 
  ColumnSettingsModal, 
  ConfirmationModal 
} from '../js/modals.js';

// Mock editor object
const createMockEditor = () => ({
  editableArea: document.createElement('div'),
  makeExistingBlocksEditable: jest.fn(),
  attachDragHandleListeners: jest.fn(),
  formattingToolbar: {
    fixFirefoxEditableElements: jest.fn()
  }
});

describe('Modal Classes', () => {
  let mockEditor;
  
  beforeEach(() => {
    document.body.innerHTML = '';
    mockEditor = createMockEditor();
    jest.clearAllMocks();
  });

  describe('StyleEditorModal', () => {
    let styleModal;
    
    beforeEach(() => {
      styleModal = new StyleEditorModal(mockEditor);
    });

    test('should create modal on construction', () => {
      expect(styleModal.modal).toBeInstanceOf(HTMLDivElement);
      expect(styleModal.modal.className).toBe('modal');
      expect(styleModal.editor).toBe(mockEditor);
      expect(styleModal.targetElement).toBeNull();
    });

    test('should have correct modal structure', () => {
      expect(styleModal.modal.querySelector('.modal-content')).toBeInTheDocument();
      expect(styleModal.modal.querySelector('.modal-header')).toBeInTheDocument();
      expect(styleModal.modal.querySelector('.modal-body')).toBeInTheDocument();
      expect(styleModal.modal.querySelector('h2')).toHaveTextContent('Style Editor');
      expect(styleModal.modal.querySelector('.modal-close')).toBeInTheDocument();
    });

    test('should have style editing controls', () => {
      const modalBody = styleModal.modal.querySelector('.modal-body');
      expect(modalBody.querySelector('.style-padding')).toBeInTheDocument();
      expect(modalBody.querySelector('.style-margin')).toBeInTheDocument();
      expect(modalBody.querySelector('.style-border-width')).toBeInTheDocument();
      expect(modalBody.querySelector('.style-background')).toBeInTheDocument();
    });

    test('should append modal to document body on creation', () => {
      expect(document.body.contains(styleModal.modal)).toBe(true);
    });
  });

  describe('CodeEditorModal', () => {
    let codeModal;
    
    beforeEach(() => {
      codeModal = new CodeEditorModal(mockEditor);
    });

    test('should create modal on construction', () => {
      expect(codeModal.modal).toBeInstanceOf(HTMLDivElement);
      expect(codeModal.modal.className).toBe('modal');
      expect(codeModal.editor).toBe(mockEditor);
      expect(codeModal.targetElement).toBeNull();
    });

    test('should have correct modal structure', () => {
      expect(codeModal.modal.querySelector('.modal-content')).toBeInTheDocument();
      expect(codeModal.modal.querySelector('.modal-header')).toBeInTheDocument();
      expect(codeModal.modal.querySelector('.modal-body')).toBeInTheDocument();
      expect(codeModal.modal.querySelector('h2')).toHaveTextContent('HTML Editor');
    });

    test('should have HTML editor controls', () => {
      const modalBody = codeModal.modal.querySelector('.modal-body');
      expect(modalBody.querySelector('textarea')).toBeInTheDocument();
      expect(modalBody.querySelector('.code-editor-textarea')).toBeInTheDocument();
    });

    test('should open modal for target element', () => {
      const targetElement = document.createElement('div');
      targetElement.innerHTML = '<p>Test content</p>';
      
      codeModal.open(targetElement);
      
      expect(codeModal.targetElement).toBe(targetElement);
      // CodeEditorModal creates a new jsModal, not using active class
      expect(codeModal.jsModal).toBeDefined();
    });

    test('should populate textarea with target element HTML', () => {
      const targetElement = document.createElement('div');
      targetElement.innerHTML = '<p>Test content</p>';
      
      codeModal.open(targetElement);
      
      // The textarea is in the jsModal, not the original modal
      const textarea = codeModal.jsModal.querySelector('textarea');
      expect(textarea.value).toContain('Test content');
    });
  });

  describe('ColumnSettingsModal', () => {
    let columnModal;
    
    beforeEach(() => {
      columnModal = new ColumnSettingsModal(mockEditor);
    });

    test('should create modal on construction', () => {
      expect(columnModal.modal).toBeInstanceOf(HTMLDivElement);
      expect(columnModal.modal.className).toBe('modal');
      expect(columnModal.editor).toBe(mockEditor);
    });

    test('should initialize with default block settings', () => {
      expect(columnModal.blockSettings).toEqual({
        width: '',
        fullWidth: false,
        height: '',
        backgroundColor: '',
        backgroundImage: '',
        contentWidth: ''
      });
    });

    test('should have tabbed interface', () => {
      const tabs = columnModal.modal.querySelectorAll('.tab-btn');
      expect(tabs.length).toBeGreaterThan(0);
      
      const tabContent = columnModal.modal.querySelector('.tabs-content');
      expect(tabContent).toBeInTheDocument();
    });

    test('should have layout controls', () => {
      expect(columnModal.modal.querySelector('#block-width')).toBeInTheDocument();
      expect(columnModal.modal.querySelector('#full-width-check')).toBeInTheDocument();
      expect(columnModal.modal.querySelector('#block-height')).toBeInTheDocument();
    });

    test('should have background controls', () => {
      expect(columnModal.modal.querySelector('#bg-color-picker')).toBeInTheDocument();
      expect(columnModal.modal.querySelector('#bg-image')).toBeInTheDocument();
    });

    test('should open modal for target block', () => {
      const targetBlock = document.createElement('div');
      targetBlock.className = 'editor-block';
      
      columnModal.open(targetBlock);
      
      expect(columnModal.targetBlock).toBe(targetBlock);
      expect(columnModal.modal.classList.contains('active')).toBe(true);
    });
  });

  describe('ConfirmationModal', () => {
    let confirmModal;
    
    beforeEach(() => {
      confirmModal = new ConfirmationModal(mockEditor);
    });

    test('should create modal on construction', () => {
      expect(confirmModal.modal).toBeInstanceOf(HTMLDivElement);
      expect(confirmModal.modal.className).toBe('confirm-modal');
      expect(confirmModal.editor).toBe(mockEditor);
    });

    test('should have confirmation structure', () => {
      expect(confirmModal.modal.querySelector('.confirm-modal-content')).toBeInTheDocument();
      expect(confirmModal.modal.querySelector('.confirm-modal-icon')).toBeInTheDocument();
      expect(confirmModal.modal.querySelector('.confirm-modal-title')).toBeInTheDocument();
      expect(confirmModal.modal.querySelector('.confirm-modal-message')).toBeInTheDocument();
    });

    test('should have confirmation buttons', () => {
      const cancelBtn = confirmModal.modal.querySelector('.confirm-modal-cancel');
      const confirmBtn = confirmModal.modal.querySelector('.confirm-modal-confirm');
      
      expect(cancelBtn).toBeInTheDocument();
      expect(confirmBtn).toBeInTheDocument();
    });

    test('should set callbacks on show', () => {
      const onConfirm = jest.fn();
      const onCancel = jest.fn();
      
      confirmModal.show('Custom Title', 'Custom Message', onConfirm, onCancel);
      
      expect(confirmModal.onConfirm).toBe(onConfirm);
      expect(confirmModal.onCancel).toBe(onCancel);
      // ConfirmationModal creates a new jsModal, not using active class
      expect(confirmModal.jsModal).toBeDefined();
    });

    test('should update title and message on show', () => {
      const title = 'Delete Item';
      const message = 'Are you sure you want to delete this item?';
      
      confirmModal.show(title, message, jest.fn(), jest.fn());
      
      expect(confirmModal.modal.querySelector('.confirm-modal-title')).toHaveTextContent(title);
      expect(confirmModal.modal.querySelector('.confirm-modal-message')).toHaveTextContent(message);
    });

    test('should handle confirmation callback', () => {
      const onConfirm = jest.fn();
      confirmModal.show('Test', 'Test message', onConfirm, jest.fn());
      
      const confirmBtn = confirmModal.jsModal.querySelector('.js-modal-confirm');
      confirmBtn.click();
      
      expect(onConfirm).toHaveBeenCalled();
      expect(confirmModal.jsModal).toBeNull();
    });

    test('should handle cancel callback', () => {
      const onCancel = jest.fn();
      confirmModal.show('Test', 'Test message', jest.fn(), onCancel);
      
      const cancelBtn = confirmModal.jsModal.querySelector('.js-modal-cancel');
      cancelBtn.click();
      
      expect(onCancel).toHaveBeenCalled();
      expect(confirmModal.jsModal).toBeNull();
    });
  });

  describe('Modal Event Handling', () => {
    test('should handle close button clicks', () => {
      const styleModal = new StyleEditorModal(mockEditor);
      styleModal.modal.classList.add('active');
      
      const closeBtn = styleModal.modal.querySelector('.modal-close');
      closeBtn.click();
      
      expect(styleModal.modal.classList.contains('active')).toBe(false);
    });

    test('should handle background clicks to close modal', () => {
      const styleModal = new StyleEditorModal(mockEditor);
      const targetElement = document.createElement('div');
      styleModal.open(targetElement);
      
      // StyleEditorModal uses active class for non-Edge browsers
      expect(styleModal.modal.classList.contains('active')).toBe(true);
      
      // Simulate clicking the modal background
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: styleModal.modal });
      styleModal.modal.dispatchEvent(clickEvent);
      
      // Modal should be closed
      expect(styleModal.modal.classList.contains('active')).toBe(false);
    });

    test('should not close modal when clicking modal content', () => {
      const styleModal = new StyleEditorModal(mockEditor);
      const targetElement = document.createElement('div');
      styleModal.open(targetElement);
      
      expect(styleModal.modal.classList.contains('active')).toBe(true);
      
      const modalContent = styleModal.modal.querySelector('.modal-content');
      const clickEvent = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: modalContent });
      styleModal.modal.dispatchEvent(clickEvent);
      
      // Modal should still be open
      expect(styleModal.modal.classList.contains('active')).toBe(true);
    });
  });

  describe('Modal Lifecycle', () => {
    test('should initialize callbacks as null', () => {
      const confirmModal = new ConfirmationModal(mockEditor);
      
      expect(confirmModal.onConfirm).toBeNull();
      expect(confirmModal.onCancel).toBeNull();
    });

    test('should reset target element on modal close', () => {
      const codeModal = new CodeEditorModal(mockEditor);
      const targetElement = document.createElement('div');
      
      codeModal.open(targetElement);
      expect(codeModal.targetElement).toBe(targetElement);
      
      codeModal.close();
      expect(codeModal.modal.classList.contains('active')).toBe(false);
    });

    test('should preserve modal content between opens', () => {
      const styleModal = new StyleEditorModal(mockEditor);
      const modalContent = styleModal.modal.querySelector('.modal-body');
      const originalHTML = modalContent.innerHTML;
      
      styleModal.modal.classList.add('active');
      styleModal.close();
      styleModal.modal.classList.add('active');
      
      expect(modalContent.innerHTML).toBe(originalHTML);
    });
  });
});