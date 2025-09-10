/**
 * Tests for the custom snippets system
 * Tests the snippet configuration, loading, and integration functionality
 */

const fs = require('fs');
const path = require('path');

describe('Custom Snippets System', () => {
    let DragonSnippets;

    beforeEach(() => {
        // Clear any existing window
        if (global.window) {
            delete global.window;
        }

        // Create fresh window object
        global.window = {};

        // Load and execute custom-snippets.js
        const snippetsPath = path.join(__dirname, '..', 'custom-snippets.js');
        const snippetsContent = fs.readFileSync(snippetsPath, 'utf8');
        eval(snippetsContent);

        DragonSnippets = global.window.DragonSnippets;
    });

    afterEach(() => {
        delete global.window;
    });

    describe('Snippet Configuration Loading', () => {
        test('should load DragonSnippets from custom-snippets.js', () => {
            expect(DragonSnippets).toBeDefined();
            expect(typeof DragonSnippets).toBe('object');
        });

        test('should have customSnippets array', () => {
            expect(DragonSnippets.customSnippets).toBeDefined();
            expect(Array.isArray(DragonSnippets.customSnippets)).toBe(true);
            expect(DragonSnippets.customSnippets.length).toBeGreaterThan(0);
        });

        test('should have required methods', () => {
            expect(typeof DragonSnippets.getAllCustomSnippets).toBe('function');
            expect(typeof DragonSnippets.getSnippetsByCategory).toBe('function');
            expect(typeof DragonSnippets.addCustomSnippet).toBe('function');
            expect(typeof DragonSnippets.getSnippetById).toBe('function');
            expect(typeof DragonSnippets.getCategories).toBe('function');
        });
    });

    describe('Snippet Structure Validation', () => {
        test('should have properly structured snippets', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            snippets.forEach(snippet => {
                // Required properties
                expect(snippet.id).toBeDefined();
                expect(typeof snippet.id).toBe('string');
                expect(snippet.id.length).toBeGreaterThan(0);
                
                expect(snippet.name).toBeDefined();
                expect(typeof snippet.name).toBe('string');
                expect(snippet.name.length).toBeGreaterThan(0);
                
                expect(snippet.type).toBe('snippet');
                
                expect(snippet.html).toBeDefined();
                expect(typeof snippet.html).toBe('string');
                expect(snippet.html.length).toBeGreaterThan(0);
                
                expect(snippet.preview).toBeDefined();
                expect(['text', 'image'].includes(snippet.preview)).toBe(true);

                // Optional properties should be strings if present
                if (snippet.description) {
                    expect(typeof snippet.description).toBe('string');
                }
                
                if (snippet.category) {
                    expect(typeof snippet.category).toBe('string');
                }

                if (snippet.snippetType) {
                    expect(typeof snippet.snippetType).toBe('string');
                }

                if (snippet.previewImage) {
                    expect(typeof snippet.previewImage).toBe('string');
                }
            });
        });

        test('should have unique snippet IDs', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            const ids = snippets.map(snippet => snippet.id);
            const uniqueIds = [...new Set(ids)];
            
            expect(uniqueIds.length).toBe(ids.length);
        });

        test('should have valid HTML structure', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            snippets.forEach(snippet => {
                // Basic HTML validation - should contain elements
                expect(snippet.html.includes('<')).toBe(true);
                expect(snippet.html.includes('>')).toBe(true);
                
                // Should not contain script tags for security
                expect(snippet.html.toLowerCase().includes('<script')).toBe(false);
            });
        });
    });

    describe('Snippet Retrieval Methods', () => {
        test('getAllCustomSnippets should return all snippets', () => {
            const allSnippets = DragonSnippets.getAllCustomSnippets();
            const originalSnippets = DragonSnippets.customSnippets;
            
            expect(allSnippets).toEqual(originalSnippets);
            expect(allSnippets.length).toBe(originalSnippets.length);
        });

        test('getSnippetsByCategory should filter by category', () => {
            const contentSnippets = DragonSnippets.getSnippetsByCategory('content');
            const marketingSnippets = DragonSnippets.getSnippetsByCategory('marketing');
            
            contentSnippets.forEach(snippet => {
                expect(snippet.category).toBe('content');
            });

            marketingSnippets.forEach(snippet => {
                expect(snippet.category).toBe('marketing');
            });

            // Should return empty array for non-existent category
            const nonExistentSnippets = DragonSnippets.getSnippetsByCategory('nonexistent');
            expect(nonExistentSnippets).toEqual([]);
        });

        test('getSnippetById should return specific snippet', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            const firstSnippet = snippets[0];
            
            const foundSnippet = DragonSnippets.getSnippetById(firstSnippet.id);
            expect(foundSnippet).toEqual(firstSnippet);
            
            // Should return undefined for non-existent ID
            const nonExistentSnippet = DragonSnippets.getSnippetById('non-existent-id');
            expect(nonExistentSnippet).toBeUndefined();
        });

        test('getCategories should return sorted unique categories', () => {
            const categories = DragonSnippets.getCategories();
            const allSnippets = DragonSnippets.getAllCustomSnippets();
            const expectedCategories = [...new Set(allSnippets.map(snippet => snippet.category).filter(Boolean))].sort();
            
            expect(categories).toEqual(expectedCategories);
            expect(Array.isArray(categories)).toBe(true);
        });
    });

    describe('Dynamic Snippet Management', () => {
        test('addCustomSnippet should add valid snippets', () => {
            const initialCount = DragonSnippets.getAllCustomSnippets().length;
            
            const newSnippet = {
                id: 'test-snippet',
                name: 'Test Snippet',
                html: '<div class="test-snippet">Test content</div>',
                preview: 'text',
                description: 'A test snippet',
                category: 'test',
                snippetType: 'content'
            };
            
            const result = DragonSnippets.addCustomSnippet(newSnippet);
            
            expect(result).toBe(true);
            expect(DragonSnippets.getAllCustomSnippets().length).toBe(initialCount + 1);
            
            const addedSnippet = DragonSnippets.getSnippetById('test-snippet');
            expect(addedSnippet).toBeDefined();
            expect(addedSnippet.type).toBe('snippet'); // Should be auto-set
            expect(addedSnippet.name).toBe('Test Snippet');
        });

        test('addCustomSnippet should reject invalid snippets', () => {
            const initialCount = DragonSnippets.getAllCustomSnippets().length;
            
            // Missing required properties
            const invalidSnippets = [
                { name: 'No ID', html: '<div>test</div>' }, // missing id
                { id: 'no-name', html: '<div>test</div>' }, // missing name
                { id: 'no-html', name: 'No HTML' }, // missing html
                {} // missing everything
            ];
            
            invalidSnippets.forEach(snippet => {
                const result = DragonSnippets.addCustomSnippet(snippet);
                expect(result).toBe(false);
            });
            
            expect(DragonSnippets.getAllCustomSnippets().length).toBe(initialCount);
        });

        test('addCustomSnippet should reject duplicate IDs', () => {
            const initialCount = DragonSnippets.getAllCustomSnippets().length;
            const existingSnippet = DragonSnippets.getAllCustomSnippets()[0];
            
            const duplicateSnippet = {
                id: existingSnippet.id,
                name: 'Duplicate Snippet',
                html: '<div>duplicate</div>'
            };
            
            const result = DragonSnippets.addCustomSnippet(duplicateSnippet);
            
            expect(result).toBe(false);
            expect(DragonSnippets.getAllCustomSnippets().length).toBe(initialCount);
        });

        test('addCustomSnippet should set default values', () => {
            const newSnippet = {
                id: 'minimal-snippet',
                name: 'Minimal Snippet',
                html: '<div>minimal</div>'
            };
            
            DragonSnippets.addCustomSnippet(newSnippet);
            const addedSnippet = DragonSnippets.getSnippetById('minimal-snippet');
            
            expect(addedSnippet.type).toBe('snippet');
            expect(addedSnippet.preview).toBe('text'); // default value
        });
    });

    describe('Default Snippets Content', () => {
        test('should include expected default snippets', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            const snippetIds = snippets.map(snippet => snippet.id);
            
            // Check for some expected default snippets
            expect(snippetIds).toContain('custom-alert-box');
            expect(snippetIds).toContain('custom-testimonial-card');
            expect(snippetIds).toContain('custom-stat-counter');
            expect(snippetIds).toContain('custom-feature-highlight');
            expect(snippetIds).toContain('custom-code-block');
        });

        test('should have snippets in different categories', () => {
            const categories = DragonSnippets.getCategories();
            
            expect(categories.length).toBeGreaterThan(1);
            expect(categories).toContain('content');
            expect(categories).toContain('marketing');
        });

        test('alert box should have proper structure', () => {
            const alertBox = DragonSnippets.getSnippetById('custom-alert-box');
            
            expect(alertBox).toBeDefined();
            expect(alertBox.name).toBe('Alert Box');
            expect(alertBox.type).toBe('snippet');
            expect(alertBox.category).toBe('content');
            expect(alertBox.html).toContain('alert-box');
            expect(alertBox.description).toContain('styled alert box');
        });

        test('testimonial card should have proper structure', () => {
            const testimonialCard = DragonSnippets.getSnippetById('custom-testimonial-card');
            
            expect(testimonialCard).toBeDefined();
            expect(testimonialCard.name).toBe('Testimonial Card');
            expect(testimonialCard.html).toContain('testimonial-card');
            expect(testimonialCard.html).toContain('★★★★★');
        });

        test('code block should have proper structure', () => {
            const codeBlock = DragonSnippets.getSnippetById('custom-code-block');
            
            expect(codeBlock).toBeDefined();
            expect(codeBlock.name).toBe('Code Block');
            expect(codeBlock.category).toBe('content');
            
            // Should contain code elements
            expect(codeBlock.html).toContain('<pre');
            expect(codeBlock.html).toContain('<code');
        });
    });

    describe('HTML Content Quality', () => {
        test('snippets should not contain malicious content', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            snippets.forEach(snippet => {
                const html = snippet.html.toLowerCase();
                
                // Should not contain script tags
                expect(html.includes('<script')).toBe(false);
                
                // Should not contain javascript: protocol
                expect(html.includes('javascript:')).toBe(false);
                
                // Should not contain eval or other dangerous functions
                expect(html.includes('eval(')).toBe(false);
            });
        });

        test('snippets should have semantic HTML structure', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            snippets.forEach(snippet => {
                // Should contain proper element structure
                expect(snippet.html.includes('class=') || snippet.html.includes('style=')).toBe(true);
                
                // Should have proper nesting (basic check)
                const openTags = (snippet.html.match(/</g) || []).length;
                const closeTags = (snippet.html.match(/>/g) || []).length;
                expect(openTags).toBeGreaterThan(0);
                expect(closeTags).toBeGreaterThan(0);
            });
        });

        test('snippets should have appropriate styling', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            snippets.forEach(snippet => {
                const html = snippet.html.toLowerCase();
                
                // Most snippets should have some styling
                const hasStylePatterns = 
                    html.includes('style=') ||
                    html.includes('class=') ||
                    html.includes('background') ||
                    html.includes('color') ||
                    html.includes('padding') ||
                    html.includes('margin');
                
                expect(hasStylePatterns).toBe(true);
            });
        });
    });

    describe('Integration with Snippet Panel', () => {
        test('snippets should be compatible with createSnippetItem', () => {
            const snippets = DragonSnippets.getAllCustomSnippets();
            
            // Mock createSnippetItem requirements
            snippets.forEach(snippet => {
                // Should have properties that createSnippetItem expects
                expect(snippet.type).toBeDefined();
                expect(snippet.name).toBeDefined();
                expect(snippet.html).toBeDefined();
                expect(snippet.id).toBeDefined();
                
                // Optional properties should be valid if present
                if (snippet.description) {
                    expect(typeof snippet.description).toBe('string');
                    expect(snippet.description.length).toBeGreaterThan(0);
                }
                
                if (snippet.category) {
                    expect(typeof snippet.category).toBe('string');
                    expect(snippet.category.length).toBeGreaterThan(0);
                }

                if (snippet.snippetType) {
                    expect(typeof snippet.snippetType).toBe('string');
                    expect(snippet.snippetType.length).toBeGreaterThan(0);
                }
            });
        });
    });
});