import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [tailwind(), icon(), react()],
	output: "server",
	adapter: node({
		mode: "standalone",
		host: "0.0.0.0", // Add this
	}),
	// Remove the server config section since we're using the adapter
	vite: {
		envPrefix: "BLOG_",
	},
});
