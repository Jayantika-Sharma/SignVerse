import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` serves the site on :5173 and forwards /api/* to your Python
// server (server_example.py on :5000), so sign detection works while developing.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:5000' } }
});
