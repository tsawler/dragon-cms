/**
 * Simple tests for the Google Fonts system functionality
 * Tests font parsing, fallback detection, and integration
 */

// Import the actual fonts.js content and test it
const fs = require('fs');
const path = require('path');

describe('Google Fonts System', () => {
    let DragonFonts;

    beforeEach(() => {
        // Clear any existing window
        if (global.window) {
            delete global.window;
        }

        // Create fresh window object
        global.window = {};

        // Load and execute fonts.js
        const fontsPath = path.join(__dirname, '..', 'fonts.js');
        const fontsContent = fs.readFileSync(fontsPath, 'utf8');
        eval(fontsContent);

        DragonFonts = global.window.DragonFonts;

        // Mock document for testing
        const mockAppendChild = jest.fn();
        const mockCreateElement = jest.fn(() => ({
            innerHTML: '',
            querySelector: jest.fn(() => ({
                id: '',
                appendChild: jest.fn()
            })),
            appendChild: jest.fn()
        }));
        const mockGetElementById = jest.fn(() => null);
        
        global.document = {
            createElement: mockCreateElement,
            getElementById: mockGetElementById,
            head: {
                appendChild: mockAppendChild
            }
        };
    });

    afterEach(() => {
        delete global.window;
        delete global.document;
        jest.clearAllMocks();
    });

    describe('Font Link Parsing', () => {
        test('should parse single font from Google Fonts link', () => {
            const link = '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(link);
            
            expect(parsed).toHaveLength(1);
            expect(parsed[0]).toEqual({
                name: 'Roboto',
                family: "'Roboto', sans-serif",
                category: 'sans-serif'
            });
        });

        test('should parse multiple fonts from single link', () => {
            const link = '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400&family=Lato:wght@400;700&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(link);
            
            expect(parsed).toHaveLength(2);
            expect(parsed[0].name).toBe('Open Sans');
            expect(parsed[1].name).toBe('Lato');
        });

        test('should handle URL encoded spaces', () => {
            const link = '<link href="https://fonts.googleapis.com/css2?family=Source%20Sans%20Pro:wght@400&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(link);
            
            expect(parsed[0].name).toBe('Source Sans Pro');
        });

        test('should handle plus-encoded spaces', () => {
            const link = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(link);
            
            expect(parsed[0].name).toBe('Playfair Display');
            expect(parsed[0].category).toBe('serif');
        });

        test('should return empty array for invalid links', () => {
            const invalidLinks = [
                '<link href="invalid-url" rel="stylesheet">',
                '<div>Not a link</div>',
                ''
            ];

            invalidLinks.forEach(link => {
                const parsed = DragonFonts.parseFontLink(link);
                expect(parsed).toEqual([]);
            });
        });
    });

    describe('Fallback Assignment', () => {
        test('should assign serif fallback correctly', () => {
            const serifFonts = ['Playfair Display', 'Merriweather', 'Times New Roman'];
            
            serifFonts.forEach(font => {
                expect(DragonFonts.getFontFallback(font)).toBe('serif');
            });
        });

        test('should assign monospace fallback correctly', () => {
            const monoFonts = ['Fira Code', 'Source Code Pro', 'Roboto Mono'];
            
            monoFonts.forEach(font => {
                expect(DragonFonts.getFontFallback(font)).toBe('monospace');
            });
        });

        test('should default to sans-serif', () => {
            const sansFonts = ['Roboto', 'Open Sans', 'Random Font'];
            
            sansFonts.forEach(font => {
                expect(DragonFonts.getFontFallback(font)).toBe('sans-serif');
            });
        });

        test('should be case insensitive', () => {
            expect(DragonFonts.getFontFallback('PLAYFAIR DISPLAY')).toBe('serif');
            expect(DragonFonts.getFontFallback('fira code')).toBe('monospace');
        });
    });

    describe('Font Collection', () => {
        test('should combine system and Google fonts', () => {
            // Reset parsed fonts
            DragonFonts.parsedGoogleFonts = [];
            DragonFonts.googleFontLinks = [
                '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">'
            ];

            const allFonts = DragonFonts.getAllFonts();
            
            expect(allFonts.length).toBeGreaterThan(6); // Should have system + Google fonts
            expect(allFonts.some(font => font.name === 'Arial')).toBe(true);
            expect(allFonts.some(font => font.name === 'Roboto')).toBe(true);
        });

        test('should parse Google fonts automatically', () => {
            DragonFonts.parsedGoogleFonts = [];
            DragonFonts.googleFontLinks = [
                '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap" rel="stylesheet">'
            ];

            const allFonts = DragonFonts.getAllFonts();
            
            expect(DragonFonts.parsedGoogleFonts.length).toBe(1);
            expect(DragonFonts.parsedGoogleFonts[0].name).toBe('Inter');
        });
    });

    describe('Font Loading', () => {
        test('should attempt to inject font links into document head', () => {
            DragonFonts.googleFontLinks = [
                '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">'
            ];

            // Test that the method runs without error
            expect(() => DragonFonts.loadGoogleFonts()).not.toThrow();
        });

        test('should handle duplicate font checking', () => {
            DragonFonts.googleFontLinks = [
                '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap" rel="stylesheet">'
            ];

            // Mock existing font
            const mockGetElementById = jest.fn(() => ({ id: 'dragon-google-font-0' }));
            global.document.getElementById = mockGetElementById;

            expect(() => DragonFonts.loadGoogleFonts()).not.toThrow();
            expect(mockGetElementById).toHaveBeenCalledWith('dragon-google-font-0');
        });
    });

    describe('Error Handling', () => {
        test('should handle malformed URLs gracefully', () => {
            const malformedLinks = [
                '<link href="not-a-url">',
                '<link href="https://example.com/font.css">',
                'invalid html'
            ];

            malformedLinks.forEach(link => {
                expect(() => DragonFonts.parseFontLink(link)).not.toThrow();
                expect(DragonFonts.parseFontLink(link)).toEqual([]);
            });
        });

        test('should handle empty font links', () => {
            DragonFonts.googleFontLinks = [];
            
            const parsed = DragonFonts.parseGoogleFonts();
            expect(parsed).toEqual([]);
        });

        test('should handle complex Google Fonts URLs', () => {
            const complexLink = '<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(complexLink);
            
            expect(parsed).toHaveLength(1);
            expect(parsed[0].name).toBe('Inter');
        });
    });

    describe('Real-world Examples', () => {
        test('should handle actual Google Fonts embed code', () => {
            // Real example from fonts.google.com - just the stylesheet link
            const realGoogleFontsLink = '<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(realGoogleFontsLink);
            
            expect(parsed).toHaveLength(1);
            expect(parsed[0].name).toBe('Roboto');
            expect(parsed[0].family).toBe("'Roboto', sans-serif");
        });

        test('should handle fonts with numbers and special characters', () => {
            const fontWithNumbers = '<link href="https://fonts.googleapis.com/css2?family=Archivo+Black:wght@400&display=swap" rel="stylesheet">';
            
            const parsed = DragonFonts.parseFontLink(fontWithNumbers);
            
            expect(parsed[0].name).toBe('Archivo Black');
        });

        test('should provide correct CSS font family strings', () => {
            const testCases = [
                { 
                    link: '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400&display=swap" rel="stylesheet">',
                    expected: "'Playfair Display', serif"
                },
                {
                    link: '<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400&display=swap" rel="stylesheet">',
                    expected: "'Fira Code', monospace"
                },
                {
                    link: '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap" rel="stylesheet">',
                    expected: "'Open Sans', sans-serif"
                }
            ];

            testCases.forEach(({ link, expected }) => {
                const parsed = DragonFonts.parseFontLink(link);
                expect(parsed[0].family).toBe(expected);
            });
        });
    });
});