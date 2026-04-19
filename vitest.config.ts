import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/types': resolve(__dirname, 'types.ts'),
      '@/constants': resolve(__dirname, 'app/drug-catalog/constants.ts'),
      '@/categoryIndicationKeywords': resolve(__dirname, 'app/drug-catalog/categoryIndicationKeywords.ts'),
      '@': resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['components/**', 'services/**', 'hooks/**'],
    },
  },
});
