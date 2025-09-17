/**
 * Utilities Module - Shared utility functions for DragonCMS
 * Consolidates duplicated code patterns across the codebase
 */

export class CSSUtilities {
    /**
     * Parse CSS value with unit (e.g., "10px", "1.5em", "auto")
     * @param {string} cssValue - CSS value to parse
     * @returns {Object} - {value: number|string, unit: string}
     */
    static parseValueUnit(cssValue) {
        if (!cssValue) {
            return { value: '', unit: 'px' };
        }
        if (cssValue === 'auto') {
            return { value: '', unit: 'auto' };
        }
        if (cssValue === '0') {
            return { value: 0, unit: 'px' };
        }

        // Match number followed by optional unit
        const match = cssValue.match(/^([\d.-]+)(.*)$/);
        if (match) {
            return {
                value: parseFloat(match[1]) || '',
                unit: match[2] || 'px'
            };
        }

        return { value: cssValue, unit: '' };
    }

    /**
     * Format value with unit for CSS
     * @param {number|string} value - Numeric value
     * @param {string} unit - CSS unit (px, em, %, etc.)
     * @returns {string} - Formatted CSS value
     */
    static formatValueWithUnit(value, unit = 'px') {
        if (value === '' || value === null || value === undefined) {
            return '';
        }
        if (unit === 'auto') {
            return 'auto';
        }
        return value + unit;
    }

    /**
     * Apply styles to element with proper unit handling
     * @param {HTMLElement} element - Target element
     * @param {Object} styles - Styles object {property: value}
     * @param {string} defaultUnit - Default unit for numeric values
     */
    static applyStyles(element, styles, defaultUnit = 'px') {
        Object.entries(styles).forEach(([property, value]) => {
            if (value === null || value === undefined || value === '') {
                return;
            }

            // Convert camelCase to kebab-case for CSS properties
            const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();

            if (typeof value === 'number') {
                element.style.setProperty(cssProperty, value + defaultUnit);
            } else {
                element.style.setProperty(cssProperty, value);
            }
        });
    }

    /**
     * Get computed style value with unit parsing
     * @param {HTMLElement} element - Target element
     * @param {string} property - CSS property name
     * @returns {Object} - {value: number|string, unit: string}
     */
    static getComputedValueUnit(element, property) {
        const computedStyle = window.getComputedStyle(element);
        const cssValue = computedStyle[property];
        return this.parseValueUnit(cssValue);
    }
}

export class ColorUtilities {
    /**
     * Convert RGB color to HEX format
     * @param {string} rgb - RGB color string (rgb(r,g,b) or rgba(r,g,b,a))
     * @returns {string|null} - HEX color string or 'transparent'
     */
    static rgbToHex(rgb) {
        // Handle empty string specifically - return null to allow fallbacks
        if (rgb === '') {
            return null;
        }

        if (!rgb || rgb === 'rgba(0, 0, 0, 0)' || rgb === 'transparent') {
            return 'transparent';
        }

        // Already in hex format
        if (rgb.startsWith('#')) {
            return rgb;
        }

        // Extract RGB values
        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) {
            return '#ffffff';
        }

        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);

        // Convert to hex
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Convert HEX color to RGB format
     * @param {string} hex - HEX color string
     * @returns {string|null} - RGB color string
     */
    static hexToRgb(hex) {
        if (!hex || !hex.startsWith('#')) {
            return null;
        }

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) {
            return null;
        }

        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Validate if a color string is valid
     * @param {string} color - Color string to validate
     * @returns {boolean} - True if valid color
     */
    static isValidColor(color) {
        if (!color) return false;

        // Create a temporary element to test color validity
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        return tempElement.style.color !== '';
    }

    /**
     * Get contrasting text color (black or white) for a background color
     * @param {string} backgroundColor - Background color (hex or rgb)
     * @returns {string} - '#ffffff' or '#000000'
     */
    static getContrastingColor(backgroundColor) {
        // Convert to RGB if hex
        let rgb = backgroundColor;
        if (backgroundColor.startsWith('#')) {
            rgb = this.hexToRgb(backgroundColor);
        }

        if (!rgb) return '#000000';

        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#000000';

        const r = parseInt(result[0]);
        const g = parseInt(result[1]);
        const b = parseInt(result[2]);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
}

export class ValidationUtilities {
    /**
     * Sanitize URL to prevent XSS attacks
     * @param {string} url - URL to sanitize
     * @returns {string|null} - Sanitized URL or null if invalid
     */
    static sanitizeURL(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        // Trim and normalize
        url = url.trim();
        if (!url) {
            return null;
        }

        // Block dangerous protocols
        const dangerousProtocols = [
            'javascript:', 'data:', 'vbscript:', 'file:', 'about:',
            'chrome:', 'chrome-extension:', 'moz-extension:'
        ];

        const lowerUrl = url.toLowerCase();
        for (const protocol of dangerousProtocols) {
            if (lowerUrl.startsWith(protocol)) {
                return null;
            }
        }

        // Basic URL validation - check for valid URL structure
        try {
            // If it starts with protocol, validate as full URL
            if (url.includes('://')) {
                const urlObj = new URL(url);
                // Only allow http, https, mailto, tel protocols
                const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
                if (!allowedProtocols.includes(urlObj.protocol)) {
                    return null;
                }
            } else if (url.startsWith('tel:') || url.startsWith('mailto:')) {
                // Handle tel: and mailto: without ://
                return url;
            } else if (url.startsWith('//')) {
                // Protocol-relative URL
                new URL('https:' + url);
            } else if (url.startsWith('/')) {
                // Absolute path
                // Valid as-is
            } else if (url.startsWith('#')) {
                // Fragment identifier
                // Valid as-is
            } else {
                // Relative URL or missing protocol - add https://
                new URL('https://' + url);
                return 'https://' + url;
            }

            return url;
        } catch (e) {
            return null;
        }
    }

    /**
     * Sanitize HTML content to prevent XSS
     * @param {string} html - HTML content to sanitize
     * @returns {string} - Sanitized HTML
     */
    static sanitizeHTML(html) {
        if (!html || typeof html !== 'string') {
            return '';
        }

        // Create temporary element to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Remove script tags and event handlers
        const scripts = temp.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        // Remove dangerous attributes
        const dangerousAttributes = [
            'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
            'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
            'onkeydown', 'onkeyup', 'onkeypress'
        ];

        const allElements = temp.querySelectorAll('*');
        allElements.forEach(element => {
            dangerousAttributes.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    element.removeAttribute(attr);
                }
            });

            // Sanitize href attributes
            if (element.hasAttribute('href')) {
                const href = element.getAttribute('href');
                const sanitizedHref = this.sanitizeURL(href);
                if (sanitizedHref) {
                    element.setAttribute('href', sanitizedHref);
                } else {
                    element.removeAttribute('href');
                }
            }
        });

        return temp.innerHTML;
    }

    /**
     * Validate numeric input within range
     * @param {string|number} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {number} defaultValue - Default value if invalid
     * @returns {number} - Validated number
     */
    static validateNumber(value, min = 0, max = Infinity, defaultValue = 0) {
        const num = parseFloat(value);
        if (isNaN(num)) {
            return defaultValue;
        }
        return Math.min(Math.max(num, min), max);
    }
}

export class BrowserUtilities {
    /**
     * Detect if current browser is Edge
     * @returns {boolean} - True if Edge browser
     */
    static isEdge() {
        const userAgent = window.navigator.userAgent;
        return userAgent.indexOf('Edge') > -1 ||
               userAgent.indexOf('Edg') > -1 ||
               userAgent.indexOf('EdgeHTML') > -1;
    }

    /**
     * Detect if current browser is Firefox
     * @returns {boolean} - True if Firefox browser
     */
    static isFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    }

    /**
     * Detect if current browser is Safari
     * @returns {boolean} - True if Safari browser
     */
    static isSafari() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1;
    }

    /**
     * Detect if current browser is Chrome
     * @returns {boolean} - True if Chrome browser
     */
    static isChrome() {
        const userAgent = navigator.userAgent.toLowerCase();
        return userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1;
    }

    /**
     * Get browser-specific CSS prefixes
     * @returns {Array<string>} - Array of CSS prefixes for current browser
     */
    static getCSSPrefixes() {
        if (this.isFirefox()) return ['-moz-'];
        if (this.isSafari()) return ['-webkit-'];
        if (this.isChrome()) return ['-webkit-'];
        if (this.isEdge()) return ['-ms-', '-webkit-'];
        return [];
    }

    /**
     * Apply browser-specific CSS property with prefixes
     * @param {HTMLElement} element - Target element
     * @param {string} property - CSS property name
     * @param {string} value - CSS property value
     */
    static applyPrefixedProperty(element, property, value) {
        const prefixes = this.getCSSPrefixes();

        // Apply prefixed versions
        prefixes.forEach(prefix => {
            element.style.setProperty(prefix + property, value);
        });

        // Apply standard version
        element.style.setProperty(property, value);
    }
}

export class DOMUtilities {
    /**
     * Create element with attributes and content
     * @param {string} tagName - HTML tag name
     * @param {Object} attributes - Attributes object
     * @param {string|HTMLElement|Array} content - Content to append
     * @returns {HTMLElement} - Created element
     */
    static createElement(tagName, attributes = {}, content = null) {
        const element = document.createElement(tagName);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className' || key === 'class') {
                element.className = value;
            } else if (key === 'style' && typeof value === 'object') {
                CSSUtilities.applyStyles(element, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Set content
        if (content !== null) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (typeof item === 'string') {
                        element.insertAdjacentHTML('beforeend', item);
                    } else if (item instanceof HTMLElement) {
                        element.appendChild(item);
                    }
                });
            }
        }

        return element;
    }

    /**
     * Add event listeners to element with automatic cleanup
     * @param {HTMLElement} element - Target element
     * @param {Object} events - Events object {eventType: handler}
     * @returns {Function} - Cleanup function to remove all listeners
     */
    static addEventListeners(element, events) {
        const eventEntries = Object.entries(events);

        eventEntries.forEach(([eventType, handler]) => {
            element.addEventListener(eventType, handler);
        });

        // Return cleanup function
        return () => {
            eventEntries.forEach(([eventType, handler]) => {
                element.removeEventListener(eventType, handler);
            });
        };
    }

    /**
     * Find closest element matching selector, with optional boundary
     * @param {HTMLElement} element - Starting element
     * @param {string} selector - CSS selector
     * @param {HTMLElement} boundary - Stop search at this element
     * @returns {HTMLElement|null} - Matching element or null
     */
    static findClosest(element, selector, boundary = null) {
        let current = element;

        while (current && current !== boundary && current !== document.body) {
            if (current.matches && current.matches(selector)) {
                return current;
            }
            current = current.parentElement;
        }

        return null;
    }

    /**
     * Get element position relative to viewport
     * @param {HTMLElement} element - Target element
     * @returns {Object} - {top, left, bottom, right, width, height}
     */
    static getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Check if element is visible in viewport
     * @param {HTMLElement} element - Target element
     * @returns {boolean} - True if element is visible
     */
    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Smoothly scroll element into view
     * @param {HTMLElement} element - Target element
     * @param {Object} options - Scroll options
     */
    static scrollIntoView(element, options = {}) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
        };

        element.scrollIntoView({ ...defaultOptions, ...options });
    }
}

export class ModalUtilities {
    /**
     * Create standard modal structure
     * @param {string} title - Modal title
     * @param {string|HTMLElement} content - Modal content
     * @param {Object} options - Modal options
     * @returns {HTMLElement} - Modal element
     */
    static createModal(title, content, options = {}) {
        const {
            className = 'modal',
            showCloseButton = true,
            showFooter = true,
            footerButtons = [
                { text: 'Cancel', className: 'btn modal-cancel', action: 'cancel' },
                { text: 'Save', className: 'btn btn-primary modal-save', action: 'save' }
            ]
        } = options;

        const modal = DOMUtilities.createElement('div', { className });

        const modalContent = DOMUtilities.createElement('div', { className: 'modal-content' });

        // Header
        const header = DOMUtilities.createElement('div', { className: 'modal-header' });
        const titleElement = DOMUtilities.createElement('h2', {}, title);
        header.appendChild(titleElement);

        if (showCloseButton) {
            const closeButton = DOMUtilities.createElement('button', {
                className: 'modal-close',
                'aria-label': 'Close'
            }, '&times;');
            header.appendChild(closeButton);
        }

        // Body
        const body = DOMUtilities.createElement('div', { className: 'modal-body' });
        if (typeof content === 'string') {
            body.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            body.appendChild(content);
        }

        modalContent.appendChild(header);
        modalContent.appendChild(body);

        // Footer
        if (showFooter) {
            const footer = DOMUtilities.createElement('div', { className: 'modal-footer' });

            footerButtons.forEach(buttonConfig => {
                const button = DOMUtilities.createElement('button', {
                    className: buttonConfig.className,
                    'data-action': buttonConfig.action
                }, buttonConfig.text);
                footer.appendChild(button);
            });

            modalContent.appendChild(footer);
        }

        modal.appendChild(modalContent);
        return modal;
    }

    /**
     * Setup standard modal event handlers
     * @param {HTMLElement} modal - Modal element
     * @param {Object} handlers - Event handlers {close, cancel, save}
     * @returns {Function} - Cleanup function
     */
    static setupModalEvents(modal, handlers = {}) {
        const events = {};

        // Close button
        const closeButton = modal.querySelector('.modal-close');
        if (closeButton && handlers.close) {
            events.closeClick = (e) => {
                e.preventDefault();
                handlers.close();
            };
            closeButton.addEventListener('click', events.closeClick);
        }

        // Footer buttons
        const cancelButton = modal.querySelector('[data-action="cancel"]');
        if (cancelButton && handlers.cancel) {
            events.cancelClick = (e) => {
                e.preventDefault();
                handlers.cancel();
            };
            cancelButton.addEventListener('click', events.cancelClick);
        }

        const saveButton = modal.querySelector('[data-action="save"]');
        if (saveButton && handlers.save) {
            events.saveClick = (e) => {
                e.preventDefault();
                handlers.save();
            };
            saveButton.addEventListener('click', events.saveClick);
        }

        // Background click
        if (handlers.close) {
            events.backgroundClick = (e) => {
                if (e.target === modal) {
                    handlers.close();
                }
            };
            modal.addEventListener('click', events.backgroundClick);
        }

        // Escape key
        if (handlers.close) {
            events.escapeKey = (e) => {
                if (e.key === 'Escape') {
                    handlers.close();
                }
            };
            document.addEventListener('keydown', events.escapeKey);
        }

        // Return cleanup function
        return () => {
            if (events.closeClick) closeButton.removeEventListener('click', events.closeClick);
            if (events.cancelClick) cancelButton.removeEventListener('click', events.cancelClick);
            if (events.saveClick) saveButton.removeEventListener('click', events.saveClick);
            if (events.backgroundClick) modal.removeEventListener('click', events.backgroundClick);
            if (events.escapeKey) document.removeEventListener('keydown', events.escapeKey);
        };
    }

    /**
     * Show modal with fade-in animation
     * @param {HTMLElement} modal - Modal element
     */
    static showModal(modal) {
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        modal.style.opacity = '0';

        // Force reflow
        modal.offsetHeight;

        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }

    /**
     * Hide modal with fade-out animation
     * @param {HTMLElement} modal - Modal element
     * @param {Function} callback - Callback after hide animation
     */
    static hideModal(modal, callback) {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '0';

        setTimeout(() => {
            if (modal.parentElement) {
                modal.parentElement.removeChild(modal);
            }
            if (callback) callback();
        }, 300);
    }
}

// Export all utilities as a single object for easier importing
export const Utilities = {
    CSS: CSSUtilities,
    Color: ColorUtilities,
    Validation: ValidationUtilities,
    Browser: BrowserUtilities,
    DOM: DOMUtilities,
    Modal: ModalUtilities
};

export default Utilities;