import Footer from "@/components/Footer/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { Toaster } from "sonner";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { SearchCommand } from "../components/SearchCommand";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

const SITE_URL = "https://backlogify.app";
const SITE_TITLE = "Backlogify - every game you swore you'd get to";
const SITE_DESCRIPTION =
	"Track your game backlog. Search half a million titles, queue up the ones you mean to play, and keep track of what you actually finish.";
// Social crawlers (LinkedIn, Slack, WhatsApp) need an absolute image URL.
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
	// Site-wide defaults. Child routes that set the same name/property
	// (games/$id, u/$username) override these.
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: SITE_TITLE },
			{ name: "description", content: SITE_DESCRIPTION },
			{ property: "og:site_name", content: "Backlogify" },
			{ property: "og:type", content: "website" },
			{ property: "og:title", content: SITE_TITLE },
			{ property: "og:description", content: SITE_DESCRIPTION },
			{ property: "og:image", content: OG_IMAGE },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: SITE_TITLE },
			{ name: "twitter:description", content: SITE_DESCRIPTION },
			{ name: "twitter:image", content: OG_IMAGE },
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg",
			},
		],
	}),

	component: RootComponent,
	shellComponent: RootDocument,
});

function RootComponent() {
	return (
		<>
			<div className="flex flex-1 flex-col">
				<Header />
				<ErrorBoundary>
					<Outlet />
				</ErrorBoundary>
			</div>

			<Footer />
			<SearchCommand />
		</>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body className="flex min-h-screen flex-col">
					{children}
					{import.meta.env.MODE !== "production" && (
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
								TanStackQueryDevtools,
							]}
						/>
					)}
					<Toaster richColors position="bottom-right" />
					<Scripts />
				</body>
			</html>
		</ClerkProvider>
	);
}
