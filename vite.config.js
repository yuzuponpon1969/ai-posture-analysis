import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    allowedHosts: [
      '.sandbox.novita.ai',
      'localhost'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
