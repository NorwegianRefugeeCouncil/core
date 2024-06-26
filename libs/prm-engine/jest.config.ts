/* eslint-disable */
export default {
  displayName: 'prm-engine',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)', '!**/*.integration.test.[jt]s'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/prm-engine',
};
