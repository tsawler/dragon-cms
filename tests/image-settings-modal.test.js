import { ImageSettingsModal } from '../js/image-settings-modal.js';
import { Utilities } from '../js/utilities.js';

describe('ImageSettingsModal', () => {
    let modal;
    let mockEditor;
    let mockContainer;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '';
        
        // Create mock container with image
        mockContainer = document.createElement('div');
        mockContainer.className = 'resize-container';
        const img = document.createElement('img');
        img.src = 'test.jpg';
        mockContainer.appendChild(img);
        document.body.appendChild(mockContainer);
        
        // Mock editor with stateHistory
        mockEditor = {
            stateHistory: {
                saveState: jest.fn()
            }
        };
        
        modal = new ImageSettingsModal(mockEditor);
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
            const modalEl = document.getElementById('image-settings-modal');
            expect(modalEl).toBeTruthy();
            expect(modalEl.className).toBe('modal');
        });

        test('should have correct modal structure', () => {
            const modalEl = modal.modal;
            expect(modalEl.querySelector('.modal-header')).toBeTruthy();
            expect(modalEl.querySelector('.modal-body')).toBeTruthy();
            expect(modalEl.querySelector('.modal-footer')).toBeTruthy();
            expect(modalEl.querySelector('h2').textContent).toBe('Image Settings');
        });

        test('should attach modal to document body', () => {
            const modalEl = document.getElementById('image-settings-modal');
            expect(document.body.contains(modalEl)).toBe(true);
        });
    });

    describe('Form Controls Creation', () => {
        test('should create background color controls', () => {
            expect(modal.modal.querySelector('#image-bg-color')).toBeTruthy();
            expect(modal.modal.querySelector('#image-bg-color-text')).toBeTruthy();
        });

        test('should create padding control', () => {
            const padding = modal.modal.querySelector('#image-padding');
            expect(padding).toBeTruthy();
            expect(padding.type).toBe('range');
            expect(padding.min).toBe('0');
            expect(padding.max).toBe('50');
        });

        test('should create border controls', () => {
            expect(modal.modal.querySelector('#image-border-width')).toBeTruthy();
            expect(modal.modal.querySelector('#image-border-color')).toBeTruthy();
            expect(modal.modal.querySelector('#image-border-style')).toBeTruthy();
            expect(modal.modal.querySelector('#image-border-radius')).toBeTruthy();
        });

        test('should create shadow control', () => {
            const shadow = modal.modal.querySelector('#image-shadow');
            expect(shadow).toBeTruthy();
            expect(shadow.options.length).toBe(4);
        });

        test('should create opacity control', () => {
            const opacity = modal.modal.querySelector('#image-opacity');
            expect(opacity).toBeTruthy();
            expect(opacity.min).toBe('10');
            expect(opacity.max).toBe('100');
        });

        test('should create action buttons', () => {
            expect(modal.modal.querySelector('#apply-image-settings')).toBeTruthy();
            expect(modal.modal.querySelector('#reset-image-settings')).toBeTruthy();
            expect(modal.modal.querySelector('#cancel-image-settings')).toBeTruthy();
        });
    });

    describe('Event Listeners', () => {
        test('should sync background color picker with text input', () => {
            const colorPicker = modal.modal.querySelector('#image-bg-color');
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            
            colorPicker.value = '#ff0000';
            colorPicker.dispatchEvent(new Event('input'));
            
            expect(colorText.value).toBe('#ff0000');
        });

        test('should sync background color text with picker for valid hex', () => {
            const colorPicker = modal.modal.querySelector('#image-bg-color');
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            
            colorText.value = '#00ff00';
            colorText.dispatchEvent(new Event('input'));
            
            expect(colorPicker.value).toBe('#00ff00');
        });

        test('should handle transparent background color', () => {
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            const updatePreviewSpy = jest.spyOn(modal, 'updatePreview');
            
            colorText.value = 'transparent';
            colorText.dispatchEvent(new Event('input'));
            
            expect(updatePreviewSpy).toHaveBeenCalled();
        });

        test('should ignore invalid color values', () => {
            const colorPicker = modal.modal.querySelector('#image-bg-color');
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            const originalValue = colorPicker.value;
            
            colorText.value = 'invalid-color';
            colorText.dispatchEvent(new Event('input'));
            
            expect(colorPicker.value).toBe(originalValue);
        });

        test('should update padding value display', () => {
            const padding = modal.modal.querySelector('#image-padding');
            const paddingValue = modal.modal.querySelector('#image-padding-value');
            
            padding.value = '25';
            padding.dispatchEvent(new Event('input'));
            
            expect(paddingValue.textContent).toBe('25px');
        });

        test('should handle border style change', () => {
            const borderStyle = modal.modal.querySelector('#image-border-style');
            const updatePreviewSpy = jest.spyOn(modal, 'updatePreview');
            
            borderStyle.value = 'dashed';
            borderStyle.dispatchEvent(new Event('change'));
            
            expect(updatePreviewSpy).toHaveBeenCalled();
        });

        test('should handle shadow change', () => {
            const shadow = modal.modal.querySelector('#image-shadow');
            const updatePreviewSpy = jest.spyOn(modal, 'updatePreview');
            
            shadow.value = 'large';
            shadow.dispatchEvent(new Event('change'));
            
            expect(updatePreviewSpy).toHaveBeenCalled();
        });

        test('should close modal on close button click', () => {
            const closeBtn = modal.modal.querySelector('.modal-close');
            const closeSpy = jest.spyOn(modal, 'close');
            
            closeBtn.click();
            
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should close modal on background click', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            
            modal.modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should not close modal when clicking modal content', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            const modalContent = modal.modal.querySelector('.modal-content');
            
            modalContent.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            
            expect(closeSpy).not.toHaveBeenCalled();
        });
    });

    describe('Modal Opening and Loading', () => {
        test('should open modal and set target container', () => {
            modal.open(mockContainer);
            
            expect(modal.targetContainer).toBe(mockContainer);
            expect(modal.modal.classList.contains('active')).toBe(true);
        });

        test('should load current settings from container', () => {
            mockContainer.style.backgroundColor = 'rgb(255, 0, 0)';
            mockContainer.style.padding = '20px';
            mockContainer.style.border = '2px solid rgb(0, 255, 0)';
            mockContainer.style.opacity = '0.8';
            
            modal.open(mockContainer);
            
            expect(modal.modal.querySelector('#image-bg-color').value).toBe('#ff0000');
            expect(modal.modal.querySelector('#image-padding').value).toBe('20');
            expect(modal.modal.querySelector('#image-border-width').value).toBe('2');
            expect(modal.modal.querySelector('#image-opacity').value).toBe('80');
        });

        test('should handle Edge browser compatibility', () => {
            const originalUserAgent = window.navigator.userAgent;
            Object.defineProperty(window.navigator, 'userAgent', {
                value: 'Mozilla/5.0 Edge/18.0',
                configurable: true
            });
            
            modal.open(mockContainer);
            
            expect(modal.modal.style.display).toBe('block');
            
            Object.defineProperty(window.navigator, 'userAgent', {
                value: originalUserAgent,
                configurable: true
            });
        });

        test('should force reflow for animation', () => {
            const offsetHeightSpy = jest.spyOn(modal.modal, 'offsetHeight', 'get');
            
            modal.open(mockContainer);
            
            expect(offsetHeightSpy).toHaveBeenCalled();
        });
    });

    describe('Modal Closing', () => {
        test('should close modal and reset state', () => {
            modal.open(mockContainer);
            modal.close();
            
            expect(modal.modal.classList.contains('active')).toBe(false);
            expect(modal.targetContainer).toBeNull();
        });

        test('should clear inline display style', () => {
            modal.modal.style.display = 'block';
            modal.close();
            
            expect(modal.modal.style.display).toBe('');
        });
    });

    describe('Settings Update and Preview', () => {
        beforeEach(() => {
            modal.open(mockContainer);
        });

        test('should update preview with current settings', () => {
            modal.modal.querySelector('#image-bg-color').value = '#ff0000';
            modal.modal.querySelector('#image-bg-color-text').value = '#ff0000';
            modal.modal.querySelector('#image-padding').value = '15';
            modal.modal.querySelector('#image-border-width').value = '3';
            modal.modal.querySelector('#image-border-style').value = 'solid';
            modal.modal.querySelector('#image-border-color').value = '#000000';
            
            modal.updatePreview();
            
            expect(mockContainer.style.backgroundColor).toBe('rgb(255, 0, 0)');
            expect(mockContainer.style.padding).toBe('15px');
            expect(mockContainer.style.border).toBe('3px solid rgb(0, 0, 0)');
        });

        test('should handle transparent background', () => {
            modal.modal.querySelector('#image-bg-color-text').value = 'transparent';
            
            modal.updatePreview();
            
            expect(mockContainer.style.backgroundColor).toBe('transparent');
        });

        test('should apply shadow styles', () => {
            modal.modal.querySelector('#image-shadow').value = 'medium';
            
            modal.updatePreview();
            
            expect(mockContainer.style.boxShadow).toBe('0 4px 8px rgba(0,0,0,0.15)');
        });

        test('should apply border radius to both container and image', () => {
            const img = mockContainer.querySelector('img');
            modal.modal.querySelector('#image-border-radius').value = '10';
            
            modal.updatePreview();
            
            expect(mockContainer.style.borderRadius).toBe('10px');
            expect(img.style.borderRadius).toBe('10px');
        });

        test('should handle no border when width is 0', () => {
            modal.modal.querySelector('#image-border-width').value = '0';
            modal.modal.querySelector('#image-border-style').value = 'solid';
            modal.modal.querySelector('#image-border-color').value = '#000000';
            
            modal.updatePreview();
            
            // Border should be none or empty when width is 0
            expect(mockContainer.style.border === 'none' || mockContainer.style.border === '').toBeTruthy();
        });

        test('should not update if no target container', () => {
            modal.targetContainer = null;
            
            expect(() => modal.updatePreview()).not.toThrow();
        });
    });

    describe('Apply Settings', () => {
        test('should apply settings and save state', () => {
            modal.open(mockContainer);
            modal.modal.querySelector('#image-padding').value = '30';
            
            modal.applySettings();
            
            expect(mockContainer.style.padding).toBe('30px');
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should handle missing stateHistory', () => {
            modal.editor.stateHistory = null;
            modal.open(mockContainer);
            
            expect(() => modal.applySettings()).not.toThrow();
        });

        test('should handle missing editor', () => {
            modal.editor = null;
            modal.open(mockContainer);
            
            expect(() => modal.applySettings()).not.toThrow();
        });
    });

    describe('Reset Settings', () => {
        test('should reset all settings to defaults', () => {
            modal.open(mockContainer);
            
            // Change settings
            modal.modal.querySelector('#image-padding').value = '40';
            modal.modal.querySelector('#image-border-width').value = '5';
            modal.modal.querySelector('#image-opacity').value = '50';
            
            // Reset
            modal.resetSettings();
            
            // Check defaults
            expect(modal.modal.querySelector('#image-bg-color-text').value).toBe('transparent');
            expect(modal.modal.querySelector('#image-padding').value).toBe('10');
            expect(modal.modal.querySelector('#image-border-width').value).toBe('0');
            expect(modal.modal.querySelector('#image-opacity').value).toBe('100');
        });

        test('should update preview after reset', () => {
            modal.open(mockContainer);
            const updatePreviewSpy = jest.spyOn(modal, 'updatePreview');
            
            modal.resetSettings();
            
            expect(updatePreviewSpy).toHaveBeenCalled();
        });
    });

    describe('RGB to Hex Conversion', () => {
        test('should convert RGB to hex', () => {
            expect(Utilities.Color.rgbToHex('rgb(255, 0, 0)')).toBe('#ff0000');
            expect(Utilities.Color.rgbToHex('rgb(0, 255, 0)')).toBe('#00ff00');
            expect(Utilities.Color.rgbToHex('rgb(0, 0, 255)')).toBe('#0000ff');
        });

        test('should handle transparent values', () => {
            expect(Utilities.Color.rgbToHex('transparent')).toBe('transparent');
            expect(Utilities.Color.rgbToHex('rgba(0, 0, 0, 0)')).toBe('transparent');
        });

        test('should handle invalid RGB values', () => {
            expect(Utilities.Color.rgbToHex('invalid')).toBe('#ffffff');
            expect(Utilities.Color.rgbToHex(null)).toBe('transparent');
            expect(Utilities.Color.rgbToHex(undefined)).toBe('transparent');
        });

        test('should handle RGBA with opacity', () => {
            expect(Utilities.Color.rgbToHex('rgba(255, 0, 0, 0.5)')).toBe('#ff0000');
        });
    });

    describe('Button Hover Effects', () => {
        test('should apply hover effect on cancel button', () => {
            const cancelBtn = modal.modal.querySelector('#cancel-image-settings');
            
            cancelBtn.dispatchEvent(new MouseEvent('mouseenter'));
            expect(cancelBtn.style.backgroundColor).toBe('rgb(248, 248, 248)');
            
            cancelBtn.dispatchEvent(new MouseEvent('mouseleave'));
            expect(cancelBtn.style.backgroundColor).toBe('white');
        });

        test('should apply hover effect on reset button', () => {
            const resetBtn = modal.modal.querySelector('#reset-image-settings');
            
            resetBtn.dispatchEvent(new MouseEvent('mouseenter'));
            expect(resetBtn.style.backgroundColor).toBe('rgb(248, 248, 248)');
            
            resetBtn.dispatchEvent(new MouseEvent('mouseleave'));
            expect(resetBtn.style.backgroundColor).toBe('white');
        });

        test('should apply hover effect on apply button', () => {
            const applyBtn = modal.modal.querySelector('#apply-image-settings');
            
            applyBtn.dispatchEvent(new MouseEvent('mouseenter'));
            expect(applyBtn.style.backgroundColor).toBe('rgb(37, 99, 235)');
            
            applyBtn.dispatchEvent(new MouseEvent('mouseleave'));
            expect(applyBtn.style.backgroundColor).toBe('rgb(59, 130, 246)');
        });
    });

    describe('Get Current Settings', () => {
        test('should return current form values', () => {
            modal.modal.querySelector('#image-bg-color').value = '#123456';
            modal.modal.querySelector('#image-bg-color-text').value = '#123456';
            modal.modal.querySelector('#image-padding').value = '25';
            modal.modal.querySelector('#image-border-width').value = '3';
            modal.modal.querySelector('#image-border-color').value = '#654321';
            modal.modal.querySelector('#image-border-style').value = 'dashed';
            modal.modal.querySelector('#image-border-radius').value = '8';
            modal.modal.querySelector('#image-shadow').value = 'large';
            modal.modal.querySelector('#image-opacity').value = '75';
            
            const settings = modal.getCurrentSettings();
            
            expect(settings).toEqual({
                backgroundColor: '#123456',
                padding: 25,
                borderWidth: 3,
                borderColor: '#654321',
                borderStyle: 'dashed',
                borderRadius: 8,
                shadow: 'large',
                opacity: 75
            });
        });

        test('should handle transparent background', () => {
            modal.modal.querySelector('#image-bg-color-text').value = 'transparent';
            
            const settings = modal.getCurrentSettings();
            
            expect(settings.backgroundColor).toBe('transparent');
        });
    });

    describe('Security and Input Validation', () => {
        test('should validate hex color format in text input', () => {
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            const colorPicker = modal.modal.querySelector('#image-bg-color');
            const originalValue = colorPicker.value;
            
            // Invalid formats should be ignored
            colorText.value = '#gg0000'; // Invalid hex
            colorText.dispatchEvent(new Event('input'));
            expect(colorPicker.value).toBe(originalValue);
            
            colorText.value = '#ff00'; // Too short
            colorText.dispatchEvent(new Event('input'));
            expect(colorPicker.value).toBe(originalValue);
            
            colorText.value = '#ff00000'; // Too long
            colorText.dispatchEvent(new Event('input'));
            expect(colorPicker.value).toBe(originalValue);
        });

        test('should handle CSS injection attempts in color values', () => {
            const colorText = modal.modal.querySelector('#image-bg-color-text');
            modal.open(mockContainer);
            
            // Attempt CSS injection
            colorText.value = 'red; padding: 100px';
            colorText.dispatchEvent(new Event('input'));
            modal.updatePreview();
            
            // Should not apply the injected style
            expect(mockContainer.style.padding).not.toBe('100px');
        });

        test('should sanitize border style values', () => {
            modal.open(mockContainer);
            const borderStyle = modal.modal.querySelector('#image-border-style');
            const borderWidth = modal.modal.querySelector('#image-border-width');
            
            // Set border width to make border visible
            borderWidth.value = '2';
            
            // Only predefined values should work
            borderStyle.value = 'solid';
            modal.updatePreview();
            expect(mockContainer.style.border).toContain('solid');
            
            // Invalid value should default to solid
            borderStyle.value = 'malicious';
            modal.updatePreview();
            expect(mockContainer.style.border).toContain('solid');
        });

        test('should handle NaN from parseInt gracefully', () => {
            modal.open(mockContainer);
            
            // Simulate NaN conditions
            modal.modal.querySelector('#image-padding').value = '';
            modal.modal.querySelector('#image-border-width').value = '';
            
            expect(() => modal.updatePreview()).not.toThrow();
        });

        test('should handle missing DOM elements gracefully', () => {
            // Remove an element
            const padding = modal.modal.querySelector('#image-padding');
            padding.remove();
            
            expect(() => modal.getCurrentSettings()).not.toThrow();
        });
    });

    describe('Edge Cases', () => {
        test('should handle container without image', () => {
            const containerNoImg = document.createElement('div');
            document.body.appendChild(containerNoImg);
            
            expect(() => modal.open(containerNoImg)).not.toThrow();
            
            modal.modal.querySelector('#image-border-radius').value = '15';
            modal.updatePreview();
            
            expect(containerNoImg.style.borderRadius).toBe('15px');
        });

        test('should handle rapid open/close cycles', () => {
            for (let i = 0; i < 10; i++) {
                modal.open(mockContainer);
                modal.close();
            }
            
            expect(modal.targetContainer).toBeNull();
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should handle concurrent event triggers', () => {
            modal.open(mockContainer);
            
            const padding = modal.modal.querySelector('#image-padding');
            const borderWidth = modal.modal.querySelector('#image-border-width');
            
            // Trigger multiple events simultaneously
            padding.value = '20';
            borderWidth.value = '5';
            padding.dispatchEvent(new Event('input'));
            borderWidth.dispatchEvent(new Event('input'));
            
            expect(mockContainer.style.padding).toBe('20px');
            expect(mockContainer.style.borderWidth).toBe('5px');
        });

        test('should handle computed styles with no values', () => {
            // Mock getComputedStyle to return empty values
            const originalGetComputedStyle = window.getComputedStyle;
            window.getComputedStyle = jest.fn(() => ({
                backgroundColor: '',
                padding: '',
                borderWidth: '',
                borderColor: '',
                borderStyle: '',
                borderRadius: '',
                opacity: ''
            }));
            
            expect(() => modal.open(mockContainer)).not.toThrow();
            
            window.getComputedStyle = originalGetComputedStyle;
        });
    });

    describe('Integration Tests', () => {
        test('should handle complete user flow', () => {
            // Open modal
            modal.open(mockContainer);
            expect(modal.modal.classList.contains('active')).toBe(true);
            
            // Change settings
            modal.modal.querySelector('#image-padding').value = '20';
            modal.modal.querySelector('#image-border-width').value = '2';
            modal.modal.querySelector('#image-border-color').value = '#ff0000';
            modal.modal.querySelector('#image-opacity').value = '80';
            
            // Preview changes
            modal.updatePreview();
            expect(mockContainer.style.padding).toBe('20px');
            expect(mockContainer.style.opacity).toBe('0.8');
            
            // Apply and close
            modal.applySettings();
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should maintain settings across multiple opens', () => {
            // First open and change
            modal.open(mockContainer);
            modal.modal.querySelector('#image-padding').value = '25';
            modal.applySettings();
            
            // Second open should load the applied settings
            modal.open(mockContainer);
            expect(modal.modal.querySelector('#image-padding').value).toBe('25');
        });

        test('should work with different container styles', () => {
            // Test with inline styles
            mockContainer.style.cssText = 'padding: 30px; border: 5px dashed blue; opacity: 0.5;';
            
            modal.open(mockContainer);
            
            expect(modal.modal.querySelector('#image-padding').value).toBe('30');
            expect(modal.modal.querySelector('#image-border-width').value).toBe('5');
            expect(modal.modal.querySelector('#image-opacity').value).toBe('50');
        });
    });

    describe('Memory Management', () => {
        test('should not create memory leaks with event listeners', () => {
            // Create new modal and spy on its addEventListener
            const newModal = new ImageSettingsModal(mockEditor);
            const addEventListenerSpy = jest.spyOn(newModal.modal, 'addEventListener');
            
            // Trigger attachEventListeners to add initial listeners
            newModal.attachEventListeners();
            const initialCalls = addEventListenerSpy.mock.calls.length;
            
            // Open and close multiple times
            for (let i = 0; i < 5; i++) {
                newModal.open(mockContainer);
                newModal.close();
            }
            
            // No new listeners should be added during open/close
            expect(addEventListenerSpy.mock.calls.length).toBe(initialCalls);
        });
    });
});