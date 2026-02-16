/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  setupFilesAfterFramework: ['<rootDir>/tests/setup.ts'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/app.ts'],
  coverageThreshold: { global: { statements: 75, branches: 70, lines: 75, functions: 75 } },
};
