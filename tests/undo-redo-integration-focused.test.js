/**
 * Focused integration tests for undo/redo functionality
 * Tests realistic editor workflows with proper state management
 * 
 * These tests demonstrate the correct usage pattern:
 * 1. Make changes to DOM
 * 2. Call saveState() to capture the state
 * 3. Use undo/redo to navigate between saved states
 * 4. Re-query DOM elements after state changes (innerHTML restoration)
 */

import { StateHistory } from '../js/state-history.js';

describe('Undo/Redo Integration - Focused Tests', () => {
    let mockEditor;
    let stateHistory;
    let editableArea;

    beforeEach(() => {
        // Create DOM structure
        document.body.innerHTML = `
            <div class="dragon-editor">
                <div class="editable-area">
                    <div class="editor-block">
                        <div class="editor-column">
                            <p>Initial content</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        editableArea = document.querySelector('.editable-area');
        
        // Create comprehensive mock editor
        mockEditor = {
            editableArea: editableArea,
            makeExistingBlocksEditable: jest.fn(),
            attachDragHandleListeners: jest.fn(),
            formattingToolbar: {
                fixFirefoxEditableElements: jest.fn()
            },
            imageUploader: {
                setupImageSnippet: jest.fn()
            }
        };

        stateHistory = new StateHistory(mockEditor);
        mockEditor.stateHistory = stateHistory;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Basic Undo/Redo Operations', () => {
        test('should handle text content changes', () => {
            // Save initial state is done in constructor
            const initialHTML = editableArea.innerHTML;
            
            // Make first change
            editableArea.querySelector('p').textContent = 'First change';
            stateHistory.saveState();
            
            // Make second change
            editableArea.querySelector('p').textContent = 'Second change';
            stateHistory.saveState();
            
            // Verify current state
            expect(editableArea.querySelector('p').textContent).toBe('Second change');
            
            // Undo to first change
            stateHistory.undo();
            expect(editableArea.querySelector('p').textContent).toBe('First change');
            
            // Undo to initial state
            stateHistory.undo();
            expect(editableArea.querySelector('p').textContent).toBe('Initial content');
            
            // Redo to first change
            stateHistory.redo();
            expect(editableArea.querySelector('p').textContent).toBe('First change');
            
            // Redo to second change
            stateHistory.redo();
            expect(editableArea.querySelector('p').textContent).toBe('Second change');
        });

        test('should handle adding and removing blocks', () => {
            const initialBlockCount = editableArea.children.length;
            
            // Add new block
            const newBlock = document.createElement('div');
            newBlock.className = 'editor-block';
            newBlock.innerHTML = '<div class="editor-column"><p>New block</p></div>';
            editableArea.appendChild(newBlock);
            stateHistory.saveState();
            
            expect(editableArea.children.length).toBe(initialBlockCount + 1);
            expect(editableArea.querySelector('.editor-block:last-child p').textContent).toBe('New block');
            
            // Undo to remove block
            stateHistory.undo();
            expect(editableArea.children.length).toBe(initialBlockCount);
            expect(editableArea.querySelector('p').textContent).toBe('Initial content');
            
            // Redo to restore block
            stateHistory.redo();
            expect(editableArea.children.length).toBe(initialBlockCount + 1);
            expect(editableArea.querySelector('.editor-block:last-child p').textContent).toBe('New block');
        });
    });

    describe('Complex Multi-Step Workflows', () => {
        test('should handle adding block, styling, and adding content', () => {
            // Step 1: Add new block
            const newBlock = document.createElement('div');
            newBlock.className = 'editor-block';
            newBlock.innerHTML = '<div class="editor-column"><p>New block</p></div>';
            editableArea.appendChild(newBlock);
            stateHistory.saveState();
            
            // Step 2: Style the block
            const blockToStyle = editableArea.querySelector('.editor-block:last-child');
            blockToStyle.style.backgroundColor = 'lightblue';
            blockToStyle.style.padding = '20px';
            stateHistory.saveState();
            
            // Step 3: Add heading to the block
            const columnToModify = editableArea.querySelector('.editor-block:last-child .editor-column');
            const heading = document.createElement('h3');
            heading.textContent = 'Block Heading';
            columnToModify.insertBefore(heading, columnToModify.firstChild);
            stateHistory.saveState();
            
            // Verify final state
            expect(editableArea.children.length).toBe(2);
            const finalBlock = editableArea.querySelector('.editor-block:last-child');
            const finalColumn = finalBlock.querySelector('.editor-column');
            expect(finalBlock.style.backgroundColor).toBe('lightblue');
            expect(finalColumn.children.length).toBe(2);
            expect(finalColumn.querySelector('h3').textContent).toBe('Block Heading');
            
            // Undo step 3 (remove heading)
            stateHistory.undo();
            let currentBlock = editableArea.querySelector('.editor-block:last-child');
            let currentColumn = currentBlock.querySelector('.editor-column');
            expect(currentColumn.children.length).toBe(1);
            expect(currentColumn.querySelector('h3')).toBeNull();
            expect(currentBlock.style.backgroundColor).toBe('lightblue'); // Style remains
            
            // Undo step 2 (remove styling)
            stateHistory.undo();
            currentBlock = editableArea.querySelector('.editor-block:last-child');
            expect(currentBlock.style.backgroundColor).toBe('');
            expect(editableArea.children.length).toBe(2); // Block remains
            
            // Undo step 1 (remove block)
            stateHistory.undo();
            expect(editableArea.children.length).toBe(1);
            expect(editableArea.querySelector('p').textContent).toBe('Initial content');
            
            // Redo all steps
            stateHistory.redo(); // Add block
            expect(editableArea.children.length).toBe(2);
            
            stateHistory.redo(); // Add styling
            const restoredBlock = editableArea.querySelector('.editor-block:last-child');
            expect(restoredBlock.style.backgroundColor).toBe('lightblue');
            
            stateHistory.redo(); // Add heading
            // Re-query after redo since DOM references become stale
            const finalRestoredBlock = editableArea.querySelector('.editor-block:last-child');
            const finalRestoredColumn = finalRestoredBlock.querySelector('.editor-column');
            const h3Element = finalRestoredColumn.querySelector('h3');
            expect(h3Element).toBeTruthy();
            expect(h3Element.textContent).toBe('Block Heading');
            expect(finalRestoredColumn.children.length).toBe(2);
        });

        test('should handle branching history correctly', () => {
            // Build initial history
            editableArea.querySelector('p').textContent = 'State A';
            stateHistory.saveState();
            
            editableArea.querySelector('p').textContent = 'State B';
            stateHistory.saveState();
            
            editableArea.querySelector('p').textContent = 'State C';
            stateHistory.saveState();
            
            // Go back two steps
            stateHistory.undo(); // C -> B
            stateHistory.undo(); // B -> A
            
            expect(editableArea.querySelector('p').textContent).toBe('State A');
            
            // Make new change (creates branch, truncates future history)
            editableArea.querySelector('p').textContent = 'New Branch';
            stateHistory.saveState();
            
            // Should not be able to redo to State B or C
            const currentIndex = stateHistory.currentIndex;
            stateHistory.redo();
            expect(stateHistory.currentIndex).toBe(currentIndex); // No change
            expect(editableArea.querySelector('p').textContent).toBe('New Branch');
            
            // But can still undo
            stateHistory.undo();
            expect(editableArea.querySelector('p').textContent).toBe('State A');
        });
    });

    describe('Functionality Restoration', () => {
        test('should restore contentEditable functionality after undo/redo', () => {
            // Add some content with mixed elements
            editableArea.innerHTML = `
                <div class="editor-block">
                    <div class="editor-column">
                        <h2>Heading</h2>
                        <p>Paragraph</p>
                    </div>
                </div>
                <div class="editor-block">
                    <div class="editor-column">
                        <p>Second block</p>
                    </div>
                </div>
            `;
            stateHistory.saveState();
            
            // Make change
            editableArea.querySelector('h2').textContent = 'Modified heading';
            stateHistory.saveState();
            
            // Undo and verify functionality restoration
            stateHistory.undo();
            expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalled();
            expect(mockEditor.attachDragHandleListeners).toHaveBeenCalled();
            
            // Redo and verify functionality restoration again
            stateHistory.redo();
            expect(mockEditor.makeExistingBlocksEditable).toHaveBeenCalledTimes(2);
            expect(editableArea.querySelector('h2').textContent).toBe('Modified heading');
        });

        test('should restore image functionality after undo/redo', () => {
            // Add image snippet
            editableArea.innerHTML = `
                <div class="editor-block">
                    <div class="editor-column">
                        <div class="editor-snippet image-snippet">
                            <img src="test.jpg" alt="Test image">
                        </div>
                    </div>
                </div>
            `;
            stateHistory.saveState();
            
            // Make change
            editableArea.querySelector('.editor-column').appendChild(
                document.createElement('p')
            ).textContent = 'Added paragraph';
            stateHistory.saveState();
            
            // Undo and verify image setup is called
            stateHistory.undo();
            expect(mockEditor.imageUploader.setupImageSnippet).toHaveBeenCalled();
            
            // Redo
            stateHistory.redo();
            expect(editableArea.querySelector('p').textContent).toBe('Added paragraph');
        });

        test('should handle Firefox-specific restoration', () => {
            // Mock Firefox
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 Firefox/91.0',
                writable: true
            });
            
            // Add content
            editableArea.innerHTML = '<div class="editor-block"><div class="editor-column"><p>Firefox content</p></div></div>';
            stateHistory.saveState();
            
            // Make change
            editableArea.querySelector('p').textContent = 'Modified in Firefox';
            stateHistory.saveState();
            
            // Undo should trigger Firefox fixes
            stateHistory.undo();
            expect(mockEditor.formattingToolbar.fixFirefoxEditableElements).toHaveBeenCalled();
        });
    });

    describe('Integration with Editor State Management', () => {
        test('should work with typical editor workflow patterns', () => {
            // Simulate typical editor workflow:
            // 1. User adds block via drag/drop -> saveState called
            const newBlock = document.createElement('div');
            newBlock.className = 'editor-block';
            newBlock.innerHTML = '<div class="editor-column"><p>Dragged block</p></div>';
            editableArea.appendChild(newBlock);
            stateHistory.saveState(); // This would be called by drag/drop handler
            
            // 2. User opens style modal and applies styles -> saveState called
            const block = editableArea.querySelector('.editor-block:last-child');
            block.style.backgroundColor = 'red';
            block.style.margin = '20px';
            stateHistory.saveState(); // This would be called by style modal save
            
            // 3. User edits text content -> saveState called
            block.querySelector('p').textContent = 'Edited text content';
            stateHistory.saveState(); // This would be called by formatting toolbar
            
            // 4. User hits undo twice
            stateHistory.undo(); // Back to styled but unedited text
            expect(editableArea.querySelector('.editor-block:last-child p').textContent).toBe('Dragged block');
            expect(editableArea.querySelector('.editor-block:last-child').style.backgroundColor).toBe('red');
            
            stateHistory.undo(); // Back to unstyled block
            expect(editableArea.querySelector('.editor-block:last-child').style.backgroundColor).toBe('');
            expect(editableArea.querySelector('.editor-block:last-child p').textContent).toBe('Dragged block');
            
            // 5. User hits redo
            stateHistory.redo(); // Forward to styled block
            expect(editableArea.querySelector('.editor-block:last-child').style.backgroundColor).toBe('red');
            expect(editableArea.querySelector('.editor-block:last-child').style.margin).toBe('20px');
        });

        test('should handle rapid consecutive changes with proper deduplication', () => {
            const p = editableArea.querySelector('p');
            const initialHistoryLength = stateHistory.history.length;
            
            // Make multiple changes
            for (let i = 0; i < 5; i++) {
                p.textContent = `Change ${i}`;
                stateHistory.saveState();
            }
            
            expect(stateHistory.history.length).toBe(initialHistoryLength + 5);
            
            // Try to save the same state multiple times (should be deduplicated)
            stateHistory.saveState();
            stateHistory.saveState();
            stateHistory.saveState();
            
            expect(stateHistory.history.length).toBe(initialHistoryLength + 5); // No change
            
            // Should be able to undo all unique changes
            for (let i = 4; i >= 1; i--) {
                stateHistory.undo();
                expect(editableArea.querySelector('p').textContent).toBe(`Change ${i - 1}`);
            }
            
            // Final undo to initial state
            stateHistory.undo();
            expect(editableArea.querySelector('p').textContent).toBe('Initial content');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('should handle undo/redo when history is at bounds', () => {
            // Try to undo when already at first state
            const initialIndex = stateHistory.currentIndex;
            stateHistory.undo();
            expect(stateHistory.currentIndex).toBe(initialIndex);
            
            // Add some states
            editableArea.querySelector('p').textContent = 'State 1';
            stateHistory.saveState();
            editableArea.querySelector('p').textContent = 'State 2';
            stateHistory.saveState();
            
            // Try to redo when at last state
            const lastIndex = stateHistory.currentIndex;
            stateHistory.redo();
            expect(stateHistory.currentIndex).toBe(lastIndex);
        });

        test('should handle complex DOM structures correctly', () => {
            // Create complex nested structure
            editableArea.innerHTML = `
                <div class="editor-block full-width">
                    <div class="editor-column">
                        <h1>Main Title</h1>
                        <div class="editor-snippet">
                            <ul>
                                <li>Item 1</li>
                                <li>Item 2 <strong>bold</strong></li>
                            </ul>
                        </div>
                    </div>
                    <div class="editor-column">
                        <blockquote>
                            <p>Quote with <em>emphasis</em></p>
                        </blockquote>
                    </div>
                </div>
            `;
            stateHistory.saveState();
            
            // Modify nested content
            editableArea.querySelector('strong').textContent = 'very bold';
            editableArea.querySelector('em').textContent = 'strong emphasis';
            stateHistory.saveState();
            
            // Undo should restore exact structure
            stateHistory.undo();
            expect(editableArea.querySelector('strong').textContent).toBe('bold');
            expect(editableArea.querySelector('em').textContent).toBe('emphasis');
            expect(editableArea.querySelectorAll('.editor-column').length).toBe(2);
            expect(editableArea.querySelector('.full-width')).toBeTruthy();
            
            // Redo should restore modifications
            stateHistory.redo();
            expect(editableArea.querySelector('strong').textContent).toBe('very bold');
            expect(editableArea.querySelector('em').textContent).toBe('strong emphasis');
        });

        test('should maintain performance with large content', () => {
            // Create large content structure
            let largeHTML = '';
            for (let i = 0; i < 50; i++) {
                largeHTML += `<div class="editor-block"><div class="editor-column"><p>Block ${i} content</p></div></div>`;
            }
            editableArea.innerHTML = largeHTML;
            
            const startTime = performance.now();
            stateHistory.saveState();
            
            // Modify one element
            editableArea.querySelector('p').textContent = 'Modified first block';
            stateHistory.saveState();
            
            // Perform undo/redo
            stateHistory.undo();
            stateHistory.redo();
            
            const endTime = performance.now();
            
            // Should handle large content efficiently
            expect(endTime - startTime).toBeLessThan(200);
            expect(editableArea.querySelector('p').textContent).toBe('Modified first block');
            expect(editableArea.children.length).toBe(50);
        });
    });
});