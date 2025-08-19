module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\.spec\.ts$',
  transform: {
    '^.+\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@ai-career/providers$': '/Users/amanbehl/Documents/ai-career-assitant/packages/providers/src',
    '^@ai-career/shared$': '/Users/amanbehl/Documents/ai-career-assitant/packages/shared/src',
  },
};