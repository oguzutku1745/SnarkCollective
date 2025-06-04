import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@provablehq/wasm", "@doko-js/wasm"],
  },
  server: {
    fs: {
      allow: ['..'] // Allow serving files from parent directories
    },
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          if (id.includes('@doko-js/wasm')) {
            return 'doko-wasm';
          }
        }
      }
    }
  }
});
