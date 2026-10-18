import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// esbuild can't emit decorator metadata, which Nest's DI relies on
	plugins: [swc.vite({ module: { type: "es6" } })],
	test: {
		globals: true,
		environment: "node",
		include: ["src/**/*.spec.ts"],
		coverage: {
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.module.ts", "src/main.ts"],
		},
	},
});
