/**
 * Jest configuration for E2E tests
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/setup.ts', '<rootDir>/../docker-setup.ts'],
  testTimeout: 60000,
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost',
    customExportConditions: [],
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
        },
      },
    ],
  },
}

