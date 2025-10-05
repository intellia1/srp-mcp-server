{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": [
    "**/tests/**/*.test.ts",
    "**/tests/**/*.spec.ts"
  ],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/index.ts",
    "!src/types/**/*.ts"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": [
    "text",
    "lcov",
    "html"
  ]
}