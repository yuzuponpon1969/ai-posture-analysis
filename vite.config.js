import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  optimizeDeps: {
    include: [
      '@mediapipe/pose',
      '@mediapipe/camera_utils',
      '@mediapipe/drawing_utils'
    ]
  }
});
