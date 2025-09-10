/**
 * @jest-environment jsdom
 */

describe('DragonCMS Callback Functions', () => {
    let mockEditor;
    let onChangeCallback;
    let onRenderCallback;
    
    beforeEach(() => {
        // Create a mock editor object with just the callback functionality
        onChangeCallback = jest.fn();
        onRenderCallback = jest.fn();
        
        // Mock the Editor class methods we need for testing
        mockEditor = {
            onChange: onChangeCallback,
            onRender: onRenderCallback,
            editableArea: {
                innerHTML: '<div>Test Content</div>'
            },
            
            // Copy the actual trigger methods from editor-core.js
            triggerOnChange: function(eventType, element) {
                if (typeof this.onChange === 'function') {
                    try {
                        this.onChange({
                            type: eventType,
                            element: element,
                            html: this.editableArea.innerHTML,
                            timestamp: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('Error in onChange callback:', error);
                    }
                }
            },
            
            triggerOnRender: function(elementType, element) {
                if (typeof this.onRender === 'function') {
                    try {
                        this.onRender({
                            type: elementType,
                            element: element,
                            timestamp: new Date().toISOString()
                        });
                    } catch (error) {
                        console.error('Error in onRender callback:', error);
                    }
                }
            }
        };
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('onChange Callback', () => {
        test('should trigger onChange with correct event data', () => {
            const testElement = document.createElement('div');
            testElement.className = 'test-block';
            
            mockEditor.triggerOnChange('block-added', testElement);
            
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block-added',
                    element: testElement,
                    html: '<div>Test Content</div>',
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should handle all change event types', () => {
            const eventTypes = [
                'block-added',
                'block-deleted', 
                'block-moved',
                'snippet-added',
                'snippet-deleted',
                'snippet-moved'
            ];
            
            eventTypes.forEach(eventType => {
                mockEditor.triggerOnChange(eventType, null);
            });
            
            expect(onChangeCallback).toHaveBeenCalledTimes(6);
            
            eventTypes.forEach((eventType, index) => {
                expect(onChangeCallback.mock.calls[index][0].type).toBe(eventType);
            });
        });
        
        test('should include current HTML in event', () => {
            const newContent = '<p>Updated content</p>';
            mockEditor.editableArea.innerHTML = newContent;
            
            mockEditor.triggerOnChange('block-added', null);
            
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: newContent
                })
            );
        });
        
        test('should include ISO timestamp', () => {
            mockEditor.triggerOnChange('block-added', null);
            
            const event = onChangeCallback.mock.calls[0][0];
            const timestamp = new Date(event.timestamp);
            
            expect(timestamp).toBeInstanceOf(Date);
            expect(timestamp.toISOString()).toBe(event.timestamp);
        });
        
        test('should handle null elements for delete events', () => {
            mockEditor.triggerOnChange('block-deleted', null);
            
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block-deleted',
                    element: null
                })
            );
        });
    });
    
    describe('onRender Callback', () => {
        test('should trigger onRender with correct event data', () => {
            const testElement = document.createElement('div');
            testElement.className = 'editor-block';
            
            mockEditor.triggerOnRender('block', testElement);
            
            expect(onRenderCallback).toHaveBeenCalledTimes(1);
            expect(onRenderCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block',
                    element: testElement,
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should differentiate between block and snippet types', () => {
            const block = document.createElement('div');
            const snippet = document.createElement('div');
            
            mockEditor.triggerOnRender('block', block);
            mockEditor.triggerOnRender('snippet', snippet);
            
            expect(onRenderCallback).toHaveBeenCalledTimes(2);
            expect(onRenderCallback.mock.calls[0][0].type).toBe('block');
            expect(onRenderCallback.mock.calls[1][0].type).toBe('snippet');
        });
        
        test('should pass element reference correctly', () => {
            const testElement = document.createElement('div');
            testElement.id = 'unique-element';
            
            mockEditor.triggerOnRender('block', testElement);
            
            const event = onRenderCallback.mock.calls[0][0];
            expect(event.element).toBe(testElement);
            expect(event.element.id).toBe('unique-element');
        });
    });
    
    describe('Error Handling', () => {
        test('should handle errors in onChange callback gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            mockEditor.onChange = () => {
                throw new Error('Test error');
            };
            
            expect(() => {
                mockEditor.triggerOnChange('block-added', null);
            }).not.toThrow();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in onChange callback:',
                expect.any(Error)
            );
            
            consoleSpy.mockRestore();
        });
        
        test('should handle errors in onRender callback gracefully', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            mockEditor.onRender = () => {
                throw new Error('Render error');
            };
            
            expect(() => {
                mockEditor.triggerOnRender('block', null);
            }).not.toThrow();
            
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in onRender callback:',
                expect.any(Error)
            );
            
            consoleSpy.mockRestore();
        });
        
        test('should not call callback if not a function', () => {
            mockEditor.onChange = 'not a function';
            mockEditor.onRender = 123;
            
            expect(() => {
                mockEditor.triggerOnChange('block-added', null);
                mockEditor.triggerOnRender('block', null);
            }).not.toThrow();
            
            // Original callbacks shouldn't have been called
            expect(onChangeCallback).not.toHaveBeenCalled();
            expect(onRenderCallback).not.toHaveBeenCalled();
        });
        
        test('should handle undefined callbacks', () => {
            mockEditor.onChange = undefined;
            mockEditor.onRender = undefined;
            
            expect(() => {
                mockEditor.triggerOnChange('block-added', null);
                mockEditor.triggerOnRender('block', null);
            }).not.toThrow();
        });
    });
    
    describe('Callback Data Validation', () => {
        test('onChange event should have all required properties', () => {
            const element = document.createElement('div');
            mockEditor.triggerOnChange('block-added', element);
            
            const event = onChangeCallback.mock.calls[0][0];
            
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('element');
            expect(event).toHaveProperty('html');
            expect(event).toHaveProperty('timestamp');
            
            expect(typeof event.type).toBe('string');
            expect(typeof event.html).toBe('string');
            expect(typeof event.timestamp).toBe('string');
        });
        
        test('onRender event should have all required properties', () => {
            const element = document.createElement('div');
            mockEditor.triggerOnRender('snippet', element);
            
            const event = onRenderCallback.mock.calls[0][0];
            
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('element');
            expect(event).toHaveProperty('timestamp');
            
            expect(typeof event.type).toBe('string');
            expect(typeof event.timestamp).toBe('string');
        });
    });
    
    describe('Multiple Callback Handling', () => {
        test('should handle multiple rapid calls', () => {
            for (let i = 0; i < 100; i++) {
                mockEditor.triggerOnChange('block-added', null);
                mockEditor.triggerOnRender('block', null);
            }
            
            expect(onChangeCallback).toHaveBeenCalledTimes(100);
            expect(onRenderCallback).toHaveBeenCalledTimes(100);
        });
        
        test('should maintain separate callback contexts', () => {
            const element1 = document.createElement('div');
            element1.id = 'element1';
            
            const element2 = document.createElement('div');
            element2.id = 'element2';
            
            mockEditor.triggerOnChange('block-added', element1);
            mockEditor.triggerOnRender('block', element2);
            
            const changeEvent = onChangeCallback.mock.calls[0][0];
            const renderEvent = onRenderCallback.mock.calls[0][0];
            
            expect(changeEvent.element.id).toBe('element1');
            expect(renderEvent.element.id).toBe('element2');
        });
        
        test('should work with async callbacks', async () => {
            let asyncResult = null;
            
            mockEditor.onChange = async (event) => {
                await new Promise(resolve => setTimeout(resolve, 10));
                asyncResult = event.type;
            };
            
            mockEditor.triggerOnChange('block-added', null);
            
            // Wait for async callback to complete
            await new Promise(resolve => setTimeout(resolve, 20));
            
            expect(asyncResult).toBe('block-added');
        });
    });
});