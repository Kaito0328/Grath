import { defineConfig } from 'vitest/config'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  plugins: [wasm(), topLevelAwait()],
  esbuild: {
    jsx: 'automatic',
  },
  optimizeDeps: {
    exclude: ['wasm-lib'],
  },
  test: {
    environment: 'node',
    include: [
      'src/__tests__/**/*.test.ts',
      'src/__tests__/**/*.test.tsx',
      'generated/client-sdk/src/tests/**/*.test.ts',
    ],
    environmentMatchGlobs: [['src/__tests__/react/**/*.test.tsx', 'jsdom']],
    testTimeout: 30000,
  },
})
