import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// When deployed to GitHub Pages at https://<user>.github.io/axle/ the base
// path must be "/axle/". For local dev or other hosting, override via the
// VITE_BASE_PATH env var (e.g. "/" for Netlify/Vercel root deploys).
const base = process.env.VITE_BASE_PATH ?? '/axle/';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
});
