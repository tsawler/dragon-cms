import '@testing-library/jest-dom';

// Mock window.getSnippets globally
global.getSnippets = jest.fn(() => [
  {
    id: 'test-block',
    name: 'Test Block',
    type: 'block',
    html: '<div class="test-block">Test Block</div>'
  },
  {
    id: 'test-snippet',
    name: 'Test Snippet',
    type: 'snippet',
    html: '<p>Test Snippet</p>'
  }
]);

// Mock getBlocks for snippet panel
global.getBlocks = jest.fn(() => [
  {
    id: 'test-block-1',
    name: 'Test Block 1',
    type: 'block',
    html: '<div class="test-block">Test Block 1</div>'
  }
]);

// Mock global fetch for API tests
global.fetch = jest.fn();

// Setup DOM globals that Jest doesn't provide by default
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.URL.createObjectURL for image uploads
Object.defineProperty(window.URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mock-blob-url')
});

// Mock execCommand for contentEditable tests
document.execCommand = jest.fn();

// Mock querySelector/All to avoid console warnings
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented')) {
    return;
  }
  originalError(...args);
};