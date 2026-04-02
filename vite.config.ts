import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
  pack: {
    entry: 'src/index.ts',
    dts: true,
    format: 'es',
    outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  },
  test: {
    clearMocks: true,
    environment: 'happy-dom',
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
