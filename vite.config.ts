import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {crx} from '@crxjs/vite-plugin'
import tsconfigPaths from 'vite-tsconfig-paths'
import manifest from './manifest.config'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      tsconfigPaths(),
      react(),
      crx({ manifest }),
      viteStaticCopy({
          targets: [
              { src: 'src/assets/ex_assets/*', dest: './assets/'}
          ],
      }),
  ],
  build: {
    rollupOptions: {
      input: ['app.html'],
    },
  },
})
