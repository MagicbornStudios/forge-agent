const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: '.',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  testEnvironment: process.env.SETTINGS_CODEGEN ? 'node' : 'jest-environment-jsdom',
  moduleNameMapper: {
    '^canvas$': '<rootDir>/__mocks__/canvas.js',
    '^@/(.*)$': '<rootDir>/$1',
    '^@forge/shared/(.*)$': '<rootDir>/../../packages/shared/src/shared/$1',
    '^@forge/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@forge/domain-forge/(.*)$': '<rootDir>/../../packages/domain-forge/src/$1',
    '^@forge/domain-forge$': '<rootDir>/../../packages/domain-forge/src/index.ts',
    '^@forge/ui/(.*)$': '<rootDir>/../../packages/ui/src/$1',
    '^@forge/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@forge/types/(.*)$': '<rootDir>/../../packages/types/src/$1',
    '^@forge/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^server-only$': '<rootDir>/../../__mocks__/server-only.js',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

module.exports = createJestConfig(customJestConfig);
