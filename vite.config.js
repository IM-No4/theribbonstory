import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "esnext",
    cssCodeSplit: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-framer": ["framer-motion"],
          "vendor-icons": ["lucide-react"],
          "vendor-state": ["zustand", "axios", "react-hot-toast"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
