module.exports = {
  preset: 'jest-preset-angular',
  globals: {
    'ts-jest': {
      pathRegex: /\.(spec|test)\.ts$/
    }
  },
  roots: [
    'src',
    'projects/swimlane/docspa-core/src',
    'projects/swimlane/docspa-remark-preset/tests'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/app/$1',
    '@assets/(.*)': '<rootDir>/src/assets/$1',
    '@core/(.*)': '<rootDir>/src/app/core/$1',
    '@env': '<rootDir>/src/environments/environment',
    '@src/(.*)': '<rootDir>/src/src/$1',
    '@state/(.*)': '<rootDir>/src/app/state/$1',
  }
};
