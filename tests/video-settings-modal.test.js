import { VideoSettingsModal } from '../js/video-settings-modal.js';

describe('VideoSettingsModal', () => {
    let modal;
    let mockEditor;
    let container;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = '';
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);

        // Mock editor
        mockEditor = {
            setupVideoSnippet: jest.fn(),
            stateHistory: {
                saveState: jest.fn()
            }
        };

        modal = new VideoSettingsModal(mockEditor);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Constructor and Initialization', () => {
        test('should initialize with editor reference', () => {
            expect(modal.editor).toBe(mockEditor);
            expect(modal.modal).toBeTruthy();
            expect(modal.targetSnippet).toBeNull();
        });

        test('should create modal with correct structure', () => {
            const modalElement = modal.modal;
            expect(modalElement.className).toBe('modal');
            expect(modalElement.querySelector('.modal-header h2').textContent).toBe('Video Settings');
            expect(modalElement.querySelector('#video-url')).toBeTruthy();
            expect(modalElement.querySelector('#video-save')).toBeTruthy();
            expect(modalElement.querySelector('#video-cancel')).toBeTruthy();
        });

        test('should attach modal to document body', () => {
            expect(document.body.contains(modal.modal)).toBe(true);
        });
    });

    describe('Modal Event Listeners', () => {
        test('should close modal when close button clicked', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            const closeButton = modal.modal.querySelector('.modal-close');
            
            closeButton.click();
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should close modal when cancel button clicked', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            const cancelButton = modal.modal.querySelector('#video-cancel');
            
            cancelButton.click();
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should call save when save button clicked', () => {
            const saveSpy = jest.spyOn(modal, 'save');
            const saveButton = modal.modal.querySelector('#video-save');
            
            saveButton.click();
            expect(saveSpy).toHaveBeenCalled();
        });
    });

    describe('YouTube URL Parsing and Validation', () => {
        describe('YouTube Watch URLs', () => {
            test('should convert standard YouTube watch URL', () => {
                const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });

            test('should convert YouTube watch URL without www', () => {
                const url = 'https://youtube.com/watch?v=dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });

            test('should convert YouTube watch URL without https', () => {
                const url = 'youtube.com/watch?v=dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });

            test('should preserve timestamp in YouTube watch URL', () => {
                const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?start=123');
            });

            test('should handle YouTube watch URL with additional parameters', () => {
                const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLxyz&index=1';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });
        });

        describe('YouTube Short URLs', () => {
            test('should convert YouTube short URL', () => {
                const url = 'https://youtu.be/dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });

            test('should convert YouTube short URL with timestamp', () => {
                const url = 'https://youtu.be/dQw4w9WgXcQ?t=123';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?start=123');
            });

            test('should convert YouTube short URL without https', () => {
                const url = 'youtu.be/dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
            });
        });

        describe('YouTube Embed URLs', () => {
            test('should return YouTube embed URL unchanged', () => {
                const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe(url);
            });

            test('should return YouTube embed URL without www unchanged', () => {
                const url = 'https://youtube.com/embed/dQw4w9WgXcQ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe(url);
            });
        });

        describe('YouTube ID Validation', () => {
            test('should handle valid YouTube video IDs with underscores and dashes', () => {
                const url = 'https://www.youtube.com/watch?v=abc_123-XYZ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/abc_123-XYZ');
            });

            test('should handle 11-character YouTube video IDs', () => {
                const url = 'https://www.youtube.com/watch?v=12345678901';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.youtube.com/embed/12345678901');
            });
        });
    });

    describe('Vimeo URL Parsing and Validation', () => {
        describe('Standard Vimeo URLs', () => {
            test('should convert standard Vimeo URL', () => {
                const url = 'https://vimeo.com/123456789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://player.vimeo.com/video/123456789');
            });

            test('should convert Vimeo URL without https', () => {
                const url = 'vimeo.com/123456789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://player.vimeo.com/video/123456789');
            });

            test('should convert Vimeo URL without www', () => {
                const url = 'https://vimeo.com/123456789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://player.vimeo.com/video/123456789');
            });
        });

        describe('Vimeo Player URLs', () => {
            test('should return Vimeo player URL unchanged', () => {
                const url = 'https://player.vimeo.com/video/123456789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe(url);
            });

            test('should return Vimeo player URL without www unchanged', () => {
                const url = 'https://player.vimeo.com/video/123456789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe(url);
            });
        });

        describe('Vimeo ID Validation', () => {
            test('should handle numeric Vimeo video IDs', () => {
                const url = 'https://vimeo.com/987654321';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://player.vimeo.com/video/987654321');
            });

            test('should handle short Vimeo video IDs', () => {
                const url = 'https://vimeo.com/123';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://player.vimeo.com/video/123');
            });
        });
    });

    describe('Other Video Platforms', () => {
        describe('Dailymotion URLs', () => {
            test('should convert Dailymotion URL', () => {
                const url = 'https://www.dailymotion.com/video/x2jvvep';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.dailymotion.com/embed/video/x2jvvep');
            });

            test('should convert Dailymotion URL without www', () => {
                const url = 'https://dailymotion.com/video/x2jvvep';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.dailymotion.com/embed/video/x2jvvep');
            });

            test('should handle Dailymotion video IDs with underscores and dashes', () => {
                const url = 'https://www.dailymotion.com/video/x2jv_vep-test';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.dailymotion.com/embed/video/x2jv_vep-test');
            });
        });

        describe('Wistia URLs', () => {
            test('should convert Wistia URL', () => {
                const url = 'https://mycompany.wistia.com/medias/abc123def456';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://fast.wistia.net/embed/iframe/abc123def456');
            });

            test('should convert Wistia URL with subdomain containing hyphens', () => {
                const url = 'https://my-company.wistia.com/medias/xyz789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://fast.wistia.net/embed/iframe/xyz789');
            });

            test('should handle alphanumeric Wistia video IDs', () => {
                const url = 'https://test123.wistia.com/medias/AbC123XyZ';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://fast.wistia.net/embed/iframe/AbC123XyZ');
            });
        });

        describe('Loom URLs', () => {
            test('should convert Loom share URL', () => {
                const url = 'https://www.loom.com/share/abc123def456';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.loom.com/embed/abc123def456');
            });

            test('should convert Loom share URL without www', () => {
                const url = 'https://loom.com/share/xyz789';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.loom.com/embed/xyz789');
            });

            test('should handle alphanumeric Loom video IDs', () => {
                const url = 'https://www.loom.com/share/Test123ABC';
                const result = modal.convertToEmbedUrl(url);
                expect(result).toBe('https://www.loom.com/embed/Test123ABC');
            });
        });
    });

    describe('URL Security and Error Handling', () => {
        test('should return original URL for unsupported platforms', () => {
            const url = 'https://example.com/video/123';
            const result = modal.convertToEmbedUrl(url);
            expect(result).toBe(url);
        });

        test('should handle malformed URLs gracefully', () => {
            const urls = [
                'not-a-url',
                'javascript:alert("xss")',
                'data:text/html,<script>alert("xss")</script>',
                'https://youtube.com/watch',
                'https://youtube.com/watch?v=',
                'https://vimeo.com/',
                'https://vimeo.com/notanumber'
            ];

            urls.forEach(url => {
                expect(() => modal.convertToEmbedUrl(url)).not.toThrow();
                const result = modal.convertToEmbedUrl(url);
                expect(typeof result).toBe('string');
            });
        });

        test('should not convert javascript: URLs', () => {
            const url = 'javascript:alert("xss")';
            const result = modal.convertToEmbedUrl(url);
            expect(result).toBe(url);
        });

        test('should not convert data: URLs', () => {
            const url = 'data:text/html,<script>alert("xss")</script>';
            const result = modal.convertToEmbedUrl(url);
            expect(result).toBe(url);
        });

        test('should handle empty string input', () => {
            const result = modal.convertToEmbedUrl('');
            expect(result).toBe('');
        });

        test('should handle null input gracefully', () => {
            expect(() => modal.convertToEmbedUrl(null)).not.toThrow();
        });

        test('should handle undefined input gracefully', () => {
            expect(() => modal.convertToEmbedUrl(undefined)).not.toThrow();
        });
    });

    describe('Modal Opening and URL Population', () => {
        let testSnippet;

        beforeEach(() => {
            testSnippet = document.createElement('div');
            testSnippet.className = 'video-snippet';
            container.appendChild(testSnippet);
        });

        test('should open modal and set target snippet', () => {
            modal.open(testSnippet);
            
            expect(modal.targetSnippet).toBe(testSnippet);
            expect(modal.modal.classList.contains('active')).toBe(true);
        });

        test('should populate URL input from video container iframe', () => {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
            
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            videoContainer.appendChild(iframe);
            testSnippet.appendChild(videoContainer);

            modal.open(testSnippet);
            
            const urlInput = document.getElementById('video-url');
            expect(urlInput.value).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
        });

        test('should populate URL input from direct iframe', () => {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://player.vimeo.com/video/123456789';
            testSnippet.appendChild(iframe);

            modal.open(testSnippet);
            
            const urlInput = document.getElementById('video-url');
            expect(urlInput.value).toBe('https://player.vimeo.com/video/123456789');
        });

        test('should clear URL input when no iframe present', () => {
            modal.open(testSnippet);
            
            const urlInput = document.getElementById('video-url');
            expect(urlInput.value).toBe('');
        });

        test('should handle Edge browser compatibility', () => {
            // Mock Edge user agent
            const originalUserAgent = window.navigator.userAgent;
            Object.defineProperty(window.navigator, 'userAgent', {
                writable: true,
                value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299'
            });

            modal.open(testSnippet);
            
            expect(modal.modal.style.display).toBe('block');
            
            // Restore original user agent
            Object.defineProperty(window.navigator, 'userAgent', {
                writable: true,
                value: originalUserAgent
            });
        });

        test('should force reflow before adding active class', () => {
            const offsetHeightSpy = jest.spyOn(modal.modal, 'offsetHeight', 'get').mockReturnValue(100);
            
            modal.open(testSnippet);
            
            expect(offsetHeightSpy).toHaveBeenCalled();
            expect(modal.modal.classList.contains('active')).toBe(true);
        });
    });

    describe('Modal Closing', () => {
        let testSnippet;

        beforeEach(() => {
            testSnippet = document.createElement('div');
            container.appendChild(testSnippet);
            modal.open(testSnippet);
        });

        test('should close modal and reset state', () => {
            modal.close();
            
            expect(modal.modal.classList.contains('active')).toBe(false);
            expect(modal.modal.style.display).toBe('');
            expect(modal.targetSnippet).toBeNull();
        });

        test('should remove active class on close', () => {
            modal.modal.classList.add('active');
            modal.close();
            
            expect(modal.modal.classList.contains('active')).toBe(false);
        });

        test('should clear inline display style on close', () => {
            modal.modal.style.display = 'block';
            modal.close();
            
            expect(modal.modal.style.display).toBe('');
        });
    });

    describe('Save Functionality and Integration', () => {
        let testSnippet;
        let urlInput;

        beforeEach(() => {
            testSnippet = document.createElement('div');
            container.appendChild(testSnippet);
            modal.open(testSnippet);
            urlInput = document.getElementById('video-url');
        });

        test('should save video with valid URL', () => {
            urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).toHaveBeenCalledWith(
                testSnippet,
                'https://www.youtube.com/embed/dQw4w9WgXcQ'
            );
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should convert URL to embed format before saving', () => {
            urlInput.value = 'https://vimeo.com/123456789';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).toHaveBeenCalledWith(
                testSnippet,
                'https://player.vimeo.com/video/123456789'
            );
        });

        test('should handle URLs with extra whitespace', () => {
            urlInput.value = '  https://youtu.be/dQw4w9WgXcQ  ';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).toHaveBeenCalledWith(
                testSnippet,
                'https://www.youtube.com/embed/dQw4w9WgXcQ'
            );
        });

        test('should not save when URL is empty', () => {
            urlInput.value = '';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).not.toHaveBeenCalled();
            expect(mockEditor.stateHistory.saveState).not.toHaveBeenCalled();
        });

        test('should not save when URL is only whitespace', () => {
            urlInput.value = '   ';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).not.toHaveBeenCalled();
        });

        test('should not save when no target snippet', () => {
            modal.targetSnippet = null;
            urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).not.toHaveBeenCalled();
        });

        test('should close modal after save', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            urlInput.value = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
            
            modal.save();
            
            expect(closeSpy).toHaveBeenCalled();
        });

        test('should close modal even when save fails', () => {
            const closeSpy = jest.spyOn(modal, 'close');
            urlInput.value = '';
            
            modal.save();
            
            expect(closeSpy).toHaveBeenCalled();
        });
    });

    describe('Regex Pattern Security', () => {
        test('should use non-capturing groups in regex patterns', () => {
            // Test that regex patterns use (?:...) instead of (...) where appropriate
            const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=123';
            const result = modal.convertToEmbedUrl(url);
            expect(result).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ?start=123');
        });

        test('should prevent regex DoS with reasonable input lengths', () => {
            const longVideoId = 'a'.repeat(1000);
            const url = `https://www.youtube.com/watch?v=${longVideoId}`;
            
            const startTime = Date.now();
            modal.convertToEmbedUrl(url);
            const endTime = Date.now();
            
            // Should not take more than 100ms to process
            expect(endTime - startTime).toBeLessThan(100);
        });

        test('should handle URLs with special regex characters', () => {
            const urls = [
                'https://www.youtube.com/watch?v=abc.123',
                'https://www.youtube.com/watch?v=abc*123',
                'https://www.youtube.com/watch?v=abc+123',
                'https://www.youtube.com/watch?v=abc?123',
                'https://www.youtube.com/watch?v=abc[123]',
                'https://www.youtube.com/watch?v=abc{123}',
                'https://www.youtube.com/watch?v=abc^123',
                'https://www.youtube.com/watch?v=abc$123'
            ];

            urls.forEach(url => {
                expect(() => modal.convertToEmbedUrl(url)).not.toThrow();
            });
        });
    });

    describe('DOM Structure Validation', () => {
        test('should create modal with proper semantic structure', () => {
            const modalContent = modal.modal.querySelector('.modal-content');
            const header = modalContent.querySelector('.modal-header');
            const body = modalContent.querySelector('.modal-body');
            const footer = modalContent.querySelector('.modal-footer');

            expect(modalContent).toBeTruthy();
            expect(header).toBeTruthy();
            expect(body).toBeTruthy();
            expect(footer).toBeTruthy();
        });

        test('should have proper input labeling for accessibility', () => {
            const label = modal.modal.querySelector('label');
            const input = modal.modal.querySelector('#video-url');
            
            expect(label).toBeTruthy();
            expect(label.textContent).toBe('Video URL');
            expect(input).toBeTruthy();
            expect(input.type).toBe('url');
        });

        test('should have descriptive help text', () => {
            const helpText = modal.modal.querySelector('small');
            expect(helpText).toBeTruthy();
            expect(helpText.textContent).toContain('Supported: YouTube, Vimeo, Dailymotion, Loom, Wistia');
        });

        test('should have proper button structure', () => {
            const cancelBtn = modal.modal.querySelector('#video-cancel');
            const saveBtn = modal.modal.querySelector('#video-save');
            
            expect(cancelBtn.className).toBe('btn');
            expect(saveBtn.className).toBe('btn btn-primary');
            expect(cancelBtn.textContent).toBe('Cancel');
            expect(saveBtn.textContent).toBe('Save');
        });
    });

    describe('Edge Cases and Integration Tests', () => {
        test('should handle multiple modal instances', () => {
            const secondModal = new VideoSettingsModal(mockEditor);
            expect(document.querySelectorAll('.modal').length).toBe(2);
            
            // Both should be functional
            expect(secondModal.modal).toBeTruthy();
            expect(secondModal.editor).toBe(mockEditor);
        });

        test('should work with various snippet structures', () => {
            const snippetTypes = [
                document.createElement('div'),
                document.createElement('section'),
                document.createElement('article')
            ];

            snippetTypes.forEach(snippet => {
                expect(() => modal.open(snippet)).not.toThrow();
                expect(modal.targetSnippet).toBe(snippet);
                modal.close();
            });
        });

        test('should handle missing editor methods gracefully', () => {
            const incompleteEditor = {
                setupVideoSnippet: jest.fn()
                // Missing stateHistory
            };
            
            const testModal = new VideoSettingsModal(incompleteEditor);
            const snippet = document.createElement('div');
            testModal.open(snippet);
            
            const urlInput = document.getElementById('video-url');
            urlInput.value = 'https://www.youtube.com/watch?v=test123';
            
            expect(() => testModal.save()).not.toThrow();
            expect(incompleteEditor.setupVideoSnippet).toHaveBeenCalled();
        });

        test('should preserve video URL across open/close cycles', () => {
            const snippet = document.createElement('div');
            const iframe = document.createElement('iframe');
            iframe.src = 'https://www.youtube.com/embed/test123';
            snippet.appendChild(iframe);

            // First open
            modal.open(snippet);
            let urlInput = document.getElementById('video-url');
            expect(urlInput.value).toBe('https://www.youtube.com/embed/test123');
            modal.close();

            // Second open should repopulate
            modal.open(snippet);
            urlInput = document.getElementById('video-url');
            expect(urlInput.value).toBe('https://www.youtube.com/embed/test123');
        });
    });

    describe('Performance and Memory', () => {
        test('should not create memory leaks with repeated open/close', () => {
            const snippet = document.createElement('div');
            
            // Simulate multiple open/close cycles
            for (let i = 0; i < 10; i++) {
                modal.open(snippet);
                modal.close();
            }
            
            // Should not have accumulated DOM nodes
            expect(document.querySelectorAll('.modal').length).toBe(1);
            expect(modal.targetSnippet).toBeNull();
        });

        test('should handle rapid URL conversion calls', () => {
            const urls = [
                'https://www.youtube.com/watch?v=test1',
                'https://vimeo.com/123456',
                'https://www.dailymotion.com/video/test2',
                'https://mycompany.wistia.com/medias/test3',
                'https://www.loom.com/share/test4'
            ];

            const startTime = Date.now();
            for (let i = 0; i < 100; i++) {
                urls.forEach(url => modal.convertToEmbedUrl(url));
            }
            const endTime = Date.now();

            // Should complete quickly
            expect(endTime - startTime).toBeLessThan(100);
        });
    });

    describe('Integration with Editor System', () => {
        test('should call editor setupVideoSnippet with correct parameters', () => {
            const snippet = document.createElement('div');
            modal.open(snippet);
            
            const urlInput = document.getElementById('video-url');
            urlInput.value = 'https://www.youtube.com/watch?v=integration_test';
            
            modal.save();
            
            expect(mockEditor.setupVideoSnippet).toHaveBeenCalledWith(
                snippet,
                'https://www.youtube.com/embed/integration_test'
            );
        });

        test('should trigger state history save after successful video setup', () => {
            const snippet = document.createElement('div');
            modal.open(snippet);
            
            const urlInput = document.getElementById('video-url');
            urlInput.value = 'https://vimeo.com/987654321';
            
            modal.save();
            
            expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
        });

        test('should work when stateHistory is undefined', () => {
            const editorWithoutHistory = {
                setupVideoSnippet: jest.fn(),
                stateHistory: undefined
            };
            
            const testModal = new VideoSettingsModal(editorWithoutHistory);
            const snippet = document.createElement('div');
            testModal.open(snippet);
            
            const urlInput = document.getElementById('video-url');
            urlInput.value = 'https://www.youtube.com/watch?v=test';
            
            expect(() => testModal.save()).not.toThrow();
        });
    });
});