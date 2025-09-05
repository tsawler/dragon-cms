export default {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  collectCoverageFrom: [
    'js/**/*.js',
    '!js/main.js',
    '!**/node_modules/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  verbose: true
};