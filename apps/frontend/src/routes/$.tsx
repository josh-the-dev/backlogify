import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
	component: NotFoundPage,
});

function NotFoundPage() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
			<h1 className="font-bold text-6xl">404</h1>
			<p className="text-muted-foreground text-xl">Page not found</p>
			<Link to="/" className="text-primary underline-offset-4 hover:underline">
				Go home
			</Link>
		</div>
	);
}
