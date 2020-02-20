module.exports = {
  // preset: 'ts-jest',
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  // transform: { '^.+\\.(js|jsx|mjs)$': '<rootDir>/node_modules/babel-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
}
