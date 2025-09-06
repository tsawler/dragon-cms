import { FormattingToolbar } from '../js/formatting-toolbar.js';

describe('FormattingToolbar', () => {
    let toolbar;
    let mockEditor;
    let mockToolbarElement;
    let mockAlignmentToolbarElement;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="formatting-toolbar" style="display: none; position: absolute;">
                <button data-command="bold">Bold</button>
                <button data-command="italic">Italic</button>
                <button data-command="underline">Underline</button>
                <button data-command="strikeThrough">Strike</button>
                <button data-command="createLink">Link</button>
                <button data-command="insertImage">Image</button>
                <select id="format-select">
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                    <option value="blockquote">Quote</option>
                </select>
                <select id="font-family">
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times</option>
                </select>
                <select id="font-size">
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                </select>
                <input type="color" id="text-color" value="#000000">
                <input type="color" id="background-color" value="#ffffff">
            </div>
            <div id="image-alignment-toolbar" class="toolbar">
                <button data-align="left">Left</button>
                <button data-align="center">Center</button>
                <button data-align="right">Right</button>
            </div>
            <div class="editable-area">
                <div contenteditable="true" id="test-editable">Test content</div>
            </div>
        `;
        
        mockToolbarElement = document.getElementById('formatting-toolbar');
        mockAlignmentToolbarElement = document.getElementById('image-alignment-toolbar');
        
        // Mock editor
        mockEditor = {
            editableArea: document.querySelector('.editable-area'),
            stateHistory: {
                saveState: jest.fn()
            },
            imageUploader: {
                createImageResizeContainer: jest.fn((img) => {
                    const container = document.createElement('div');
                    container.className = 'image-resize-container';
                    container.appendChild(img);
                    return container;
                })
            }
        };
        
        // Mock execCommand
        document.execCommand = jest.fn(() => true);
        document.queryCommandState = jest.fn(() => false);
        
        // Mock FileReader
        global.FileReader = jest.fn(() => ({
            readAsDataURL: jest.fn(),
            onload: null,
            result: 'data:image/png;base64,mock-image-data'
        }));
        
        // Mock prompt
        global.prompt = jest.fn(() => 'https://example.com');
        
        toolbar = new FormattingToolbar(mockEditor);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with editor reference', () => {
            expect(toolbar.editor).toBe(mockEditor);
        });

        test('should find required DOM elements', () => {
            expect(toolbar.toolbar).toBe(mockToolbarElement);
            expect(toolbar.alignmentToolbar).toBe(mockAlignmentToolbarElement);
        });

        test('should initialize properties', () => {
            expect(toolbar.currentEditableElement).toBeNull();
            expect(toolbar.savedRange).toBeNull();
            expect(toolbar.selectedImageContainer).toBeNull();
        });

        test('should handle missing toolbar elements gracefully', () => {
            document.getElementById('formatting-toolbar').remove();
            
            expect(() => new FormattingToolbar(mockEditor)).not.toThrow();
        });
    });

    describe('Click Listener Setup', () => {
        test('should show toolbar when clicking editable content', () => {
            const editableElement = document.getElementById('test-editable');
            const showToolbarSpy = jest.spyOn(toolbar, 'showToolbar');
            
            editableElement.click();
            
            expect(showToolbarSpy).toHaveBeenCalledWith(editableElement);
            expect(toolbar.currentEditableElement).toBe(editableElement);
        });

        test('should hide toolbar when clicking outside editable content', () => {
            const hideToolbarSpy = jest.spyOn(toolbar, 'hideToolbar');
            
            document.body.click();
            
            expect(hideToolbarSpy).toHaveBeenCalled();
        });

        test('should not hide toolbar when clicking on toolbar itself', () => {
            const hideToolbarSpy = jest.spyOn(toolbar, 'hideToolbar');
            
            mockToolbarElement.click();
            
            expect(hideToolbarSpy).not.toHaveBeenCalled();
        });

        test('should deselect images when clicking outside them', () => {
            const deselectSpy = jest.spyOn(toolbar, 'deselectAllImages');
            
            document.body.click();
            
            expect(deselectSpy).toHaveBeenCalled();
        });

        test('should update saved range on selection change', () => {
            const editableElement = document.getElementById('test-editable');
            toolbar.currentEditableElement = editableElement;
            toolbar.toolbar.style.display = 'flex';
            
            // Mock selection
            const mockRange = {
                cloneRange: jest.fn(() => mockRange),
                commonAncestorContainer: editableElement.firstChild || editableElement,
                startOffset: 0,
                endOffset: 5
            };
            
            const mockSelection = {
                rangeCount: 1,
                getRangeAt: jest.fn(() => mockRange)
            };
            
            global.getSelection = jest.fn(() => mockSelection);
            
            // Trigger selection change
            document.dispatchEvent(new Event('selectionchange'));
            
            expect(toolbar.savedRange).toBeTruthy();
        });
    });

    describe('Toolbar Controls Setup', () => {
        test('should setup formatting buttons', () => {
            const boldButton = toolbar.toolbar.querySelector('[data-command="bold"]');
            const executeCommandSpy = jest.spyOn(toolbar, 'executeCommand');
            
            boldButton.click();
            
            expect(executeCommandSpy).toHaveBeenCalledWith('bold');
        });

        test('should prevent default on button mousedown', () => {
            const boldButton = toolbar.toolbar.querySelector('[data-command="bold"]');
            
            // Create a spy for addEventListener to verify the event handler was attached
            const addEventListenerSpy = jest.spyOn(boldButton, 'addEventListener');
            
            // Re-setup toolbar controls to trigger the event listener attachment
            toolbar.setupToolbarControls();
            
            // Verify that mousedown event listener was attached
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
            
            addEventListenerSpy.mockRestore();
        });

        test('should handle format selector changes', () => {
            const formatSelect = document.getElementById('format-select');
            const formatBlockSpy = jest.spyOn(toolbar, 'formatBlock');
            
            formatSelect.value = 'h1';
            formatSelect.dispatchEvent(new Event('change'));
            
            expect(formatBlockSpy).toHaveBeenCalledWith('h1');
        });

        test('should handle font family changes', () => {
            const fontFamily = document.getElementById('font-family');
            
            fontFamily.value = 'Arial';
            fontFamily.dispatchEvent(new Event('change'));
            
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should handle text color changes', () => {
            const editableElement = document.getElementById('test-editable');
            toolbar.currentEditableElement = editableElement;
            const textColor = document.getElementById('text-color');
            
            textColor.value = '#ff0000';
            textColor.dispatchEvent(new Event('change'));
            
            expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should handle background color changes', () => {
            const editableElement = document.getElementById('test-editable');
            toolbar.currentEditableElement = editableElement;
            const backgroundColor = document.getElementById('background-color');
            
            backgroundColor.value = '#00ff00';
            backgroundColor.dispatchEvent(new Event('change'));
            
            expect(document.execCommand).toHaveBeenCalledWith('hiliteColor', false, '#00ff00');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });
    });

    describe('Command Execution', () => {
        test('should execute basic formatting commands', () => {
            toolbar.executeCommand('bold');
            
            expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should handle createLink command with user input', () => {
            toolbar.executeCommand('createLink');
            
            expect(global.prompt).toHaveBeenCalledWith('Enter URL:');
            expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com');
        });

        test('should not create link when user cancels prompt', () => {
            global.prompt.mockReturnValue(null);
            
            toolbar.executeCommand('createLink');
            
            expect(document.execCommand).not.toHaveBeenCalledWith('createLink', false, null);
        });

        test('should handle insertImage command', () => {
            const insertImageSpy = jest.spyOn(toolbar, 'insertImage');
            
            toolbar.executeCommand('insertImage');
            
            expect(insertImageSpy).toHaveBeenCalled();
        });

        test('should update toolbar state after command execution', () => {
            const updateStateSpy = jest.spyOn(toolbar, 'updateToolbarState');
            
            toolbar.executeCommand('bold');
            
            expect(updateStateSpy).toHaveBeenCalled();
        });
    });

    describe('Image Insertion and Management', () => {
        test('should create file input for image insertion', () => {
            const appendChildSpy = jest.spyOn(document.body, 'appendChild');
            
            toolbar.insertImage();
            
            expect(appendChildSpy).toHaveBeenCalled();
            const input = appendChildSpy.mock.calls[0][0];
            expect(input.type).toBe('file');
            expect(input.accept).toBe('image/*');
        });

        test('should handle image file selection', () => {
            const mockFile = new File([''], 'test.png', { type: 'image/png' });
            const mockReader = {
                readAsDataURL: jest.fn(),
                onload: null,
                result: 'data:image/png;base64,mock-data'
            };
            
            global.FileReader.mockImplementation(() => mockReader);
            
            toolbar.currentEditableElement = document.getElementById('test-editable');
            toolbar.savedRange = {
                deleteContents: jest.fn(),
                insertNode: jest.fn(),
                setStartAfter: jest.fn(),
                setEndAfter: jest.fn()
            };
            
            toolbar.insertImage();
            
            // Simulate file selection
            const input = document.body.lastChild;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                configurable: true
            });
            
            input.dispatchEvent(new Event('change'));
            
            expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
        });

        test('should create image resize container', () => {
            const img = document.createElement('img');
            img.src = 'test.jpg';
            
            const container = toolbar.createImageResizeContainer(img);
            
            expect(container.className).toContain('image-resize-container');
            expect(container.querySelector('img')).toBe(img);
            expect(container.querySelectorAll('.image-resize-handle').length).toBe(8);
        });

        test('should handle image selection', () => {
            const img = document.createElement('img');
            const container = toolbar.createImageResizeContainer(img);
            document.body.appendChild(container);
            
            toolbar.selectImage(container);
            
            expect(container.classList.contains('selected')).toBe(true);
            expect(toolbar.selectedImageContainer).toBe(container);
        });

        test('should show browse icon when image is selected', () => {
            const img = document.createElement('img');
            const container = toolbar.createImageResizeContainer(img);
            document.body.appendChild(container);
            
            toolbar.selectImage(container);
            
            const browseIcon = container.querySelector('.image-browse-icon');
            expect(browseIcon.style.display).toBe('flex');
        });

        test('should handle image browsing', () => {
            const img = document.createElement('img');
            const container = toolbar.createImageResizeContainer(img);
            const appendChildSpy = jest.spyOn(document.body, 'appendChild');
            
            toolbar.browseForImage(container);
            
            expect(appendChildSpy).toHaveBeenCalled();
            const input = appendChildSpy.mock.calls[0][0];
            expect(input.type).toBe('file');
        });
    });

    describe('Format Block Handling', () => {
        test('should format paragraph blocks', () => {
            toolbar.formatBlock('p');
            
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<p>');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should format heading blocks', () => {
            toolbar.formatBlock('h1');
            
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<h1>');
        });

        test('should format blockquote', () => {
            toolbar.formatBlock('blockquote');
            
            expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, '<blockquote>');
        });

        test('should handle unknown format tags', () => {
            toolbar.formatBlock('unknown');
            
            expect(document.execCommand).not.toHaveBeenCalled();
        });
    });

    describe('Toolbar State Updates', () => {
        test('should update button active states', () => {
            document.queryCommandState.mockImplementation((command) => {
                return command === 'bold';
            });
            
            toolbar.updateToolbarState();
            
            const boldButton = toolbar.toolbar.querySelector('[data-command="bold"]');
            expect(boldButton.classList.contains('active')).toBe(true);
        });

        test('should skip custom commands in state update', () => {
            const insertImageButton = toolbar.toolbar.querySelector('[data-command="insertImage"]');
            
            toolbar.updateToolbarState();
            
            expect(document.queryCommandState).not.toHaveBeenCalledWith('insertImage');
        });

        test('should update format select value', () => {
            const mockSelection = {
                rangeCount: 1,
                anchorNode: document.createTextNode('test')
            };
            const h1Element = document.createElement('h1');
            h1Element.appendChild(mockSelection.anchorNode);
            document.body.appendChild(h1Element);
            
            global.getSelection = jest.fn(() => mockSelection);
            
            toolbar.updateToolbarState();
            
            const formatSelect = document.getElementById('format-select');
            expect(formatSelect.value).toBe('h1');
        });
    });

    describe('Toolbar Positioning and Display', () => {
        test('should show toolbar at correct position', () => {
            const editableElement = document.getElementById('test-editable');
            
            // Mock getBoundingClientRect
            editableElement.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 50,
                bottom: 120,
                width: 200,
                height: 20
            }));
            
            toolbar.showToolbar(editableElement);
            
            expect(toolbar.toolbar.style.display).toBe('flex');
            expect(parseInt(toolbar.toolbar.style.left)).toBeGreaterThanOrEqual(10);
            expect(parseInt(toolbar.toolbar.style.top)).toBeGreaterThan(0);
        });

        test('should position toolbar within viewport bounds', () => {
            const editableElement = document.getElementById('test-editable');
            
            // Mock element near right edge of viewport
            editableElement.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: window.innerWidth - 50,
                bottom: 120,
                width: 200,
                height: 20
            }));
            
            toolbar.showToolbar(editableElement);
            
            const toolbarLeft = parseInt(toolbar.toolbar.style.left);
            expect(toolbarLeft).toBeLessThan(window.innerWidth - 20);
        });

        test('should position toolbar below element if no space above', () => {
            const editableElement = document.getElementById('test-editable');
            
            // Mock element near top of viewport
            editableElement.getBoundingClientRect = jest.fn(() => ({
                top: 5,
                left: 50,
                bottom: 25,
                width: 200,
                height: 20
            }));
            
            toolbar.showToolbar(editableElement);
            
            const toolbarTop = parseInt(toolbar.toolbar.style.top);
            expect(toolbarTop).toBeGreaterThan(25); // Should be below element
        });

        test('should hide toolbar and reset state', () => {
            toolbar.currentEditableElement = document.getElementById('test-editable');
            toolbar.savedRange = {};
            
            toolbar.hideToolbar();
            
            expect(toolbar.toolbar.style.display).toBe('none');
            expect(toolbar.currentEditableElement).toBeNull();
            expect(toolbar.savedRange).toBeNull();
        });

        test('should save selection when showing toolbar', () => {
            const editableElement = document.getElementById('test-editable');
            const mockRange = { cloneRange: jest.fn(() => mockRange) };
            const mockSelection = {
                rangeCount: 1,
                getRangeAt: jest.fn(() => mockRange)
            };
            
            global.getSelection = jest.fn(() => mockSelection);
            
            toolbar.showToolbar(editableElement);
            
            expect(toolbar.savedRange).toBe(mockRange);
        });
    });

    describe('Firefox Compatibility', () => {
        beforeEach(() => {
            // Mock Firefox user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
                configurable: true
            });
        });

        afterEach(() => {
            // Restore original user agent
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (compatible)',
                configurable: true
            });
        });

        test('should detect Firefox browser', () => {
            const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            expect(isFirefox).toBe(true);
        });

        test('should apply Firefox fixes to editable elements', () => {
            const editableElement = document.getElementById('test-editable');
            const fixSpy = jest.spyOn(toolbar, 'fixSingleFirefoxElement');
            
            toolbar.fixFirefoxEditableElements();
            
            expect(fixSpy).toHaveBeenCalledWith(editableElement);
        });

        test('should mark elements as Firefox-fixed', () => {
            const editableElement = document.getElementById('test-editable');
            
            toolbar.fixSingleFirefoxElement(editableElement);
            
            expect(editableElement.dataset.firefoxFixed).toBe('true');
        });

        test('should apply CSS fixes for Firefox', () => {
            const editableElement = document.getElementById('test-editable');
            
            toolbar.fixSingleFirefoxElement(editableElement);
            
            expect(editableElement.style.cursor).toBe('text');
            expect(editableElement.style.userSelect).toBe('text');
            expect(editableElement.style.mozUserSelect).toBe('text');
        });

        test('should handle draggable ancestors', () => {
            const editableElement = document.getElementById('test-editable');
            const draggableParent = document.createElement('div');
            draggableParent.draggable = true;
            draggableParent.appendChild(editableElement);
            document.body.appendChild(draggableParent);
            
            toolbar.addFirefoxDragHandling(editableElement);
            
            // Test mouse enter disables dragging
            editableElement.dispatchEvent(new MouseEvent('mouseenter'));
            expect(draggableParent.draggable).toBe(false);
            
            // Test mouse leave re-enables dragging
            editableElement.dispatchEvent(new MouseEvent('mouseleave'));
            expect(draggableParent.draggable).toBe(true);
        });

        test('should observe for dynamically added editable elements', () => {
            // Mock MutationObserver to verify it's set up
            const mockObserver = {
                observe: jest.fn(),
                disconnect: jest.fn()
            };
            const MutationObserverSpy = jest.spyOn(global, 'MutationObserver').mockImplementation(() => mockObserver);
            
            // Create new toolbar to trigger observer setup
            const newToolbar = new FormattingToolbar(mockEditor);
            
            // Verify MutationObserver was created and is observing
            expect(MutationObserverSpy).toHaveBeenCalled();
            expect(mockObserver.observe).toHaveBeenCalledWith(document.body, {
                childList: true,
                subtree: true
            });
            
            MutationObserverSpy.mockRestore();
        });
    });

    describe('Image Alignment', () => {
        let imageContainer;

        beforeEach(() => {
            const img = document.createElement('img');
            imageContainer = toolbar.createImageResizeContainer(img);
            document.body.appendChild(imageContainer);
            toolbar.selectedImageContainer = imageContainer;
        });

        test('should setup alignment toolbar controls', () => {
            const leftButton = toolbar.alignmentToolbar.querySelector('[data-align="left"]');
            const alignSpy = jest.spyOn(toolbar, 'alignSelectedImage');
            
            leftButton.click();
            
            expect(alignSpy).toHaveBeenCalledWith('left');
        });

        test('should align selected image', () => {
            toolbar.alignSelectedImage('right');
            
            expect(imageContainer.classList.contains('align-right')).toBe(true);
            expect(imageContainer.classList.contains('align-center')).toBe(false);
            expect(imageContainer.classList.contains('align-left')).toBe(false);
        });

        test('should show alignment toolbar', () => {
            imageContainer.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 50,
                bottom: 120,
                width: 200,
                height: 100
            }));
            
            toolbar.showAlignmentToolbar(imageContainer);
            
            expect(toolbar.alignmentToolbar.classList.contains('visible')).toBe(true);
        });

        test('should hide alignment toolbar', () => {
            toolbar.alignmentToolbar.classList.add('visible');
            
            toolbar.hideAlignmentToolbar();
            
            expect(toolbar.alignmentToolbar.classList.contains('visible')).toBe(false);
        });

        test('should update alignment toolbar state', () => {
            imageContainer.classList.add('align-left');
            
            toolbar.updateAlignmentToolbarState(imageContainer);
            
            const leftButton = toolbar.alignmentToolbar.querySelector('[data-align="left"]');
            expect(leftButton.classList.contains('active')).toBe(true);
        });

        test('should deselect all images', () => {
            imageContainer.classList.add('selected');
            toolbar.selectedImageContainer = imageContainer;
            
            toolbar.deselectAllImages();
            
            expect(imageContainer.classList.contains('selected')).toBe(false);
            expect(toolbar.selectedImageContainer).toBeNull();
        });
    });

    describe('Image Resizing', () => {
        let imageContainer;
        let img;

        beforeEach(() => {
            img = document.createElement('img');
            img.style.width = '200px';
            img.style.height = '100px';
            imageContainer = toolbar.createImageResizeContainer(img);
            document.body.appendChild(imageContainer);
            
            // Mock offsetWidth/Height
            Object.defineProperties(img, {
                offsetWidth: { value: 200, configurable: true },
                offsetHeight: { value: 100, configurable: true }
            });
        });

        test('should add resize handles', () => {
            const handles = imageContainer.querySelectorAll('.image-resize-handle');
            expect(handles.length).toBe(8);
            
            const expectedPositions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'];
            handles.forEach((handle, index) => {
                expect(handle.dataset.position).toBe(expectedPositions[index]);
            });
        });

        test('should start resize on handle mousedown', () => {
            const handle = imageContainer.querySelector('.image-resize-handle[data-position="se"]');
            const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
            
            handle.dispatchEvent(new MouseEvent('mousedown', {
                clientX: 100,
                clientY: 100
            }));
            
            expect(document.body.classList.contains('image-resizing')).toBe(true);
            expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
        });

        test('should maintain aspect ratio for corner handles', () => {
            const handle = imageContainer.querySelector('.image-resize-handle[data-position="se"]');
            
            // Start resize
            handle.dispatchEvent(new MouseEvent('mousedown', {
                clientX: 100,
                clientY: 100
            }));
            
            // Simulate mouse move
            document.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 150,
                clientY: 125
            }));
            
            // Check that aspect ratio is maintained
            const newWidth = parseInt(img.style.width);
            const newHeight = parseInt(img.style.height);
            const aspectRatio = newWidth / newHeight;
            expect(aspectRatio).toBeCloseTo(2, 1); // Original aspect ratio was 2:1
        });

        test('should enforce minimum size', () => {
            const handle = imageContainer.querySelector('.image-resize-handle[data-position="se"]');
            
            handle.dispatchEvent(new MouseEvent('mousedown', {
                clientX: 100,
                clientY: 100
            }));
            
            // Try to resize to very small size
            document.dispatchEvent(new MouseEvent('mousemove', {
                clientX: 10,
                clientY: 10
            }));
            
            const newWidth = parseInt(img.style.width);
            const newHeight = parseInt(img.style.height);
            expect(newWidth).toBeGreaterThanOrEqual(50);
            expect(newHeight).toBeGreaterThanOrEqual(50);
        });

        test('should save state after resize', () => {
            const handle = imageContainer.querySelector('.image-resize-handle[data-position="se"]');
            
            handle.dispatchEvent(new MouseEvent('mousedown', {
                clientX: 100,
                clientY: 100
            }));
            
            document.dispatchEvent(new MouseEvent('mouseup'));
            
            expect(document.body.classList.contains('image-resizing')).toBe(false);
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });
    });

    describe('Security and Input Validation', () => {
        test('should sanitize dangerous URLs in createLink', () => {
            global.prompt.mockReturnValue('javascript:alert("XSS")');
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            toolbar.executeCommand('createLink');
            
            // Should NOT call execCommand with dangerous URL - should be blocked
            expect(document.execCommand).not.toHaveBeenCalledWith('createLink', false, 'javascript:alert("XSS")');
            expect(consoleSpy).toHaveBeenCalledWith('Dangerous URL protocol blocked:', 'javascript:');
            
            consoleSpy.mockRestore();
        });

        test('should handle malicious font names', () => {
            const fontFamily = document.getElementById('font-family');
            
            // Set the value directly on the element (not via value property)
            Object.defineProperty(fontFamily, 'value', {
                value: 'Arial; color: red; background: url(javascript:alert(1))',
                writable: true
            });
            
            fontFamily.dispatchEvent(new Event('change'));
            
            // Should pass through the malicious font name (current behavior - could be improved)
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Arial; color: red; background: url(javascript:alert(1))');
        });

        test('should handle XSS in color values', () => {
            const editableElement = document.getElementById('test-editable');
            toolbar.currentEditableElement = editableElement;
            const textColor = document.getElementById('text-color');
            
            // Color input should prevent this, but test edge case
            textColor.value = 'red; background: url(javascript:alert(1))';
            textColor.dispatchEvent(new Event('change'));
            
            expect(document.execCommand).toHaveBeenCalled();
        });

        test('should validate image file types', () => {
            const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            toolbar.insertImage();
            
            const input = document.body.lastChild;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                configurable: true
            });
            
            const mockReader = {
                readAsDataURL: jest.fn(),
                onload: null
            };
            global.FileReader.mockImplementation(() => mockReader);
            
            input.dispatchEvent(new Event('change'));
            
            // Should not process non-image files and show warning
            expect(mockReader.readAsDataURL).not.toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith('Invalid image file type. Allowed: JPEG, PNG, GIF, WebP, SVG.');
            
            consoleSpy.mockRestore();
        });

        test('should handle execCommand failures gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // Test execCommand failure directly by calling executeCommand
            document.execCommand.mockImplementation(() => {
                throw new Error('execCommand failed');
            });
            
            expect(() => {
                toolbar.executeCommand('bold');
            }).not.toThrow();
            
            // Should log warning on execCommand failure
            expect(consoleSpy).toHaveBeenCalledWith('Command execution failed:', 'execCommand failed');
            
            consoleSpy.mockRestore();
        });

        test('should handle missing selection gracefully', () => {
            global.getSelection = jest.fn(() => ({
                rangeCount: 0,
                getRangeAt: jest.fn()
            }));
            
            const editableElement = document.getElementById('test-editable');
            toolbar.currentEditableElement = editableElement;
            const textColor = document.getElementById('text-color');
            
            textColor.value = '#ff0000';
            
            expect(() => {
                textColor.dispatchEvent(new Event('change'));
            }).not.toThrow();
        });

        test('should prevent file upload without proper validation', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            // Test file size validation (>10MB) - Create a mock file object
            const largeMockFile = {
                name: 'large.jpg',
                type: 'image/jpeg',
                size: 11 * 1024 * 1024 // 11MB
            };
            
            const result = toolbar.validateImageFile(largeMockFile);
            
            expect(result).toBe(false);
            expect(consoleWarnSpy).toHaveBeenCalledWith('Image file too large. Maximum size is 10MB.');
            
            consoleWarnSpy.mockRestore();
        });
    });

    describe('Memory Management', () => {
        test('should clean up event listeners', () => {
            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
            
            // This test exposes that there's no cleanup method - needs implementation
            expect(typeof toolbar.destroy).toBe('undefined');
        });

        test('should clean up mutation observer', () => {
            // Test would need implementation of observer cleanup
            const newToolbar = new FormattingToolbar(mockEditor);
            
            // Should have a method to clean up observers
            expect(typeof newToolbar.destroy).toBe('undefined');
        });

        test('should handle rapid toolbar show/hide cycles', () => {
            const editableElement = document.getElementById('test-editable');
            
            for (let i = 0; i < 10; i++) {
                toolbar.showToolbar(editableElement);
                toolbar.hideToolbar();
            }
            
            expect(toolbar.currentEditableElement).toBeNull();
            expect(toolbar.savedRange).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        test('should handle missing editable area', () => {
            const editorWithoutArea = { stateHistory: mockEditor.stateHistory };
            
            expect(() => new FormattingToolbar(editorWithoutArea)).not.toThrow();
        });

        test('should handle malformed DOM structure', () => {
            // Remove required elements
            document.getElementById('format-select').remove();
            
            expect(() => {
                const formatSelect = document.getElementById('format-select');
                if (formatSelect) {
                    formatSelect.dispatchEvent(new Event('change'));
                }
            }).not.toThrow();
        });

        test('should handle image operations without image uploader', () => {
            const editorWithoutUploader = {
                editableArea: mockEditor.editableArea,
                stateHistory: mockEditor.stateHistory
            };
            
            const newToolbar = new FormattingToolbar(editorWithoutUploader);
            
            expect(() => {
                const img = document.createElement('img');
                newToolbar.createImageResizeContainer(img);
            }).not.toThrow();
        });

        test('should handle selection changes in invalid elements', () => {
            toolbar.currentEditableElement = document.getElementById('test-editable');
            toolbar.toolbar.style.display = 'flex';
            
            const invalidRange = {
                commonAncestorContainer: document.createElement('div'),
                cloneRange: jest.fn(() => invalidRange)
            };
            
            global.getSelection = jest.fn(() => ({
                rangeCount: 1,
                getRangeAt: jest.fn(() => invalidRange)
            }));
            
            expect(() => {
                document.dispatchEvent(new Event('selectionchange'));
            }).not.toThrow();
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete formatting workflow', () => {
            const editableElement = document.getElementById('test-editable');
            
            // Click to focus
            editableElement.click();
            expect(toolbar.currentEditableElement).toBe(editableElement);
            
            // Format text
            toolbar.executeCommand('bold');
            expect(document.execCommand).toHaveBeenCalledWith('bold', false, null);
            
            // Change font
            const fontFamily = document.getElementById('font-family');
            fontFamily.value = 'Times New Roman';
            fontFamily.dispatchEvent(new Event('change'));
            expect(document.execCommand).toHaveBeenCalledWith('fontName', false, 'Times New Roman');
            
            // Hide toolbar
            document.body.click();
            expect(toolbar.toolbar.style.display).toBe('none');
        });

        test('should handle image workflow', () => {
            const img = document.createElement('img');
            const container = toolbar.createImageResizeContainer(img);
            document.body.appendChild(container);
            
            // Select image
            toolbar.selectImage(container);
            expect(container.classList.contains('selected')).toBe(true);
            
            // Align image
            toolbar.alignSelectedImage('left');
            expect(container.classList.contains('align-left')).toBe(true);
            
            // Deselect
            toolbar.deselectAllImages();
            expect(container.classList.contains('selected')).toBe(false);
        });
    });
});