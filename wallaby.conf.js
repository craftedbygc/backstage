module.exports = () => {
  return {
    autoDetect: true,
    tests: [
      'backstage/**/*.test.ts',
      'packages/dataverse/**/*.test.ts',
      '!**/node_modules/**',
    ],
    testFramework: {
      configFile: './jest.config.js',
    },
  }
}
