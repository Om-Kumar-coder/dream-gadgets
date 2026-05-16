module.exports = {
  projects: [
    {
      displayName: 'components',
      testMatch: ['<rootDir>/tests/components/**/*.spec.ts?(x)'],
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/apps/web/src/$1',
        '^@admin/(.*)$': '<rootDir>/apps/admin/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      collectCoverageFrom: [
        'apps/**/*.{ts,tsx}',
        '!apps/**/*.d.ts',
        '!apps/**/node_modules/**',
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/dist/',
      ],
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      collectCoverageFrom: [
        'apps/api/src/**/*.{ts}',
        '!apps/api/src/**/*.d.ts',
      ],
    },
  ],
  testTimeout: 30000,
  verbose: true,
};
