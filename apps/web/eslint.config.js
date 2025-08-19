import nextPlugin from '@eslint/js';
import nextConfig from 'eslint-config-next';

export default [
  nextPlugin.configs.recommended,
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'import/no-unresolved': 'off',
    },
  },
];
