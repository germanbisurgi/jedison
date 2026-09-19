import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Local preview target only. Must not be 'docs' — that is the GitHub Pages
    // source, and this config has no base, so its output breaks the /jedison/ paths.
    outDir: resolve(__dirname, '.vite-preview')
  },
  server: {
    open: true,
    port: 8282,
    watch: {
      include: ['src/**', 'src-docs/**']
    }
  },
  preview: {
    open: false,
    port: 8181,
    strictPort: true
  }
})
