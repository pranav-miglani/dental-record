/**
 * E2E Test Setup
 * Runs before all E2E tests
 */

// Suppress localStorage warnings in Jest
if (typeof (global as any).localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  }
}

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.AWS_REGION = 'us-east-1'

// API URL for testing
// Set this to your deployed API Gateway URL
// Or use local server if running locally
process.env.API_URL = process.env.API_URL || 'http://localhost:3000'

// Test credentials
// These should match your test user in the deployed system
process.env.TEST_ADMIN_MOBILE = process.env.TEST_ADMIN_MOBILE || '9999999999'
process.env.TEST_ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

// Test timeout (set in jest.config.js)

// Global test setup
beforeAll(() => {
  console.log('🚀 Starting E2E Tests')
  console.log(`API URL: ${process.env.API_URL}`)
  console.log(`Test User: ${process.env.TEST_ADMIN_MOBILE}`)
})

afterAll(() => {
  console.log('✅ E2E Tests Complete')
})

