import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

const config = defineConfig({
	plugins: [
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		nitro(),
		viteReact(),
	],
	optimizeDeps: {
		include: ["@clerk/tanstack-react-start", "cookie-es"],
	},
	resolve: {
		alias: {
			cookie: "cookie-es",
		},
	},
	css: {
		transformer: "postcss",
	},
	server: {
		port: 3000,
	},
});

export default config;
