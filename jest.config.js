module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    silent: false,
    moduleFileExtensions: ['ts', 'js', 'json'],
  };
