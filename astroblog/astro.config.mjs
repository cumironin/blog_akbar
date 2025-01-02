import node from "@astrojs/node";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [tailwind(), icon(), react()],
	output: "server",
	adapter: node({
		mode: "middleware",
	}),
	vite: {
		envPrefix: "BLOG_",
	},
});
