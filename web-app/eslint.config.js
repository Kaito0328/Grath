import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import nextPlugin from '@next/eslint-plugin-next'
import { FlatCompat } from '@eslint/eslintrc'
import path from 'node:path'

const compat = new FlatCompat({
  baseDirectory: path.resolve('.'),
})

export default tseslint.config([
  {
  ignores: [
    '.next/**',
    'node_modules/**',
    'dist/**',
    'generated/client-sdk/**',
    'src/wasm-pkg/**',
    'src/wasm/**',
  ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      // Next.js recommended (via legacy config compat)
      ...compat.extends('next'),
      ...compat.extends('next/core-web-vitals'),
    ],
    plugins: { 'react-hooks': reactHooks, '@next/next': nextPlugin },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Temporarily disable until tokens APIs are fully typed without casts
      '@typescript-eslint/no-explicit-any': 'warn',
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
      },
    },
  },
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },

  // App-wide rule: avoid raw HTML tags; use design primitives/base components.
  // Exception: allowed inside src/design/**.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/design/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXOpeningElement[name.type="JSXIdentifier"][name.name=/^(a|article|aside|button|div|footer|form|h1|h2|h3|h4|h5|h6|header|img|input|label|li|main|nav|ol|option|p|section|select|span|textarea|ul)$/]',
          message:
            'Do not use raw HTML tags; use design primitives/base components instead.',
        },
      ],
    },
  },
])
