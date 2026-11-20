import js from '@eslint/js';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

// eslint-config-next 16 ships native flat configs; the FlatCompat bridge used
// with 15.x fails on them (circular plugin objects), so they are spread here.
export default [
  js.configs.recommended,
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: 'writable',
        JSX: 'readonly',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    files: ['src/**/*.{js,jsx,ts,tsx}'],
    rules: {
      // New in eslint-config-next 16 (react-hooks 7 / React Compiler rules).
      // They flag ~50 existing call sites; off until a follow-up fixes them
      // (B7 upgrade kept behaviour-neutral). Re-enable one by one.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      '@next/next/no-location-assign-relative-destination': 'off',

      'react/prop-types': 'off',
      'no-console': 'warn',
      'react/display-name': 'off',
      'react/react-in-jsx-scope': 'off',
      '@next/next/no-html-link-for-pages': 'warn',

      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'simple-import-sort/exports': 'warn',
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    ignores: [
      '**/.lintstagedrc.js',
      '**/eslint.config.mjs',
      '**/.prettierrc.js',
      '**/tailwind.config.js',
      '**/node_modules/',
      '**/.next/',
      '**/.content-collections/',
      '**/next.config.js',
      '**/next-env.d.ts',
    ],
  },
];
