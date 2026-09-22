import tsParser from '@typescript-eslint/parser'
import boundaries from 'eslint-plugin-boundaries'

/**
 * Minimal ESLint config: feature boundaries and the domain clock ban.
 * Formatting and general linting are Biome's job.
 */

/**
 * ADR-0002: `now` is an explicit input of every derivation, so domain modules
 * never reach for the system clock. Enforced here instead of by convention.
 */
const clockMessage =
  'Domain code never reads the system clock (ADR-0002): take `now` as an explicit parameter.'

const clockBan = [
  { selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']" },
  { selector: "NewExpression[callee.name='Date'][arguments.length=0]" },
  { selector: "CallExpression[callee.name='Date'][arguments.length=0]" },
].map((rule) => ({ ...rule, message: clockMessage }))

export default [
  { ignores: ['dist/**', 'dev-dist/**', 'src/routeTree.gen.ts'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared/**', partialMatch: false },
        {
          type: 'feature',
          pattern: 'src/features/*/**',
          capture: ['featureName'],
          partialMatch: false,
        },
        { type: 'routes', pattern: 'src/routes/**', partialMatch: false },
      ],
      'boundaries/include': ['src/**/*.{ts,tsx}'],
      'import/resolver': {
        typescript: { alwaysTryTypes: true, project: './tsconfig.app.json' },
      },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            // shared is the base layer: it may only reach into itself.
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            // A feature may use shared and its own files — never another feature.
            {
              from: { element: { type: 'feature' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: {
                to: {
                  element: {
                    type: 'feature',
                    captured: { featureName: '{{from.captured.featureName}}' },
                  },
                },
              },
            },
            // Routes are the app layer: they may wire anything together.
            {
              from: { element: { type: 'routes' } },
              allow: {
                to: { element: { types: { anyOf: ['shared', 'feature', 'routes'] } } },
              },
            },
          ],
        },
      ],
    },
  },
  {
    // Domain modules: the clock is an input, never a global (ADR-0002).
    files: ['src/features/*/domain/**/*.{ts,tsx}', 'src/shared/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...clockBan],
    },
  },
]
