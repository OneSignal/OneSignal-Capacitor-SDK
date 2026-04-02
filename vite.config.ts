import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [dts({ exclude: ['**/*.test.ts', 'mocks/**'], rollupTypes: true })],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['@capacitor/core'],
      output: {
        exports: 'named',
      },
    },
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
