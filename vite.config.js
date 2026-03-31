// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,            // 0.0.0.0 (LAN/VM)
    port: 8005,
    strictPort: true,
    hmr: { protocol: "ws", host: "localhost", port: 8005 },
    cors: {
      origin: ['http://localhost:3000'],  // Nur Port 3000 - Landing Page
      credentials: true
    }
  },
  preview: {
    port: 5080,
    strictPort: true,
  },
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Nur Vite-Variablen mit VITE_ werden an den Client geleakt:
  envPrefix: ["VITE_"],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  // Performance: Code-Splitting für bessere Ladezeiten
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor-Chunks für große Bibliotheken
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-switch',
          ],
          'vendor-motion': ['framer-motion', 'gsap'],
          'vendor-charts': ['recharts'],
          'vendor-3d': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-pdf': ['pdf-lib'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Chunk-Size Warnung auf 750KB erhöhen (nach Splitting)
    chunkSizeWarningLimit: 750,
    // Sourcemaps nur in Dev
    sourcemap: false,
    // Minification (esbuild ist default und schneller)
    minify: 'esbuild',
    // Console.logs im Production Build entfernen
    target: 'esnext',
  },
  esbuild: {
    // Entferne console.log und debugger im Production Build
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
}); 