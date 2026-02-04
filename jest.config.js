const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './apps/studio',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/studio/$1',
    '^@forge/shared/(.*)$': '<rootDir>/packages/shared/src/shared/$1',
    '^@forge/shared$': '<rootDir>/packages/shared/src/index.ts',
    '^@forge/domain-forge/(.*)$': '<rootDir>/packages/domain-forge/src/$1',
    '^@forge/domain-forge$': '<rootDir>/packages/domain-forge/src/index.ts',
    '^@forge/types/(.*)$': '<rootDir>/packages/types/src/$1',
    '^@forge/types$': '<rootDir>/packages/types/src/index.ts',
    '^server-only$': '<rootDir>/__mocks__/server-only.js',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
