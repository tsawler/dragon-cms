/**
 * DragonCMS Font Configuration
 * 
 * This file allows you to customize the fonts available in the formatting toolbar.
 * Simply copy and paste Google Fonts embed links from fonts.google.com
 * 
 * Usage:
 * 1. Go to fonts.google.com and select your fonts
 * 2. Copy the <link> embed code 
 * 3. Add it to the googleFontLinks array below
 * 4. The fonts will automatically appear in the formatting toolbar dropdown
 * 
 * Example:
 * '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">'
 */

// Define available fonts
window.DragonFonts = {
    // Default system fonts (always available)
    systemFonts: [
        {
            name: "Arial",
            family: "Arial, sans-serif"
        },
        {
            name: "Georgia", 
            family: "Georgia, serif"
        },
        {
            name: "Times New Roman",
            family: "'Times New Roman', serif"
        },
        {
            name: "Courier New",
            family: "'Courier New', monospace"
        },
        {
            name: "Helvetica",
            family: "Helvetica, sans-serif"
        },
        {
            name: "Verdana",
            family: "Verdana, sans-serif"
        }
    ],

    // Google Fonts - just paste the embed links from Google Fonts here
    googleFontLinks: [
        '<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">',
        '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
    ],

    // Parsed Google Fonts (populated automatically)
    parsedGoogleFonts: [],

    // Parse Google Font links and extract font information
    parseGoogleFonts() {
        this.parsedGoogleFonts = [];
        
        this.googleFontLinks.forEach(linkHtml => {
            const fonts = this.parseFontLink(linkHtml);
            this.parsedGoogleFonts.push(...fonts);
        });

        return this.parsedGoogleFonts;
    },

    // Parse a single Google Font link and extract font names
    parseFontLink(linkHtml) {
        const fonts = [];
        
        try {
            // Extract the href URL from the link tag
            const hrefMatch = linkHtml.match(/href="([^"]+)"/);
            if (!hrefMatch) return fonts;
            
            const url = hrefMatch[1];
            
            // Extract family parameters from the URL
            const familyMatches = url.match(/family=([^&]+)/g);
            if (!familyMatches) return fonts;
            
            familyMatches.forEach(familyParam => {
                // Extract just the font name part (before : or &)
                const fontName = familyParam
                    .replace('family=', '')
                    .split(':')[0]
                    .replace(/\+/g, ' ')
                    .replace(/%20/g, ' ')
                    .trim();
                
                if (fontName) {
                    const fallback = this.getFontFallback(fontName);
                    fonts.push({
                        name: fontName,
                        family: `'${fontName}', ${fallback}`,
                        category: fallback
                    });
                }
            });
        } catch (error) {
            console.warn('Error parsing Google Font link:', linkHtml, error);
        }
        
        return fonts;
    },

    // Get appropriate fallback font family based on font name
    getFontFallback(fontName) {
        const lowerName = fontName.toLowerCase();
        
        // Serif fonts
        const serifPatterns = ['serif', 'times', 'georgia', 'playfair', 'merriweather', 'crimson', 'lora', 'pt serif', 'libre baskerville'];
        if (serifPatterns.some(pattern => lowerName.includes(pattern))) {
            return 'serif';
        }
        
        // Monospace fonts
        const monospacePatterns = ['mono', 'code', 'courier', 'inconsolata', 'source code', 'fira code', 'jetbrains', 'roboto mono'];
        if (monospacePatterns.some(pattern => lowerName.includes(pattern))) {
            return 'monospace';
        }
        
        // Default to sans-serif
        return 'sans-serif';
    },

    // Get all fonts (system + parsed google fonts)
    getAllFonts() {
        if (this.parsedGoogleFonts.length === 0) {
            this.parseGoogleFonts();
        }
        return [...this.systemFonts, ...this.parsedGoogleFonts];
    },

    // Load Google Fonts by injecting link tags into the document head
    loadGoogleFonts() {
        this.googleFontLinks.forEach((linkHtml, index) => {
            const linkId = `dragon-google-font-${index}`;
            
            // Check if this font is already loaded
            if (!document.getElementById(linkId)) {
                // Create a temporary container to parse the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = linkHtml;
                const linkElement = tempDiv.querySelector('link');
                
                if (linkElement) {
                    linkElement.id = linkId;
                    document.head.appendChild(linkElement);
                }
            }
        });
    }
};