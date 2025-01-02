import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
// astro.config.mjs
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [tailwind(), icon(), react()],
	output: "server",
	adapter: node({
		mode: "standalone",
	}),
	server: {
		host: true, // This is important for Docker
		port: 3000,
	},
	vite: {
		envPrefix: "BLOG_",
		server: {
			host: true, // This is important for Docker
			watch: {
				usePolling: true,
			},
		},
	},
});
