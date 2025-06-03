module.exports = {
  testEnvironment: 'node',
  silent: true,
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ]
};