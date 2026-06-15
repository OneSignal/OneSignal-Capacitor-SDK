import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
    sortPackageJson: {
      sortScripts: true,
    },
  },
  lint: {
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ['**/*.test.ts', '**/*.test.tsx'],
        rules: {
          'typescript/unbound-method': 'off',
        },
      },
    ],
  },
  pack: {
    entry: 'src/index.ts',
    dts: true,
    format: 'es',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  test: {
    clearMocks: true,
    environment: 'node',
    include: ['**/*.test.ts', '**/*.test.tsx'],
    coverage: {
      exclude: ['mocks/**', 'src/helpers.ts'],
      enabled: true,
      reporter: ['text-summary', 'lcov'],
      reportOnFailure: true,
      reportsDirectory: 'coverage',
      thresholds: {
        statements: 95,
        branches: 95,
        functions: 95,
        lines: 95,
      },
    },
  },
});
