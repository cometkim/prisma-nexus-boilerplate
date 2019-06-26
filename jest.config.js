module.exports = {
  verbose: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!generated',
  ],
  setupFiles: [
    '<rootDir>/tests/setup.ts',
  ],
};
