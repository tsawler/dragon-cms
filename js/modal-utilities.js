/**
 * Modal Utilities - Helper functions for creating modal elements
 * Reduces repetitive CSS-in-JS patterns in modals
 */

/**
 * Common CSS units for dimension inputs
 */
export const CSS_UNITS = {
    spacing: ['px', 'em', 'rem', '%', 'vh', 'vw'],
    spacingWithAuto: ['px', 'em', 'rem', '%', 'vh', 'vw', 'auto']
};

/**
 * Common inline styles as reusable objects
 */
export const STYLES = {
    formSection: {
        marginBottom: '2rem',
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#f9fafb'
    },
    sectionTitle: {
        margin: '0 0 1rem 0',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#374151'
    },
    spacingGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.75rem'
    },
    formGroup: {
        margin: '0'
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '500',
        marginBottom: '0.25rem',
        color: '#6b7280'
    },
    inputWrapper: {
        display: 'flex',
        gap: '0.25rem'
    },
    numberInput: {
        flex: '2',
        minWidth: '60px',
        padding: '0.375rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '0.875rem'
    },
    unitSelect: {
        flex: '1',
        maxWidth: '70px',
        padding: '0.375rem',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '0.875rem',
        background: 'white'
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        fontSize: '0.75rem',
        textDecoration: 'underline'
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginTop: '1.5rem'
    },
    cancelButton: {
        padding: '0.5rem 1rem',
        border: '1px solid #ddd',
        background: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif'
    },
    primaryButton: {
        padding: '0.5rem 1rem',
        border: '1px solid #3b82f6',
        background: '#3b82f6',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        transition: 'all 0.2s',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif'
    }
};

/**
 * Convert style object to inline style string
 */
export function styleToString(styleObj) {
    return Object.entries(styleObj)
        .map(([key, value]) => {
            // Convert camelCase to kebab-case
            const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${kebabKey}: ${value}`;
        })
        .join('; ');
}

/**
 * Create a spacing control (for padding/margin)
 */
export function createSpacingControl(type, direction, options = {}) {
    const includeAuto = options.includeAuto || false;
    const units = includeAuto ? CSS_UNITS.spacingWithAuto : CSS_UNITS.spacing;

    return `
        <div class="form-group" style="${styleToString(STYLES.formGroup)}">
            <label style="${styleToString(STYLES.label)}">${direction.charAt(0).toUpperCase() + direction.slice(1)}</label>
            <div style="${styleToString(STYLES.inputWrapper)}">
                <input type="number" class="style-${type}-${direction}" placeholder="0" style="${styleToString(STYLES.numberInput)}">
                <select class="style-${type}-${direction}-unit" style="${styleToString(STYLES.unitSelect)}">
                    ${units.map(unit => `<option value="${unit}">${unit}</option>`).join('')}
                </select>
            </div>
        </div>
    `;
}

/**
 * Create a complete spacing section (padding or margin)
 */
export function createSpacingSection(type, options = {}) {
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const directions = ['top', 'right', 'bottom', 'left'];

    return `
        <div class="form-section" style="${styleToString(STYLES.formSection)}">
            <h3 style="${styleToString(STYLES.sectionTitle)}">${title}</h3>
            <div class="spacing-controls" style="${styleToString(STYLES.spacingGrid)}">
                ${directions.map(dir => createSpacingControl(type, dir, options)).join('')}
            </div>
            <div style="margin-top: 0.75rem; text-align: center;">
                <button type="button" class="link-all-${type}" style="${styleToString(STYLES.linkButton)}">Link all sides</button>
            </div>
        </div>
    `;
}

/**
 * Create modal footer with cancel and save buttons
 */
export function createModalFooter(saveText = 'Apply') {
    return `
        <div class="modal-footer" style="${styleToString(STYLES.modalFooter)}">
            <button class="btn modal-cancel" style="${styleToString(STYLES.cancelButton)}">Cancel</button>
            <button class="btn btn-primary modal-save" style="${styleToString(STYLES.primaryButton)}">${saveText}</button>
        </div>
    `;
}

/**
 * Unified syntax highlighting function
 */
export function highlightSyntax(code, language = 'auto') {
    // Auto-detect language if not specified
    if (language === 'auto') {
        language = detectLanguage(code);
    }

    // Escape HTML first
    let highlighted = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    switch (language) {
        case 'html':
            return highlightHTML(highlighted);
        case 'css':
            return highlightCSS(highlighted);
        case 'javascript':
        case 'js':
            return highlightJavaScript(highlighted);
        default:
            return highlighted;
    }
}

/**
 * Detect code language
 */
function detectLanguage(code) {
    // CSS detection
    if (code.includes('<style') || (code.includes('{') && code.includes(':') && code.includes(';'))) {
        return 'css';
    }
    // JavaScript detection
    if (code.includes('function') || code.includes('var ') || code.includes('let ') || code.includes('const ')) {
        return 'javascript';
    }
    // Default to HTML
    return 'html';
}

/**
 * Highlight HTML code
 */
function highlightHTML(code) {
    return code
        // Comments
        .replace(/(&lt;!--.*?--&gt;)/g, '<span class="syntax-comment">$1</span>')
        // Tags with attributes
        .replace(/(&lt;\/?)([\w-]+)([^&]*?)(&gt;)/g, (match, open, tagName, attrs, close) => {
            const highlightedAttrs = attrs.replace(/([\w-]+)(=)([&"'][^&"']*[&"'])/g,
                '<span class="syntax-attribute">$1</span>$2<span class="syntax-string">$3</span>');
            return `${open}<span class="syntax-tag">${tagName}</span>${highlightedAttrs}${close}`;
        });
}

/**
 * Highlight CSS code
 */
function highlightCSS(code) {
    return code
        // Comments
        .replace(/(\/\*.*?\*\/)/g, '<span class="syntax-comment">$1</span>')
        // Selectors
        .replace(/^([^{]+)(\{)/gm, '<span class="syntax-css-selector">$1</span>$2')
        // Properties and values
        .replace(/([\w-]+)(\s*:\s*)([^;]+)(;)/g,
            '<span class="syntax-css-property">$1</span>$2<span class="syntax-css-value">$3</span>$4');
}

/**
 * Highlight JavaScript code
 */
function highlightJavaScript(code) {
    const keywords = [
        'var', 'let', 'const', 'function', 'if', 'else', 'for', 'while', 'do',
        'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch',
        'finally', 'throw', 'new', 'this', 'class', 'extends', 'super', 'async',
        'await', 'yield', 'import', 'export', 'from', 'of', 'in'
    ];

    // Protected ranges for strings and comments
    const protectedRanges = [];
    let result = code;

    // Protect strings
    result = protectPattern(result, /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, 'syntax-js-string', protectedRanges);

    // Protect single-line comments
    result = protectPattern(result, /\/\/.*$/gm, 'syntax-js-comment', protectedRanges);

    // Protect multi-line comments
    result = protectPattern(result, /\/\*[\s\S]*?\*\//g, 'syntax-js-comment', protectedRanges);

    // Apply keywords
    const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
    result = result.replace(keywordRegex, '<span class="syntax-js-keyword">$1</span>');

    // Apply function names
    result = result.replace(/\b(\w+)(?=\s*\()/g, '<span class="syntax-js-function">$1</span>');

    // Apply numbers
    result = result.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syntax-js-number">$1</span>');

    // Restore protected ranges
    protectedRanges.forEach((replacement, index) => {
        result = result.replace(`__PROTECTED_${index}__`, replacement);
    });

    return result;
}

/**
 * Helper to protect code patterns from further processing
 */
function protectPattern(text, regex, className, protectedRanges) {
    let result = text;
    let match;

    while ((match = regex.exec(result)) !== null) {
        const placeholder = `__PROTECTED_${protectedRanges.length}__`;
        protectedRanges.push(`<span class="${className}">${match[0]}</span>`);
        result = result.substring(0, match.index) + placeholder + result.substring(match.index + match[0].length);
        regex.lastIndex = match.index + placeholder.length;
    }

    return result;
}

/**
 * Export for global access (for backward compatibility)
 */
if (typeof window !== 'undefined') {
    window.modalUtilities = {
        CSS_UNITS,
        STYLES,
        styleToString,
        createSpacingControl,
        createSpacingSection,
        createModalFooter,
        highlightSyntax
    };
}