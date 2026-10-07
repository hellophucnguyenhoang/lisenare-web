import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.1.105:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-dom") ||
              id.includes("react/") ||
              id.includes("scheduler")
            ) {
              return "vendor-react";
            }
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("sonner")) {
              return "vendor-ui";
            }
            return "vendor";
          }
        },
      },
    },
  },
});
