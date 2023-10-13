module.exports = () => ({
  autoDetect: true,
  files: [
    'src/**/*.ts',
    { pattern: 'src/**/*.test.ts', ignore: true }
  ],
  tests: [
    'src/**/*.test.ts'
  ],
  testFramework: {
    configFile: './vitest.config.ts'
  }
})

