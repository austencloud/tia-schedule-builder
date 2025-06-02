import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig({
  plugins: [
    svelte({
      // Use the svelte.config.js file for configuration
      configFile: "./svelte.config.js",
    }),
  ],
  server: {
    port: 3000,
  },
});
