module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import', 'security'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier',
  ],
  rules: {
    'import/order': [
      'warn',
      {
        'alphabetize': { order: 'asc' },
        'newlines-between': 'always',
      },
    ],
  },
};