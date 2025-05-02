import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
// This type import is needed to extend the configuration type to include test properties
import type { ViteUserConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  build: {
    outDir: '../_site/static/js',  // Output to Lume's _site directory
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/main.tsx',
      output: {
        entryFileNames: 'guitar.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact'
  }
}); 