import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	RouterProvider,
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { render, type RenderOptions, waitFor } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

function createTestRouter(component: ReactNode, initialPath = "/") {
	const rootRoute = createRootRoute({
		component: () => <>{component}</>,
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

	const memoryHistory = createMemoryHistory({
		initialEntries: [initialPath],
	});

	return createRouter({
		routeTree,
		history: memoryHistory,
	});
}

interface WrapperProps {
	children: ReactNode;
}

function createWrapper(initialPath = "/") {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

	const router = createTestRouter(null, initialPath);

	return function Wrapper({ children }: WrapperProps) {
		// Override the root route component to render children
		router.options.routeTree.options.component = () => <>{children}</>;

		return (
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
			</QueryClientProvider>
		);
	};
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	initialPath?: string;
}

async function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
	const { initialPath = "/", ...renderOptions } = options;
	const result = render(ui, {
		wrapper: createWrapper(initialPath),
		...renderOptions,
	});

	// Wait for router to be ready
	await waitFor(() => {
		expect(result.container.innerHTML).not.toBe("");
	});

	return result;
}

export * from "@testing-library/react";
export { customRender as render };
