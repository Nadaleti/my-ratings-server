module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    'ecmaVersion': 2018
  },
  extends: [
    'eslint:recommended',
    'google',
  ],
  rules: {
    'quotes': ['error', 'single'],
    'linebreak-style': ['error', 'windows'],
    'max-len': ['error', 150],
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'semi': 'off',
    'no-prototype-builtins': 'off',
    'new-cap': 'off'
  },
};
