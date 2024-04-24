/* eslint-disable */
export default {
  displayName: 'prm-engine',
  preset: '../../jest.preset.js',
  globalSetup: '../../shared/jest.integration-tests-setup.ts',
  globalTeardown: '../../shared/jest.integration-tests-teardown.ts',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testMatch: ['**/*.integration.test.[jt]s'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/prm-engine',
};
