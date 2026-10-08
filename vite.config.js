import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Single-page React app: every route is served by index.html (dev and `vite preview`
// fall back to it automatically; configure the same fallback on the production host).
export default defineConfig({
  plugins: [react()],
});
