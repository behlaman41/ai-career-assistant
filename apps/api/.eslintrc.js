module.exports = {
  extends: ['../../.eslintrc.cjs'],
  parserOptions: {
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'import/no-unresolved': 'off', // Disable this rule as it doesn't work well with monorepos
    'import/order': 'warn', // Make import order warnings instead of errors
    '@typescript-eslint/no-unused-expressions': 'off', // Temporarily disable to resolve TypeError
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
};
