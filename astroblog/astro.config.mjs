// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import icon from "astro-icon";

import react from "@astrojs/react";

import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), icon(), react()],

	output: "server",

	vite: {
		envPrefix: "BLOG_",
		server: {
			host: "0.0.0.0",
			watch: {
				usePolling: true,
			},
		},
	},

	server: {
		host: "0.0.0.0",
		port: 3000,
	},

	adapter: node({
		mode: "standalone",
	}),
});
