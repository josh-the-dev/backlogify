import type { Preview, ReactRenderer } from "@storybook/react-vite";
import type { DecoratorFunction } from "storybook/internal/types";
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import "../src/styles.css";

const withRouter: DecoratorFunction<ReactRenderer> = (Story, context) => {
	const rootRoute = createRootRoute({
		component: Story,
	});

	const indexRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "/",
		component: () => null,
	});

	const catchAllRoute = createRoute({
		getParentRoute: () => rootRoute,
		path: "$",
		component: () => null,
	});

	const routeTree = rootRoute.addChildren([indexRoute, catchAllRoute]);
	const memoryHistory = createMemoryHistory({ initialEntries: ["/"] });

	const router = createRouter({
		routeTree,
		history: memoryHistory,
	});

	return <RouterProvider router={router} />;
};

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
	},
	decorators: [withRouter],
};

export default preview;
