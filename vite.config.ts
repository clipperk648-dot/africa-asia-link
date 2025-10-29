import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      overlay: false,
    },
    proxy: {
      "/.netlify/functions": {
        target: "http://localhost:8888",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8888/.netlify/functions",
        rewrite: (path) => path.replace(/^\/api/, ""),
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "ES2020",
    minify: "terser",
    sourcemap: mode === "development",
    cssCodeSplit: true,
    reportCompressedSize: false,
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor bundle
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          
          // UI Framework
          "radix-ui": [
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-toast",
          ],
          
          // Data visualization
          "charts": ["recharts"],
          
          // Data management
          "query": ["@tanstack/react-query"],
          
          // Form handling
          "forms": ["react-hook-form", "@hookform/resolvers", "zod"],
          
          // Utilities
          "ui-utils": ["class-variance-authority", "clsx", "tailwind-merge", "tailwindcss-animate"],
          
          // Icons and date
          "icons": ["lucide-react", "react-day-picker", "date-fns"],
          
          // Theme and animations
          "theme": ["next-themes", "cmdk", "sonner"],
          
          // Carousel and other UI
          "carousel": ["embla-carousel-react"],
        },
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split(".");
          const ext = info[info.length - 1];
          if (/png|jpe?g|gif|svg|webp|ico/.test(ext)) {
            return `images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          } else if (ext === "css") {
            return `css/[name]-[hash][extname]`;
          }
          return `[name]-[hash][extname]`;
        },
      },
      external: [],
    },
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimize: {
    esbuild: {
      legalComments: "none",
    },
  },
}));
