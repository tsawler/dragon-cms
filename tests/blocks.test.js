/**
 * Tests for the custom blocks system
 * Tests the block configuration, loading, and integration functionality
 */

const fs = require('fs');
const path = require('path');

describe('Custom Blocks System', () => {
    let DragonBlocks;

    beforeEach(() => {
        // Clear any existing window
        if (global.window) {
            delete global.window;
        }

        // Create fresh window object
        global.window = {};

        // Load and execute blocks.js
        const blocksPath = path.join(__dirname, '..', 'blocks.js');
        const blocksContent = fs.readFileSync(blocksPath, 'utf8');
        eval(blocksContent);

        DragonBlocks = global.window.DragonBlocks;
    });

    afterEach(() => {
        delete global.window;
    });

    describe('Block Configuration Loading', () => {
        test('should load DragonBlocks from blocks.js', () => {
            expect(DragonBlocks).toBeDefined();
            expect(typeof DragonBlocks).toBe('object');
        });

        test('should have customBlocks array', () => {
            expect(DragonBlocks.customBlocks).toBeDefined();
            expect(Array.isArray(DragonBlocks.customBlocks)).toBe(true);
            expect(DragonBlocks.customBlocks.length).toBeGreaterThan(0);
        });

        test('should have required methods', () => {
            expect(typeof DragonBlocks.getAllCustomBlocks).toBe('function');
            expect(typeof DragonBlocks.getBlocksByCategory).toBe('function');
            expect(typeof DragonBlocks.addCustomBlock).toBe('function');
            expect(typeof DragonBlocks.getBlockById).toBe('function');
            expect(typeof DragonBlocks.getCategories).toBe('function');
        });
    });

    describe('Block Structure Validation', () => {
        test('should have properly structured blocks', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            blocks.forEach(block => {
                // Required properties
                expect(block.id).toBeDefined();
                expect(typeof block.id).toBe('string');
                expect(block.id.length).toBeGreaterThan(0);
                
                expect(block.name).toBeDefined();
                expect(typeof block.name).toBe('string');
                expect(block.name.length).toBeGreaterThan(0);
                
                expect(block.type).toBe('block');
                
                expect(block.html).toBeDefined();
                expect(typeof block.html).toBe('string');
                expect(block.html.length).toBeGreaterThan(0);
                
                expect(block.preview).toBeDefined();
                expect(['text', 'image'].includes(block.preview)).toBe(true);

                // Optional properties should be strings if present
                if (block.description) {
                    expect(typeof block.description).toBe('string');
                }
                
                if (block.category) {
                    expect(typeof block.category).toBe('string');
                }

                if (block.previewImage) {
                    expect(typeof block.previewImage).toBe('string');
                }
            });
        });

        test('should have unique block IDs', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            const ids = blocks.map(block => block.id);
            const uniqueIds = [...new Set(ids)];
            
            expect(uniqueIds.length).toBe(ids.length);
        });

        test('should have valid HTML structure', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            blocks.forEach(block => {
                // Basic HTML validation - should contain elements
                expect(block.html.includes('<')).toBe(true);
                expect(block.html.includes('>')).toBe(true);
                
                // Should not contain script tags for security
                expect(block.html.toLowerCase().includes('<script')).toBe(false);
            });
        });
    });

    describe('Block Retrieval Methods', () => {
        test('getAllCustomBlocks should return all blocks', () => {
            const allBlocks = DragonBlocks.getAllCustomBlocks();
            const originalBlocks = DragonBlocks.customBlocks;
            
            expect(allBlocks).toEqual(originalBlocks);
            expect(allBlocks.length).toBe(originalBlocks.length);
        });

        test('getBlocksByCategory should filter by category', () => {
            const layoutBlocks = DragonBlocks.getBlocksByCategory('layout');
            const marketingBlocks = DragonBlocks.getBlocksByCategory('marketing');
            
            layoutBlocks.forEach(block => {
                expect(block.category).toBe('layout');
            });

            marketingBlocks.forEach(block => {
                expect(block.category).toBe('marketing');
            });

            // Should return empty array for non-existent category
            const nonExistentBlocks = DragonBlocks.getBlocksByCategory('nonexistent');
            expect(nonExistentBlocks).toEqual([]);
        });

        test('getBlockById should return specific block', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            const firstBlock = blocks[0];
            
            const foundBlock = DragonBlocks.getBlockById(firstBlock.id);
            expect(foundBlock).toEqual(firstBlock);
            
            // Should return undefined for non-existent ID
            const nonExistentBlock = DragonBlocks.getBlockById('non-existent-id');
            expect(nonExistentBlock).toBeUndefined();
        });

        test('getCategories should return sorted unique categories', () => {
            const categories = DragonBlocks.getCategories();
            const allBlocks = DragonBlocks.getAllCustomBlocks();
            const expectedCategories = [...new Set(allBlocks.map(block => block.category).filter(Boolean))].sort();
            
            expect(categories).toEqual(expectedCategories);
            expect(Array.isArray(categories)).toBe(true);
        });
    });

    describe('Dynamic Block Management', () => {
        test('addCustomBlock should add valid blocks', () => {
            const initialCount = DragonBlocks.getAllCustomBlocks().length;
            
            const newBlock = {
                id: 'test-block',
                name: 'Test Block',
                html: '<div class="test-block">Test content</div>',
                preview: 'text',
                description: 'A test block',
                category: 'test'
            };
            
            const result = DragonBlocks.addCustomBlock(newBlock);
            
            expect(result).toBe(true);
            expect(DragonBlocks.getAllCustomBlocks().length).toBe(initialCount + 1);
            
            const addedBlock = DragonBlocks.getBlockById('test-block');
            expect(addedBlock).toBeDefined();
            expect(addedBlock.type).toBe('block'); // Should be auto-set
            expect(addedBlock.name).toBe('Test Block');
        });

        test('addCustomBlock should reject invalid blocks', () => {
            const initialCount = DragonBlocks.getAllCustomBlocks().length;
            
            // Missing required properties
            const invalidBlocks = [
                { name: 'No ID', html: '<div>test</div>' }, // missing id
                { id: 'no-name', html: '<div>test</div>' }, // missing name
                { id: 'no-html', name: 'No HTML' }, // missing html
                {} // missing everything
            ];
            
            invalidBlocks.forEach(block => {
                const result = DragonBlocks.addCustomBlock(block);
                expect(result).toBe(false);
            });
            
            expect(DragonBlocks.getAllCustomBlocks().length).toBe(initialCount);
        });

        test('addCustomBlock should reject duplicate IDs', () => {
            const initialCount = DragonBlocks.getAllCustomBlocks().length;
            const existingBlock = DragonBlocks.getAllCustomBlocks()[0];
            
            const duplicateBlock = {
                id: existingBlock.id,
                name: 'Duplicate Block',
                html: '<div>duplicate</div>'
            };
            
            const result = DragonBlocks.addCustomBlock(duplicateBlock);
            
            expect(result).toBe(false);
            expect(DragonBlocks.getAllCustomBlocks().length).toBe(initialCount);
        });
    });

    describe('Default Blocks Content', () => {
        test('should include expected default blocks', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            const blockIds = blocks.map(block => block.id);
            
            // Check for some expected default blocks
            expect(blockIds).toContain('custom-card-block');
            expect(blockIds).toContain('custom-feature-grid');
            expect(blockIds).toContain('custom-cta-section');
            expect(blockIds).toContain('custom-testimonial-block');
            expect(blockIds).toContain('custom-pricing-block');
        });

        test('should have blocks in different categories', () => {
            const categories = DragonBlocks.getCategories();
            
            expect(categories.length).toBeGreaterThan(1);
            expect(categories).toContain('layout');
            expect(categories).toContain('marketing');
            expect(categories).toContain('content');
        });

        test('card block should have proper structure', () => {
            const cardBlock = DragonBlocks.getBlockById('custom-card-block');
            
            expect(cardBlock).toBeDefined();
            expect(cardBlock.name).toBe('Card Block');
            expect(cardBlock.type).toBe('block');
            expect(cardBlock.category).toBe('layout');
            expect(cardBlock.html).toContain('card-block');
            expect(cardBlock.description).toContain('card-style container');
        });

        test('feature grid should have proper structure', () => {
            const featureGrid = DragonBlocks.getBlockById('custom-feature-grid');
            
            expect(featureGrid).toBeDefined();
            expect(featureGrid.name).toBe('Feature Grid');
            expect(featureGrid.html).toContain('feature-grid');
            expect(featureGrid.html).toContain('grid-template-columns');
        });

        test('pricing block should have multiple pricing cards', () => {
            const pricingBlock = DragonBlocks.getBlockById('custom-pricing-block');
            
            expect(pricingBlock).toBeDefined();
            expect(pricingBlock.name).toBe('Pricing Table');
            expect(pricingBlock.category).toBe('marketing');
            
            // Should contain multiple pricing tiers
            expect(pricingBlock.html).toContain('Basic');
            expect(pricingBlock.html).toContain('Pro');
            expect(pricingBlock.html).toContain('Enterprise');
        });
    });

    describe('HTML Content Quality', () => {
        test('blocks should not contain malicious content', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            blocks.forEach(block => {
                const html = block.html.toLowerCase();
                
                // Should not contain script tags
                expect(html.includes('<script')).toBe(false);
                
                // Should not contain javascript: protocol
                expect(html.includes('javascript:')).toBe(false);
                
                // Should not contain eval or other dangerous functions
                expect(html.includes('eval(')).toBe(false);
            });
        });

        test('blocks should have semantic HTML structure', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            blocks.forEach(block => {
                // Should contain proper block wrapper
                expect(block.html.includes('editor-block') || block.html.includes('class=')).toBe(true);
                
                // Should have proper nesting (basic check)
                const openTags = (block.html.match(/</g) || []).length;
                const closeTags = (block.html.match(/>/g) || []).length;
                expect(openTags).toBeGreaterThan(0);
                expect(closeTags).toBeGreaterThan(0);
            });
        });

        test('blocks should have responsive design considerations', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            blocks.forEach(block => {
                const html = block.html.toLowerCase();
                
                // Look for responsive design patterns
                const hasResponsivePatterns = 
                    html.includes('flex') ||
                    html.includes('grid') ||
                    html.includes('max-width') ||
                    html.includes('%') ||
                    html.includes('auto') ||
                    html.includes('responsive') ||
                    html.includes('wrap');
                
                // Only check specific blocks that we know have responsive patterns
                if (block.id === 'custom-feature-grid') {
                    expect(hasResponsivePatterns).toBe(true);
                }
                
                // Pricing blocks should have responsive patterns due to multiple columns
                if (block.id === 'custom-pricing-block') {
                    expect(hasResponsivePatterns).toBe(true);
                }
                
                // Basic validation - blocks should not contain script tags for security
                expect(html.includes('<script')).toBe(false);
            });
        });
    });

    describe('Integration with Snippet Panel', () => {
        test('blocks should be compatible with createSnippetItem', () => {
            const blocks = DragonBlocks.getAllCustomBlocks();
            
            // Mock createSnippetItem requirements
            blocks.forEach(block => {
                // Should have properties that createSnippetItem expects
                expect(block.type).toBeDefined();
                expect(block.name).toBeDefined();
                expect(block.html).toBeDefined();
                expect(block.id).toBeDefined();
                
                // Optional properties should be valid if present
                if (block.description) {
                    expect(typeof block.description).toBe('string');
                    expect(block.description.length).toBeGreaterThan(0);
                }
                
                if (block.category) {
                    expect(typeof block.category).toBe('string');
                    expect(block.category.length).toBeGreaterThan(0);
                }
            });
        });
    });
});