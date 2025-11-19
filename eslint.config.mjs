import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      // Dependencies
      'node_modules/**',
      // Build outputs
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      // Zero folder
      'Zero/**',
      'Zero',
    ],
  },
  {
    rules: {
      // Allow unused variables that start with underscore
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      // Allow any type (less strict)
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow console.log in development
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Less strict React rules
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': 'warn',
      // Allow empty functions
      '@typescript-eslint/no-empty-function': 'warn',
      // Less strict import rules
      '@next/next/no-img-element': 'warn',
      'prefer-const': 'warn',
    },
  },
];

export default eslintConfig;
