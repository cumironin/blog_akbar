// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import icon from "astro-icon";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), icon(), react()],

  server: {
    port: 3000,
  },

  output: "server",

  vite: {
    envPrefix: "BLOG_",
  },

  adapter: node({
    mode: "standalone",
  }),
});