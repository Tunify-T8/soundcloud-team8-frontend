import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,               // allows describe/it/expect without imports
    environment: 'jsdom',        // provides a DOM for tests
    setupFiles: './src/setupTests.ts', // path to your setup file
  },
});