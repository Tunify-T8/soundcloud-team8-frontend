import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
   resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,               // allows describe/it/expect without imports
    environment: 'jsdom',        // provides a DOM for tests
    setupFiles: './src/setupTests.ts', // path to your setup file
    clearMocks: true, // equivalent to calling vi.clearAllMocks() before every test (resetting the mock call count between the unit tests)
  },
});