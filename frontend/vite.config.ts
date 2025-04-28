import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
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
    },
    watch: {
      include: 'src/**',
    }
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'preact'
  }
}); 