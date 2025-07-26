module.exports = {
    env: {
        browser: false,
        es2021: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'commonjs',
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],  
        'no-console': 'off',
        'no-empty': ['error', { 'allowEmptyCatch': true }],         
    },
    overrides: [
        {
            files: ['tests/**/*.js', 'examples/**/*.js'],
            rules: {
                'no-unused-vars': 'off',  
            }
        }
    ]
};
