import swc from "unplugin-swc";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	// esbuild can't emit decorator metadata, which Nest's DI relies on
	plugins: [swc.vite({ module: { type: "es6" } })],
	resolve: {
		// Test against the shared package source so no prior build is needed
		alias: {
			"@backlogify/types": resolve(
				__dirname,
				"../../packages/types/src/index.ts",
			),
		},
	},
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
