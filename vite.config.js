import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Settings for the dev server (npm run dev). The proxy is a receptionist: any request
  // from the page whose path starts with /api is forwarded to the Express server on door
  // 3000, and its answer is passed back. The browser only ever talks to this page's own
  // address, so the cross-address (CORS) block never comes up.
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})