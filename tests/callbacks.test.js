/**
 * @jest-environment jsdom
 */

import { Editor } from '../js/editor-core.js';

describe('DragonCMS Callbacks', () => {
    let editor;
    let container;
    let onChangeCallback;
    let onRenderCallback;
    
    beforeEach(() => {
        // Set up complete DOM structure that Editor expects
        document.body.innerHTML = `
            <div id="dragon-editor">
                <div class="dragon-editor">
                    <div class="editor-container">
                        <div class="editor-header">
                            <div class="editor-controls">
                                <button id="toggle-mode-btn">Toggle</button>
                                <button id="undo-btn">Undo</button>
                                <button id="redo-btn">Redo</button>
                                <button id="save-btn">Save</button>
                                <button id="load-btn">Load</button>
                                <button id="export-html-btn">Export</button>
                                <button id="page-settings-btn">Settings</button>
                            </div>
                        </div>
                        <div class="editor-main">
                            <aside id="snippet-panel" class="snippet-panel">
                                <div id="panel-handle" class="panel-handle"></div>
                                <div id="snippet-list" class="snippet-list"></div>
                            </aside>
                            <main id="editable-area" class="editable-area" data-mode="edit"></main>
                        </div>
                    </div>
                    <div class="viewport-controls">
                        <button id="mobile-viewport" class="viewport-btn"></button>
                        <button id="tablet-viewport" class="viewport-btn"></button>
                        <button id="desktop-viewport" class="viewport-btn active"></button>
                    </div>
                    
                    <!-- Formatting toolbar elements -->
                    <div id="formatting-toolbar" class="formatting-toolbar" style="display: none;">
                        <select id="format-select">
                            <option value="p">Paragraph</option>
                            <option value="h1">Heading 1</option>
                        </select>
                        <select id="font-family">
                            <option value="Arial">Arial</option>
                        </select>
                        <select id="font-size">
                            <option value="12px">12px</option>
                        </select>
                        <input type="color" id="text-color" value="#000000">
                        <input type="color" id="background-color" value="#ffffff">
                        <button data-command="bold">B</button>
                        <button data-command="italic">I</button>
                    </div>
                    
                    <!-- Image alignment toolbar -->
                    <div id="image-alignment-toolbar" class="image-alignment-toolbar" style="display: none;">
                        <button data-align="left">Left</button>
                        <button data-align="center">Center</button>
                        <button data-align="right">Right</button>
                    </div>
                </div>
            </div>
        `;
        
        container = document.getElementById('dragon-editor');
        
        // Mock callbacks
        onChangeCallback = jest.fn();
        onRenderCallback = jest.fn();
        
        // Mock the global snippet functions that SnippetPanel expects
        window.getBlocks = jest.fn(() => []);
        window.getSnippets = jest.fn(() => []);
        
        // Mock other global functions that might be needed
        window.DragonAssetsPath = 'assets/';
        
        // Mock window methods that Editor might use
        const originalAddEventListener = window.addEventListener;
        const originalRemoveEventListener = window.removeEventListener;
        
        // Mock but keep track of the original for cleanup
        window.addEventListener = jest.fn();
        window.removeEventListener = jest.fn();
        
        // Store originals for cleanup
        window.__originalAddEventListener = originalAddEventListener;
        window.__originalRemoveEventListener = originalRemoveEventListener;
        
        // Mock DOM methods that components might need
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100
        }));
        
        Element.prototype.offsetParent = null;
        
        // Mock MutationObserver
        global.MutationObserver = jest.fn().mockImplementation(() => ({
            observe: jest.fn(),
            disconnect: jest.fn(),
            takeRecords: jest.fn()
        }));
    });
    
    afterEach(() => {
        // Clean up
        if (editor) {
            editor = null;
        }
        
        // Restore original window methods
        if (window.__originalAddEventListener) {
            window.addEventListener = window.__originalAddEventListener;
            delete window.__originalAddEventListener;
        }
        if (window.__originalRemoveEventListener) {
            window.removeEventListener = window.__originalRemoveEventListener;
            delete window.__originalRemoveEventListener;
        }
        
        // Clean up globals
        delete window.DragonAssetsPath;
        delete window.getBlocks;
        delete window.getSnippets;
        delete global.MutationObserver;
        
        jest.clearAllMocks();
        document.body.innerHTML = '';
    });
    
    describe('Callback Registration', () => {
        test('should register onChange callback', () => {
            editor = new Editor({
                onChange: onChangeCallback
            });
            
            expect(editor.onChange).toBe(onChangeCallback);
        });
        
        test('should register onRender callback', () => {
            editor = new Editor({
                onRender: onRenderCallback
            });
            
            expect(editor.onRender).toBe(onRenderCallback);
        });
        
        test('should work without callbacks', () => {
            expect(() => {
                editor = new Editor({});
            }).not.toThrow();
            
            expect(editor.onChange).toBeNull();
            expect(editor.onRender).toBeNull();
        });
    });
    
    describe('onChange Callback', () => {
        beforeEach(() => {
            editor = new Editor({
                onChange: onChangeCallback
            });
        });
        
        test('should trigger onChange when block is added', () => {
            const block = editor.createBlock('<div>Test Block</div>');
            editor.editableArea.appendChild(block);
            editor.triggerOnChange('block-added', block);
            
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block-added',
                    element: block,
                    html: expect.any(String),
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should trigger onChange when snippet is added', () => {
            const snippet = editor.createSnippet('text', '<p>Test Snippet</p>');
            const block = editor.createBlock();
            block.appendChild(snippet);
            editor.triggerOnChange('snippet-added', snippet);
            
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'snippet-added',
                    element: snippet,
                    html: expect.any(String),
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should trigger onChange when element is deleted', () => {
            editor.triggerOnChange('block-deleted', null);
            
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block-deleted',
                    element: null,
                    html: expect.any(String),
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should trigger onChange when element is moved', () => {
            const block = editor.createBlock();
            editor.triggerOnChange('block-moved', block);
            
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block-moved',
                    element: block,
                    html: expect.any(String),
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should include current HTML content in onChange event', () => {
            const testHTML = '<div class="test">Test Content</div>';
            editor.editableArea.innerHTML = testHTML;
            
            editor.triggerOnChange('block-added', null);
            
            expect(onChangeCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    html: testHTML
                })
            );
        });
        
        test('should include ISO timestamp in onChange event', () => {
            editor.triggerOnChange('block-added', null);
            
            const call = onChangeCallback.mock.calls[0][0];
            expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });
    
    describe('onRender Callback', () => {
        beforeEach(() => {
            editor = new Editor({
                onRender: onRenderCallback
            });
        });
        
        test('should trigger onRender when block is created', () => {
            const block = editor.createBlock('<div>Test Block</div>');
            
            expect(onRenderCallback).toHaveBeenCalledTimes(1);
            expect(onRenderCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'block',
                    element: block,
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should trigger onRender when snippet is created', () => {
            const snippet = editor.createSnippet('text', '<p>Test</p>');
            
            expect(onRenderCallback).toHaveBeenCalledTimes(1);
            expect(onRenderCallback).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'snippet',
                    element: snippet,
                    timestamp: expect.any(String)
                })
            );
        });
        
        test('should pass correct element reference in onRender', () => {
            const block = editor.createBlock();
            
            const call = onRenderCallback.mock.calls[0][0];
            expect(call.element).toBe(block);
            expect(call.element.classList.contains('editor-block')).toBe(true);
        });
        
        test('should include ISO timestamp in onRender event', () => {
            editor.createBlock();
            
            const call = onRenderCallback.mock.calls[0][0];
            expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });
    });
    
    describe('Error Handling', () => {
        test('should handle errors in onChange callback gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Callback error');
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            editor = new Editor({
                onChange: errorCallback
            });
            
            // Should not throw
            expect(() => {
                editor.triggerOnChange('block-added', null);
            }).not.toThrow();
            
            expect(errorCallback).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in onChange callback:',
                expect.any(Error)
            );
            
            consoleSpy.mockRestore();
        });
        
        test('should handle errors in onRender callback gracefully', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Render callback error');
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            editor = new Editor({
                onRender: errorCallback
            });
            
            // Should not throw
            expect(() => {
                editor.createBlock();
            }).not.toThrow();
            
            expect(errorCallback).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in onRender callback:',
                expect.any(Error)
            );
            
            consoleSpy.mockRestore();
        });
        
        test('should not call callback if not a function', () => {
            editor = new Editor({
                onChange: 'not a function',
                onRender: {}
            });
            
            // Should not throw
            expect(() => {
                editor.triggerOnChange('block-added', null);
                editor.triggerOnRender('block', null);
            }).not.toThrow();
        });
        
        test('should continue operation even if callback fails', () => {
            const errorCallback = jest.fn(() => {
                throw new Error('Callback error');
            });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            editor = new Editor({
                onRender: errorCallback
            });
            
            const block = editor.createBlock();
            
            // Block should still be created despite callback error
            expect(block).toBeDefined();
            expect(block.classList.contains('editor-block')).toBe(true);
            
            consoleSpy.mockRestore();
        });
    });
    
    describe('Integration Tests', () => {
        test('should trigger both callbacks when creating elements', () => {
            editor = new Editor({
                onChange: onChangeCallback,
                onRender: onRenderCallback
            });
            
            const block = editor.createBlock();
            editor.editableArea.appendChild(block);
            editor.triggerOnChange('block-added', block);
            
            expect(onRenderCallback).toHaveBeenCalledTimes(1);
            expect(onChangeCallback).toHaveBeenCalledTimes(1);
        });
        
        test('should call callback without throwing context errors', () => {
            let callbackCalled = false;
            
            editor = new Editor({
                onChange: function(event) {
                    callbackCalled = true;
                    // Test that we can access event properties
                    expect(event.type).toBeDefined();
                    expect(event.html).toBeDefined();
                }
            });
            
            editor.triggerOnChange('block-added', null);
            
            expect(callbackCalled).toBe(true);
        });
        
        test('should work with arrow functions', () => {
            const arrowCallback = jest.fn((event) => {
                return event.type;
            });
            
            editor = new Editor({
                onChange: arrowCallback
            });
            
            editor.triggerOnChange('block-added', null);
            
            expect(arrowCallback).toHaveBeenCalled();
        });
        
        test('should handle multiple rapid callback triggers', () => {
            editor = new Editor({
                onChange: onChangeCallback,
                onRender: onRenderCallback
            });
            
            // Rapidly create multiple elements
            for (let i = 0; i < 10; i++) {
                const block = editor.createBlock();
                editor.triggerOnChange('block-added', block);
            }
            
            expect(onRenderCallback).toHaveBeenCalledTimes(10);
            expect(onChangeCallback).toHaveBeenCalledTimes(10);
        });
    });
    
    describe('Callback Event Data', () => {
        test('onChange event should have all required properties', () => {
            editor = new Editor({
                onChange: onChangeCallback
            });
            
            const element = editor.createBlock();
            editor.triggerOnChange('block-added', element);
            
            const event = onChangeCallback.mock.calls[0][0];
            
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('element');
            expect(event).toHaveProperty('html');
            expect(event).toHaveProperty('timestamp');
        });
        
        test('onRender event should have all required properties', () => {
            editor = new Editor({
                onRender: onRenderCallback
            });
            
            editor.createBlock();
            
            const event = onRenderCallback.mock.calls[0][0];
            
            expect(event).toHaveProperty('type');
            expect(event).toHaveProperty('element');
            expect(event).toHaveProperty('timestamp');
        });
        
        test('should differentiate between block and snippet types', () => {
            editor = new Editor({
                onRender: onRenderCallback
            });
            
            editor.createBlock();
            editor.createSnippet('text');
            
            const blockEvent = onRenderCallback.mock.calls[0][0];
            const snippetEvent = onRenderCallback.mock.calls[1][0];
            
            expect(blockEvent.type).toBe('block');
            expect(snippetEvent.type).toBe('snippet');
        });
    });
});