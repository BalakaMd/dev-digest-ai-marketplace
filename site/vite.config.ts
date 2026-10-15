import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// base './' keeps asset URLs relative, so the site works from the GitHub Pages sub-path.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: { port: 5173 },
  test: { environment: 'jsdom', include: ['src/**/*.test.ts', 'src/**/*.test.tsx'] },
});
