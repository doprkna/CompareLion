/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/apps/web/$1',
    '^@parel/db/src/client$': '<rootDir>/packages/db/src/client',
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
};
