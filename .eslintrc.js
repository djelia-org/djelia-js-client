// module.exports = {
//     env: {
//         browser: false,
//         es2021: true,
//         node: true,
//     },
//     extends: [
//         'eslint:recommended',
//     ],
//     parserOptions: {
//         ecmaVersion: 'latest',
//         sourceType: 'module',
//     },
//     rules: {
//         'indent': ['error', 4],
//         'linebreak-style': ['error', 'unix'],
//         'quotes': ['error', 'single'],
//         'semi': ['error', 'always'],
//         'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
//         'no-console': 'off',
//     },
// };


// module.exports = {
//     env: {
//         browser: false,
//         es2021: true,
//         node: true,
//         jest: true,  
//     },
//     extends: [
//         'eslint:recommended',
//     ],
//     parserOptions: {
//         ecmaVersion: 'latest',
//         sourceType: 'commonjs',  
//     },
//     rules: {
//         'indent': ['error', 4],
//         'linebreak-style': ['error', 'unix'],
//         'quotes': ['error', 'single'],
//         'semi': ['error', 'always'],
//         'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
//         'no-console': 'off',
//     },
//     overrides: [
//         {
//             files: ['tests/**/*.js'],
//             env: {
//                 jest: true,
//             }
//         }
//     ]
// };


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
};