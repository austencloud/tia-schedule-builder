import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      hot: {
        preserveLocalState: true,
        noPreserveStateKey: ["@hmr:reset", "@!hmr"],
      },
    }),
  ],

  define: {
    __DEV_MODE__: JSON.stringify(process.env.NODE_ENV === "development"),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __MAGICAL_DEV__: JSON.stringify(true),
  },

  server: {
    port: 5173,
    open: false, // Controlled by magical script
    host: true,
    hmr: {
      timeout: 120000,
      overlay: true,
    },
    watch: {
      usePolling: false,
      interval: 100,
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.vscode/**",
        "**/*.log",
        "**/enhancement-planning/**",
        "**/ux-analysis/**",
      ],
    },
    warmup: {
      clientFiles: [
        "./src/**/*.{js,ts,jsx,tsx,vue,svelte}",
        "./src/**/*.html",
        "./src/**/*.css",
      ],
    },
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["svelte"],
        },
      },
    },
  },

  css: {
    devSourcemap: true,
  },

  optimizeDeps: {
    include: ["svelte"],
    exclude: [],
  },
});
