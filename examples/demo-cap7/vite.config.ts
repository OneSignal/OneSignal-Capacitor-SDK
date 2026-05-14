import { defineConfig } from 'vite-plus';

export default defineConfig({
  build: {
    outDir: 'dist',
  },
  fmt: {
    singleQuote: true,
    sortImports: {
      enabled: true,
    },
  },
});
