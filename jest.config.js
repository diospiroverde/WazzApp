module.exports = {
    transform: {'^.+\\.ts?$': 'ts-jest'},
    testEnvironment: 'node',
    testRegex: '/src/.*\\.(test|spec)?\\.(ts|tsx)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    modulePathIgnorePatterns:[
        "<rootDir>/dist/"
    ],
    runner: '@jest-runner/electron/main',
    testEnvironment: 'node',
};