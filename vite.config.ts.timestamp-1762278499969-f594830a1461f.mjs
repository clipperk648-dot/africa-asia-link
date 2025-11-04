// vite.config.ts
import { defineConfig } from "file:///root/app/code/node_modules/vite/dist/node/index.js";
import react from "file:///root/app/code/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
var __vite_injected_original_dirname = "/root/app/code";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      protocol: "wss",
      clientPort: 443,
      overlay: false
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
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
        drop_debugger: mode === "production"
      }
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
            "@radix-ui/react-toast"
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
          "carousel": ["embla-carousel-react"]
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
        }
      },
      external: []
    },
    chunkSizeWarningLimit: 1e3,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimize: {
    esbuild: {
      legalComments: "none"
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvcm9vdC9hcHAvY29kZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL3Jvb3QvYXBwL2NvZGUvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBobXI6IHtcbiAgICAgIHByb3RvY29sOiAnd3NzJyxcbiAgICAgIGNsaWVudFBvcnQ6IDQ0MyxcbiAgICAgIG92ZXJsYXk6IGZhbHNlLFxuICAgIH0sXG4gICAgcHJveHk6IHtcbiAgICAgIFwiL2FwaVwiOiB7XG4gICAgICAgIHRhcmdldDogXCJodHRwOi8vbG9jYWxob3N0OjMwMDFcIixcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiRVMyMDIwXCIsXG4gICAgbWluaWZ5OiBcInRlcnNlclwiLFxuICAgIHNvdXJjZW1hcDogbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiLFxuICAgIGNzc0NvZGVTcGxpdDogdHJ1ZSxcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsXG4gICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgY29tcHJlc3M6IHtcbiAgICAgICAgZHJvcF9jb25zb2xlOiBtb2RlID09PSBcInByb2R1Y3Rpb25cIixcbiAgICAgICAgZHJvcF9kZWJ1Z2dlcjogbW9kZSA9PT0gXCJwcm9kdWN0aW9uXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIENvcmUgUmVhY3QgdmVuZG9yIGJ1bmRsZVxuICAgICAgICAgIFwicmVhY3QtdmVuZG9yXCI6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBVSSBGcmFtZXdvcmtcbiAgICAgICAgICBcInJhZGl4LXVpXCI6IFtcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LWRyb3Bkb3duLW1lbnVcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXNlbGVjdFwiLFxuICAgICAgICAgICAgXCJAcmFkaXgtdWkvcmVhY3QtZGlhbG9nXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1wb3BvdmVyXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC10YWJzXCIsXG4gICAgICAgICAgICBcIkByYWRpeC11aS9yZWFjdC1hY2NvcmRpb25cIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvb2x0aXBcIixcbiAgICAgICAgICAgIFwiQHJhZGl4LXVpL3JlYWN0LXRvYXN0XCIsXG4gICAgICAgICAgXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBEYXRhIHZpc3VhbGl6YXRpb25cbiAgICAgICAgICBcImNoYXJ0c1wiOiBbXCJyZWNoYXJ0c1wiXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBEYXRhIG1hbmFnZW1lbnRcbiAgICAgICAgICBcInF1ZXJ5XCI6IFtcIkB0YW5zdGFjay9yZWFjdC1xdWVyeVwiXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBGb3JtIGhhbmRsaW5nXG4gICAgICAgICAgXCJmb3Jtc1wiOiBbXCJyZWFjdC1ob29rLWZvcm1cIiwgXCJAaG9va2Zvcm0vcmVzb2x2ZXJzXCIsIFwiem9kXCJdLFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFV0aWxpdGllc1xuICAgICAgICAgIFwidWktdXRpbHNcIjogW1wiY2xhc3MtdmFyaWFuY2UtYXV0aG9yaXR5XCIsIFwiY2xzeFwiLCBcInRhaWx3aW5kLW1lcmdlXCIsIFwidGFpbHdpbmRjc3MtYW5pbWF0ZVwiXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBJY29ucyBhbmQgZGF0ZVxuICAgICAgICAgIFwiaWNvbnNcIjogW1wibHVjaWRlLXJlYWN0XCIsIFwicmVhY3QtZGF5LXBpY2tlclwiLCBcImRhdGUtZm5zXCJdLFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFRoZW1lIGFuZCBhbmltYXRpb25zXG4gICAgICAgICAgXCJ0aGVtZVwiOiBbXCJuZXh0LXRoZW1lc1wiLCBcImNtZGtcIiwgXCJzb25uZXJcIl0sXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQ2Fyb3VzZWwgYW5kIG90aGVyIFVJXG4gICAgICAgICAgXCJjYXJvdXNlbFwiOiBbXCJlbWJsYS1jYXJvdXNlbC1yZWFjdFwiXSxcbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6IFwianMvW25hbWVdLVtoYXNoXS5qc1wiLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogXCJqcy9bbmFtZV0tW2hhc2hdLmpzXCIsXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAoYXNzZXRJbmZvKSA9PiB7XG4gICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lLnNwbGl0KFwiLlwiKTtcbiAgICAgICAgICBjb25zdCBleHQgPSBpbmZvW2luZm8ubGVuZ3RoIC0gMV07XG4gICAgICAgICAgaWYgKC9wbmd8anBlP2d8Z2lmfHN2Z3x3ZWJwfGljby8udGVzdChleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gYGltYWdlcy9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9IGVsc2UgaWYgKC93b2ZmfHdvZmYyfGVvdHx0dGZ8b3RmLy50ZXN0KGV4dCkpIHtcbiAgICAgICAgICAgIHJldHVybiBgZm9udHMvW25hbWVdLVtoYXNoXVtleHRuYW1lXWA7XG4gICAgICAgICAgfSBlbHNlIGlmIChleHQgPT09IFwiY3NzXCIpIHtcbiAgICAgICAgICAgIHJldHVybiBgY3NzL1tuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYFtuYW1lXS1baGFzaF1bZXh0bmFtZV1gO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIGV4dGVybmFsOiBbXSxcbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICBjb21tb25qc09wdGlvbnM6IHtcbiAgICAgIHRyYW5zZm9ybU1peGVkRXNNb2R1bGVzOiB0cnVlLFxuICAgIH0sXG4gIH0sXG4gIG9wdGltaXplOiB7XG4gICAgZXNidWlsZDoge1xuICAgICAgbGVnYWxDb21tZW50czogXCJub25lXCIsXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNE4sU0FBUyxvQkFBb0I7QUFDelAsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUZqQixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFVBQVU7QUFBQSxNQUNWLFlBQVk7QUFBQSxNQUNaLFNBQVM7QUFBQSxJQUNYO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUFBLEVBQ2pCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFFBQVE7QUFBQSxJQUNSLFdBQVcsU0FBUztBQUFBLElBQ3BCLGNBQWM7QUFBQSxJQUNkLHNCQUFzQjtBQUFBLElBQ3RCLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxRQUNSLGNBQWMsU0FBUztBQUFBLFFBQ3ZCLGVBQWUsU0FBUztBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUd6RCxZQUFZO0FBQUEsWUFDVjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUE7QUFBQSxVQUdBLFVBQVUsQ0FBQyxVQUFVO0FBQUE7QUFBQSxVQUdyQixTQUFTLENBQUMsdUJBQXVCO0FBQUE7QUFBQSxVQUdqQyxTQUFTLENBQUMsbUJBQW1CLHVCQUF1QixLQUFLO0FBQUE7QUFBQSxVQUd6RCxZQUFZLENBQUMsNEJBQTRCLFFBQVEsa0JBQWtCLHFCQUFxQjtBQUFBO0FBQUEsVUFHeEYsU0FBUyxDQUFDLGdCQUFnQixvQkFBb0IsVUFBVTtBQUFBO0FBQUEsVUFHeEQsU0FBUyxDQUFDLGVBQWUsUUFBUSxRQUFRO0FBQUE7QUFBQSxVQUd6QyxZQUFZLENBQUMsc0JBQXNCO0FBQUEsUUFDckM7QUFBQSxRQUNBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQixDQUFDLGNBQWM7QUFDN0IsZ0JBQU0sT0FBTyxVQUFVLEtBQUssTUFBTSxHQUFHO0FBQ3JDLGdCQUFNLE1BQU0sS0FBSyxLQUFLLFNBQVMsQ0FBQztBQUNoQyxjQUFJLDZCQUE2QixLQUFLLEdBQUcsR0FBRztBQUMxQyxtQkFBTztBQUFBLFVBQ1QsV0FBVyx5QkFBeUIsS0FBSyxHQUFHLEdBQUc7QUFDN0MsbUJBQU87QUFBQSxVQUNULFdBQVcsUUFBUSxPQUFPO0FBQ3hCLG1CQUFPO0FBQUEsVUFDVDtBQUNBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFVBQVUsQ0FBQztBQUFBLElBQ2I7QUFBQSxJQUNBLHVCQUF1QjtBQUFBLElBQ3ZCLGlCQUFpQjtBQUFBLE1BQ2YseUJBQXlCO0FBQUEsSUFDM0I7QUFBQSxFQUNGO0FBQUEsRUFDQSxVQUFVO0FBQUEsSUFDUixTQUFTO0FBQUEsTUFDUCxlQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
