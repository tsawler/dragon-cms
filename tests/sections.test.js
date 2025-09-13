/**
 * Tests for the sections system
 * Tests section functionality, CRUD operations, and integration
 */

const fs = require('fs');
const path = require('path');

describe('Sections System', () => {
    let getSections, getSnippetById, SNIPPET_LIBRARY;
    
    beforeEach(() => {
        // Clear any existing window
        if (global.window) {
            delete global.window;
        }
        
        // Create fresh window object
        global.window = {};
        global.document = {
            createElement: (tag) => ({ 
                tagName: tag.toUpperCase(),
                classList: { contains: () => false, add: () => {}, remove: () => {} },
                querySelector: () => null,
                querySelectorAll: () => [],
                appendChild: () => {},
                style: {}
            })
        };
        
        // Load snippets.js content to get sections
        const snippetsPath = path.join(__dirname, '..', 'snippets.js');
        const snippetsContent = fs.readFileSync(snippetsPath, 'utf8');
        eval(snippetsContent);
        
        getSections = global.window.getSections;
        getSnippetById = global.window.getSnippetById;
        SNIPPET_LIBRARY = global.window.SNIPPET_LIBRARY;
    });
    
    afterEach(() => {
        delete global.window;
        delete global.document;
    });
    
    describe('Section Definition Loading', () => {
        test('should have getSections function available', () => {
            expect(getSections).toBeDefined();
            expect(typeof getSections).toBe('function');
        });
        
        test('should return array of sections', () => {
            const sections = getSections();
            expect(Array.isArray(sections)).toBe(true);
            expect(sections.length).toBeGreaterThan(0);
        });
        
        test('should have required section properties', () => {
            const sections = getSections();
            const firstSection = sections[0];
            
            expect(firstSection).toHaveProperty('id');
            expect(firstSection).toHaveProperty('name');
            expect(firstSection).toHaveProperty('type');
            expect(firstSection).toHaveProperty('html');
            expect(firstSection.type).toBe('section');
        });
        
        test('should include expected sections', () => {
            const sections = getSections();
            const sectionIds = sections.map(s => s.id);
            
            expect(sectionIds).toContain('hero-section');
            expect(sectionIds).toContain('content-section');
            expect(sectionIds).toContain('features-section');
            expect(sectionIds).toContain('cta-section');
            expect(sectionIds).toContain('footer-section');
        });
    });
    
    describe('Section HTML Structure', () => {
        test('sections should have correct HTML structure', () => {
            const sections = getSections();
            sections.forEach(section => {
                expect(section.html).toContain('<section');
                expect(section.html).toContain('editor-section');
                expect(section.html).toContain('section-content');
            });
        });
        
        test('sections should have proper styling', () => {
            const sections = getSections();
            const heroSection = sections.find(s => s.id === 'hero-section');
            
            expect(heroSection.html).toContain('width: 100%');
            expect(heroSection.html).toContain('padding:');
        });
    });
    
    describe('Section Previews', () => {
        test('should have preview images for sections', () => {
            const sections = getSections();
            sections.forEach(section => {
                expect(section.preview).toBe('image');
                expect(section.previewImage).toBeDefined();
                expect(section.previewImage).toContain('data:image/svg+xml');
            });
        });
    });
    
    // Note: More complex DOM-dependent tests would require full browser environment
    // These basic tests verify the section system is properly integrated
    
    describe('Section Integration', () => {
        test('should include sections in getSnippetById', () => {
            const getSnippetById = global.window.getSnippetById;
            expect(getSnippetById).toBeDefined();
            
            const heroSection = getSnippetById('hero-section');
            expect(heroSection).toBeDefined();
            expect(heroSection.type).toBe('section');
        });
        
        test('should export sections properly', () => {
            expect(global.window.SNIPPET_LIBRARY.sections).toBeDefined();
            expect(Array.isArray(global.window.SNIPPET_LIBRARY.sections)).toBe(true);
        });
    });
    
});