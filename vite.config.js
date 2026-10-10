import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single-page React app: every route is served by index.html (dev and `vite preview`
// fall back to it automatically; configure the same fallback on the production host).
// /api is the order + payment server (server/index.js, `npm run api`).
const api = { '/api': `http://localhost:${process.env.PORT || 3000}` };

export default defineConfig({
  plugins: [react()],
  server: { proxy: api },
  preview: { proxy: api },
});
