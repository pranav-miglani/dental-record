/**
 * Jest setup to fix localStorage issue
 */

// Mock localStorage before Jest tries to access it
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    length: 0,
    key: jest.fn(() => null),
  }
}

