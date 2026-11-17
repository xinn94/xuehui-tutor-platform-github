import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/xuehui-tutor-platform-github/',
  plugins: [react()],
});