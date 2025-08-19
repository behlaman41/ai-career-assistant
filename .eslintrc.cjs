module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parserOptions: {
    project: ['./tsconfig.base.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/order': [
      'warn',
      {
        'alphabetize': { order: 'asc' },
        'newlines-between': 'always',
      },
    ],
  },
  ignorePatterns: ['dist', 'build', '.next', 'node_modules']
};