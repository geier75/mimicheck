import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { 
    ignores: [
      'dist',
      'backend/**',
      'node_modules/**',
      '**/*.min.js',
      'outputs/**',
      'uploads/**',
      '*.config.js',
      'vite.config.js',
      'tailwind.config.js',
      'postcss.config.js'
    ] 
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      
      // React-spezifisch
      'react/jsx-no-target-blank': 'warn', // Sicherheitswarnung für externe Links
      'react/prop-types': 'off', // PropTypes deaktiviert - nutze JSDoc für Typen
      'react/no-unescaped-entities': 'warn',
      'react/jsx-key': 'error', // Keys in Listen sind Pflicht
      'react/jsx-no-duplicate-props': 'error',
      'react/no-direct-mutation-state': 'error',
      
      // React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      
      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // JavaScript Best Practices
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      'no-console': ['warn', { allow: ['warn', 'error'] }], // Console-Logs warnen
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      
      // Sicherheit
      'no-script-url': 'error',
      
      // Code-Qualität
      'eqeqeq': ['warn', 'smart'], // === statt ==
      'no-var': 'error', // let/const statt var
      'prefer-const': 'warn',
      'prefer-template': 'warn', // Template Strings bevorzugen
    },
  },
]
