import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clips: resolve(__dirname, 'pages/clips/index.html'),
        ghost: resolve(__dirname, 'pages/ghost/index.html'),
        articles_index: resolve(__dirname, 'pages/articles/index.html'),
        articles_ai_workflow: resolve(__dirname, 'pages/articles/ai-orchestration-workflow.html'),
        articles_streamfm: resolve(__dirname, 'pages/articles/streamfm.html')
      }
    }
  }
});
