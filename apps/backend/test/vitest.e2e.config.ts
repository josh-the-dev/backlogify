import swc from "unplugin-swc";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [swc.vite({ module: { type: "es6" } })],
	resolve: {
		// Test against the shared package source so no prior build is needed
		alias: {
			"@backlogify/types": resolve(
				__dirname,
				"../../../packages/types/src/index.ts",
			),
		},
	},
	test: {
		root: __dirname,
		globals: true,
		environment: "node",
		include: ["**/*.e2e-spec.ts"],
		setupFiles: ["./e2e-env-setup.ts"],
		// Specs share one test database, so run files one at a time
		fileParallelism: false,
	},
});
