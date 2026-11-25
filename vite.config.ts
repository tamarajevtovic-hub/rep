import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' da aplikacija radi i sa GitHub Pages podputanje
export default defineConfig({
  base: './',
  plugins: [react()],
});
