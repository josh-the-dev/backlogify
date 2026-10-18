import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [swc.vite({ module: { type: "es6" } })],
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
