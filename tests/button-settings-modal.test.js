import { ButtonSettingsModal } from '../js/button-settings-modal.js';

describe('ButtonSettingsModal', () => {
    let modal;
    let mockEditor;
    let mockButton;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '';
        
        // Create mock button
        mockButton = document.createElement('button');
        mockButton.textContent = 'Test Button';
        mockButton.style.backgroundColor = 'rgb(59, 130, 246)';
        mockButton.style.color = 'rgb(255, 255, 255)';
        mockButton.style.borderRadius = '4px';
        mockButton.style.padding = '10px 20px';
        mockButton.style.fontSize = '16px';
        mockButton.setAttribute('data-url', 'https://example.com');
        mockButton.setAttribute('data-target', '_blank');
        document.body.appendChild(mockButton);
        
        // Mock editor with stateHistory
        mockEditor = {
            stateHistory: {
                saveState: jest.fn()
            }
        };
        
        modal = new ButtonSettingsModal(mockEditor);
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with editor reference', () => {
            expect(modal.editor).toBe(mockEditor);
        });

        test('should create modal element', () => {
            expect(modal.modal).toBeTruthy();
            expect(modal.modal.className).toBe('modal');
        });

        test('should have correct size presets', () => {
            expect(modal.sizePresets).toEqual({
                xs: { padding: '4px 8px', fontSize: '12px' },
                sm: { padding: '6px 12px', fontSize: '14px' },
                md: { padding: '10px 20px', fontSize: '16px' },
                lg: { padding: '12px 28px', fontSize: '18px' }
            });
        });

        test('should attach modal to document body', () => {
            expect(document.body.contains(modal.modal)).toBe(true);
        });

        test('should have correct modal structure', () => {
            expect(modal.modal.querySelector('.modal-header')).toBeTruthy();
            expect(modal.modal.querySelector('.modal-body')).toBeTruthy();
            expect(modal.modal.querySelector('.modal-footer')).toBeTruthy();
            expect(modal.modal.querySelector('h2').textContent).toBe('Button Settings');
        });
    });

    describe('Form Controls Creation', () => {
        test('should create button text input', () => {
            const textInput = modal.modal.querySelector('#button-text');
            expect(textInput).toBeTruthy();
            expect(textInput.type).toBe('text');
        });

        test('should create button URL input', () => {
            const urlInput = modal.modal.querySelector('#button-url');
            expect(urlInput).toBeTruthy();
            expect(urlInput.type).toBe('url');
        });

        test('should create color picker controls', () => {
            expect(modal.modal.querySelector('#button-bg-color')).toBeTruthy();
            expect(modal.modal.querySelector('#button-text-color')).toBeTruthy();
        });

        test('should create border radius controls', () => {
            expect(modal.modal.querySelector('#button-border-radius')).toBeTruthy();
            expect(modal.modal.querySelector('#button-border-radius-number')).toBeTruthy();
            expect(modal.modal.querySelector('#border-radius-value')).toBeTruthy();
        });

        test('should create size and target selects', () => {
            const sizeSelect = modal.modal.querySelector('#button-size');
            const targetSelect = modal.modal.querySelector('#button-target');
            expect(sizeSelect).toBeTruthy();
            expect(targetSelect).toBeTruthy();
            expect(sizeSelect.options.length).toBe(4);
            expect(targetSelect.options.length).toBe(2);
        });

        test('should create action buttons', () => {
            expect(modal.modal.querySelector('.modal-cancel')).toBeTruthy();
            expect(modal.modal.querySelector('.modal-apply')).toBeTruthy();
            expect(modal.modal.querySelector('.modal-close')).toBeTruthy();
        });
    });

    describe('Modal Opening and Loading', () => {
        test('should open modal and set target button', () => {
            modal.open(mockButton);
            
            expect(modal.targetButton).toBe(mockButton);
            expect(modal.modal.classList.contains('active')).toBe(true);
        });

        test('should load current button settings', () => {
            modal.open(mockButton);
            
            expect(modal.modal.querySelector('#button-text').value).toBe('Test Button');
            expect(modal.modal.querySelector('#button-url').value).toBe('https://example.com');
            expect(modal.modal.querySelector('#button-bg-color').value).toBe('#3b82f6');
            expect(modal.modal.querySelector('#button-text-color').value).toBe('#ffffff');
            expect(modal.modal.querySelector('#button-target').value).toBe('_blank');
        });

        test('should store original values for cancel functionality', () => {
            modal.open(mockButton);
            
            expect(modal.originalValues).toEqual({
                text: 'Test Button',
                bgColor: 'rgb(59, 130, 246)',
                textColor: 'rgb(255, 255, 255)',
                borderRadius: '4px',
                padding: '10px 20px',
                fontSize: '16px',
                url: 'https://example.com',
                target: '_blank'
            });
        });

        test('should handle button with no URL', () => {
            mockButton.removeAttribute('data-url');
            mockButton.removeAttribute('data-target');
            
            modal.open(mockButton);
            
            expect(modal.modal.querySelector('#button-url').value).toBe('');
            expect(modal.modal.querySelector('#button-target').value).toBe('_self');
        });

        test('should detect button size from current styles', () => {
            mockButton.style.padding = '4px 8px';
            mockButton.style.fontSize = '12px';
            
            modal.open(mockButton);
            
            expect(modal.modal.querySelector('#button-size').value).toBe('xs');
        });

        test('should handle Edge browser compatibility', () => {
            const originalUserAgent = window.navigator.userAgent;
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 Edge/18.0',
                configurable: true
            });
            
            modal.open(mockButton);
            
            expect(modal.edgeModal).toBeTruthy();
            expect(modal.modal.style.display).toBe('none');
            
            Object.defineProperty(window.navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true
            });
        });

        test('should force reflow for animation', () => {
            const offsetHeightSpy = jest.spyOn(modal.modal, 'offsetHeight', 'get');
            
            modal.open(mockButton);
            
            expect(offsetHeightSpy).toHaveBeenCalled();
        });
    });

    describe('Live Preview Functionality', () => {
        beforeEach(() => {
            modal.open(mockButton);
        });

        test('should update button text in real-time', () => {
            const textInput = modal.modal.querySelector('#button-text');
            
            textInput.value = 'New Text';
            textInput.dispatchEvent(new Event('input'));
            
            expect(mockButton.textContent).toBe('New Text');
        });

        test('should update background color in real-time', () => {
            const bgColorInput = modal.modal.querySelector('#button-bg-color');
            
            bgColorInput.value = '#ff0000';
            bgColorInput.dispatchEvent(new Event('input'));
            
            expect(mockButton.style.backgroundColor).toBe('rgb(255, 0, 0)');
        });

        test('should update text color in real-time', () => {
            const textColorInput = modal.modal.querySelector('#button-text-color');
            
            textColorInput.value = '#000000';
            textColorInput.dispatchEvent(new Event('input'));
            
            expect(mockButton.style.color).toBe('rgb(0, 0, 0)');
        });

        test('should update border radius with slider', () => {
            const borderRadiusSlider = modal.modal.querySelector('#button-border-radius');
            const borderRadiusValue = modal.modal.querySelector('#border-radius-value');
            const borderRadiusNumber = modal.modal.querySelector('#button-border-radius-number');
            
            borderRadiusSlider.value = '10';
            borderRadiusSlider.dispatchEvent(new Event('input'));
            
            expect(borderRadiusValue.textContent).toBe('10');
            expect(borderRadiusNumber.value).toBe('10');
            expect(mockButton.style.borderRadius).toBe('10px');
        });

        test('should update border radius with number input', () => {
            const borderRadiusSlider = modal.modal.querySelector('#button-border-radius');
            const borderRadiusValue = modal.modal.querySelector('#border-radius-value');
            const borderRadiusNumber = modal.modal.querySelector('#button-border-radius-number');
            
            borderRadiusNumber.value = '15';
            borderRadiusNumber.dispatchEvent(new Event('input'));
            
            expect(borderRadiusSlider.value).toBe('15');
            expect(borderRadiusValue.textContent).toBe('15');
            expect(mockButton.style.borderRadius).toBe('15px');
        });

        test('should clamp border radius number input', () => {
            const borderRadiusNumber = modal.modal.querySelector('#button-border-radius-number');
            const borderRadiusSlider = modal.modal.querySelector('#button-border-radius');
            
            borderRadiusNumber.value = '100'; // Above max of 50
            borderRadiusNumber.dispatchEvent(new Event('input'));
            
            expect(borderRadiusSlider.value).toBe('50');
        });

        test('should update button size in real-time', () => {
            const sizeSelect = modal.modal.querySelector('#button-size');
            
            sizeSelect.value = 'lg';
            sizeSelect.dispatchEvent(new Event('change'));
            
            expect(mockButton.style.padding).toBe('12px 28px');
            expect(mockButton.style.fontSize).toBe('18px');
        });

        test('should default to "Button" when text is empty', () => {
            const textInput = modal.modal.querySelector('#button-text');
            
            textInput.value = '';
            textInput.dispatchEvent(new Event('input'));
            
            expect(mockButton.textContent).toBe('Button');
        });
    });

    describe('Modal Closing and Canceling', () => {
        test('should close modal and reset state', () => {
            modal.open(mockButton);
            modal.close();
            
            expect(modal.modal.classList.contains('active')).toBe(false);
            expect(modal.targetButton).toBeNull();
            expect(modal.originalValues).toBeNull();
        });

        test('should cancel and restore original values', () => {
            modal.open(mockButton);
            
            // Make changes
            mockButton.textContent = 'Changed Text';
            mockButton.style.backgroundColor = 'red';
            
            modal.cancel();
            
            expect(mockButton.textContent).toBe('Test Button');
            expect(mockButton.style.backgroundColor).toBe('rgb(59, 130, 246)');
        });

        test('should handle cancel with no target button', () => {
            modal.targetButton = null;
            modal.originalValues = null;
            
            expect(() => modal.cancel()).not.toThrow();
        });

        test('should close modal on background click', () => {
            modal.open(mockButton);
            const cancelSpy = jest.spyOn(modal, 'cancel');
            
            modal.modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            expect(cancelSpy).toHaveBeenCalled();
        });

        test('should not close modal when clicking modal content', () => {
            modal.open(mockButton);
            const cancelSpy = jest.spyOn(modal, 'cancel');
            const modalContent = modal.modal.querySelector('.modal-content');
            
            modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            expect(cancelSpy).not.toHaveBeenCalled();
        });

        test('should close modal on Escape key', () => {
            modal.open(mockButton);
            const cancelSpy = jest.spyOn(modal, 'cancel');
            
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            
            expect(cancelSpy).toHaveBeenCalled();
        });

        test('should clean up Edge modal on close', () => {
            const originalUserAgent = window.navigator.userAgent;
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 Edge/18.0',
                configurable: true
            });
            
            modal.open(mockButton);
            expect(modal.edgeModal).toBeTruthy();
            
            modal.close();
            expect(modal.edgeModal).toBeNull();
            
            Object.defineProperty(window.navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true
            });
        });
    });

    describe('Apply Changes Functionality', () => {
        beforeEach(() => {
            modal.open(mockButton);
        });

        test('should apply all button changes', () => {
            // Set form values
            modal.modal.querySelector('#button-text').value = 'New Button Text';
            modal.modal.querySelector('#button-url').value = 'https://newsite.com';
            modal.modal.querySelector('#button-bg-color').value = '#ff0000';
            modal.modal.querySelector('#button-text-color').value = '#000000';
            modal.modal.querySelector('#button-border-radius').value = '8';
            modal.modal.querySelector('#button-size').value = 'lg';
            modal.modal.querySelector('#button-target').value = '_blank';
            
            modal.applyChanges();
            
            expect(mockButton.textContent).toBe('New Button Text');
            expect(mockButton.style.backgroundColor).toBe('rgb(255, 0, 0)');
            expect(mockButton.style.color).toBe('rgb(0, 0, 0)');
            expect(mockButton.style.borderRadius).toBe('8px');
            expect(mockButton.style.padding).toBe('12px 28px');
            expect(mockButton.style.fontSize).toBe('18px');
            expect(mockButton.getAttribute('data-url')).toBe('https://newsite.com');
            expect(mockButton.getAttribute('data-target')).toBe('_blank');
        });

        test('should remove URL attributes when URL is empty', () => {
            modal.modal.querySelector('#button-url').value = '';
            
            modal.applyChanges();
            
            expect(mockButton.getAttribute('data-url')).toBeNull();
            expect(mockButton.getAttribute('data-target')).toBeNull();
        });

        test('should save state after applying changes', () => {
            modal.applyChanges();
            
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should close modal after applying changes', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            
            modal.applyChanges();
            
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should remove existing click handlers', () => {
            modal.open(mockButton);
            mockButton.onclick = jest.fn();
            const originalButton = mockButton;
            
            modal.applyChanges();
            
            // Button should be replaced with a clone if it has a parent
            if (originalButton.parentNode) {
                expect(modal.targetButton).not.toBe(originalButton);
                expect(modal.targetButton.onclick).toBeNull();
            }
        });
    });

    describe('RGB to Hex Conversion', () => {
        test('should convert RGB to hex', () => {
            expect(modal.rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
            expect(modal.rgbToHex('rgb(0, 255, 0)')).toBe('#00ff00');
            expect(modal.rgbToHex('rgb(0, 0, 255)')).toBe('#0000ff');
        });

        test('should return hex values unchanged', () => {
            expect(modal.rgbToHex('#ff0000')).toBe('#ff0000');
            expect(modal.rgbToHex('#00ff00')).toBe('#00ff00');
        });

        test('should handle invalid RGB values', () => {
            expect(modal.rgbToHex('invalid')).toBeNull();
            expect(modal.rgbToHex('')).toBeNull();
            expect(modal.rgbToHex(null)).toBeNull();
            expect(modal.rgbToHex(undefined)).toBeNull();
        });

        test('should handle RGB with spaces', () => {
            expect(modal.rgbToHex('rgb(255, 128, 64)')).toBe('#ff8040');
        });
    });

    describe('Edge Browser Support', () => {
        beforeEach(() => {
            // Mock Edge user agent
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 Edge/18.0',
                configurable: true
            });
        });

        afterEach(() => {
            // Restore original user agent
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 (compatible)',
                configurable: true
            });
        });

        test('should create Edge modal on open', () => {
            modal.open(mockButton);
            
            expect(modal.edgeModal).toBeTruthy();
            expect(modal.modal.style.display).toBe('none');
        });

        test('should populate Edge modal form', () => {
            modal.open(mockButton);
            
            const edgeContent = modal.edgeModal.querySelector('div');
            expect(edgeContent.querySelector('#button-text').value).toBe('Test Button');
            expect(edgeContent.querySelector('#button-url').value).toBe('https://example.com');
        });

        test('should handle Edge modal apply changes', () => {
            modal.open(mockButton);
            
            const edgeContent = modal.edgeModal.querySelector('div');
            edgeContent.querySelector('#button-text').value = 'Edge Button';
            
            modal.applyEdgeChanges();
            
            expect(mockButton.textContent).toBe('Edge Button');
        });

        test('should add drag functionality to Edge modal', () => {
            modal.open(mockButton);
            
            const modalHeader = modal.edgeModal.querySelector('.modal-header');
            expect(modalHeader.style.cursor).toBe('move');
        });

        test('should style Edge modal header', () => {
            modal.open(mockButton);
            
            const modalHeader = modal.edgeModal.querySelector('.modal-header');
            expect(modalHeader.style.display).toBe('flex');
        });
    });

    describe('Security and Input Validation', () => {
        beforeEach(() => {
            modal.open(mockButton);
        });

        test('should block dangerous JavaScript URLs', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.modal.querySelector('#button-url').value = 'javascript:alert("XSS")';
            
            modal.applyChanges();
            
            // Should block the dangerous URL
            expect(consoleWarnSpy).toHaveBeenCalledWith('Dangerous URL protocol blocked:', 'javascript:');
            expect(mockButton.getAttribute('data-url')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should handle XSS attempts in button text', () => {
            modal.modal.querySelector('#button-text').value = '<script>alert("XSS")</script>';
            
            modal.applyChanges();
            
            // Text content is safely handled by textContent property (not innerHTML)
            expect(mockButton.textContent).toBe('<script>alert("XSS")</script>');
            // Verify it's displayed as text, not executed as HTML
            expect(mockButton.innerHTML).not.toContain('<script');
        });

        test('should handle malicious CSS color values', () => {
            const bgColorInput = modal.modal.querySelector('#button-bg-color');
            
            // Attempt to inject CSS
            bgColorInput.value = 'red; background-image: url(javascript:alert(1))';
            bgColorInput.dispatchEvent(new Event('input'));
            
            // Color input should prevent this, but let's verify
            expect(mockButton.style.backgroundColor).not.toContain('javascript:');
        });

        test('should handle invalid color values gracefully', () => {
            const bgColorInput = modal.modal.querySelector('#button-bg-color');
            
            // Set invalid color
            bgColorInput.value = 'invalid-color';
            bgColorInput.dispatchEvent(new Event('input'));
            
            // Should not crash the application
            expect(() => modal.applyChanges()).not.toThrow();
        });

        test('should validate border radius bounds', () => {
            const borderRadiusNumber = modal.modal.querySelector('#button-border-radius-number');
            
            // Test lower bound
            borderRadiusNumber.value = '-10';
            borderRadiusNumber.dispatchEvent(new Event('input'));
            expect(borderRadiusNumber.value).toBe('0');
            
            // Test upper bound
            borderRadiusNumber.value = '100';
            borderRadiusNumber.dispatchEvent(new Event('input'));
            expect(borderRadiusNumber.value).toBe('50');
        });

        test('should handle missing DOM elements gracefully', () => {
            // Remove an element
            const textInput = modal.modal.querySelector('#button-text');
            textInput.remove();
            
            expect(() => modal.applyChanges()).not.toThrow();
        });

        test('should block dangerous data URLs', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.modal.querySelector('#button-url').value = 'data:text/html,<script>alert(1)</script>';
            
            modal.applyChanges();
            
            // Should block data URLs
            expect(consoleWarnSpy).toHaveBeenCalledWith('Dangerous URL protocol blocked:', 'data:');
            expect(mockButton.getAttribute('data-url')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should handle protocol-relative URLs', () => {
            modal.modal.querySelector('#button-url').value = '//example.com/page';
            
            modal.applyChanges();
            
            // Protocol-relative URLs are allowed
            expect(mockButton.getAttribute('data-url')).toBe('//example.com/page');
        });

        test('should block vbscript URLs', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.modal.querySelector('#button-url').value = 'vbscript:msgbox("XSS")';
            
            modal.applyChanges();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('Dangerous URL protocol blocked:', 'vbscript:');
            expect(mockButton.getAttribute('data-url')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should block file URLs', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.modal.querySelector('#button-url').value = 'file:///etc/passwd';
            
            modal.applyChanges();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('Dangerous URL protocol blocked:', 'file:');
            expect(mockButton.getAttribute('data-url')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should allow safe URLs', () => {
            const safeUrls = [
                'https://example.com',
                'http://example.com',
                'mailto:test@example.com',
                'tel:+1234567890',
                '/relative/path',
                '#fragment'
            ];
            
            safeUrls.forEach(url => {
                modal.open(mockButton); // Re-open modal for each test
                modal.modal.querySelector('#button-url').value = url;
                modal.applyChanges();
                expect(mockButton.getAttribute('data-url')).toBe(url);
            });
        });

        test('should add https to URLs without protocol', () => {
            modal.modal.querySelector('#button-url').value = 'example.com';
            
            modal.applyChanges();
            
            expect(mockButton.getAttribute('data-url')).toBe('https://example.com');
        });
    });

    describe('Event Handling', () => {
        test('should close modal on close button click', () => {
            modal.open(mockButton);
            const closeSpy = jest.spyOn(modal, 'close');
            
            modal.modal.querySelector('.modal-close').click();
            
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should cancel modal on cancel button click', () => {
            modal.open(mockButton);
            const cancelSpy = jest.spyOn(modal, 'cancel');
            
            modal.modal.querySelector('.modal-cancel').click();
            
            expect(cancelSpy).toHaveBeenCalled();
        });

        test('should apply changes on apply button click', () => {
            modal.open(mockButton);
            const applySpy = jest.spyOn(modal, 'applyChanges');
            
            modal.modal.querySelector('.modal-apply').click();
            
            expect(applySpy).toHaveBeenCalled();
        });

        test('should handle rapid input changes', () => {
            modal.open(mockButton);
            const textInput = modal.modal.querySelector('#button-text');
            
            // Rapid fire multiple input events
            for (let i = 0; i < 10; i++) {
                textInput.value = `Text ${i}`;
                textInput.dispatchEvent(new Event('input'));
            }
            
            expect(mockButton.textContent).toBe('Text 9');
        });
    });

    describe('Edge Cases', () => {
        test('should handle button with no existing styles', () => {
            const plainButton = document.createElement('button');
            plainButton.textContent = 'Plain Button';
            document.body.appendChild(plainButton);
            
            expect(() => modal.open(plainButton)).not.toThrow();
            
            // Empty styles become empty strings, not undefined
            expect(modal.originalValues.bgColor).toBe('');
            expect(modal.originalValues.textColor).toBe('');
            // Should set default values in form
            expect(modal.modal.querySelector('#button-bg-color').value).toBe('#3b82f6');
        });

        test('should handle button with malformed styles', () => {
            mockButton.style.borderRadius = 'invalid-value';
            
            expect(() => modal.open(mockButton)).not.toThrow();
        });

        test('should handle missing stateHistory', () => {
            modal.editor.stateHistory = null;
            modal.open(mockButton);
            
            expect(() => modal.applyChanges()).not.toThrow();
            // Should not crash and should still close modal
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should handle concurrent modal operations', () => {
            modal.open(mockButton);
            
            // Try to open again while already open
            expect(() => modal.open(mockButton)).not.toThrow();
        });

        test('should handle detached button element', () => {
            modal.open(mockButton);
            mockButton.remove(); // Remove after opening
            
            expect(() => modal.applyChanges()).not.toThrow();
            // Should handle the case where parentNode is null
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete user workflow', () => {
            // Open modal
            modal.open(mockButton);
            expect(modal.modal.classList.contains('active')).toBe(true);
            
            // Make changes
            modal.modal.querySelector('#button-text').value = 'Final Button';
            modal.modal.querySelector('#button-bg-color').value = '#00ff00';
            modal.modal.querySelector('#button-size').value = 'lg';
            
            // Apply changes
            modal.applyChanges();
            
            expect(mockButton.textContent).toBe('Final Button');
            expect(mockButton.style.backgroundColor).toBe('rgb(0, 255, 0)');
            expect(mockButton.style.padding).toBe('12px 28px');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should maintain form state across modal opens', () => {
            // First open and change
            modal.open(mockButton);
            modal.modal.querySelector('#button-text').value = 'Modified';
            modal.applyChanges();
            
            // Second open should load the applied settings
            modal.open(mockButton);
            expect(modal.modal.querySelector('#button-text').value).toBe('Modified');
        });

        test('should work with different button configurations', () => {
            // Test with various button setups
            const configurations = [
                { padding: '4px 8px', fontSize: '12px', expected: 'xs' },
                { padding: '6px 12px', fontSize: '14px', expected: 'sm' },
                { padding: '10px 20px', fontSize: '16px', expected: 'md' },
                { padding: '12px 28px', fontSize: '18px', expected: 'lg' }
            ];
            
            configurations.forEach(config => {
                mockButton.style.padding = config.padding;
                mockButton.style.fontSize = config.fontSize;
                
                modal.open(mockButton);
                expect(modal.modal.querySelector('#button-size').value).toBe(config.expected);
                modal.close();
            });
        });
    });

    describe('Memory Management', () => {
        test('should not create memory leaks with event listeners', () => {
            // Create and destroy multiple modals
            for (let i = 0; i < 5; i++) {
                const testModal = new ButtonSettingsModal(mockEditor);
                testModal.open(mockButton);
                testModal.close();
            }
            
            // Should not accumulate listeners
            expect(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }).not.toThrow();
        });

        test('should clean up Edge modal listeners', () => {
            const originalUserAgent = window.navigator.userAgent;
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 Edge/18.0',
                configurable: true
            });
            
            modal.open(mockButton);
            modal.close();
            
            // Should not have lingering escape handlers
            expect(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            }).not.toThrow();
            
            Object.defineProperty(window.navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true
            });
        });
    });
});