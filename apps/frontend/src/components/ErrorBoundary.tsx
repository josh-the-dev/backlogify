import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Props {
	children: ReactNode;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { error: null };

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("Uncaught error:", error, info.componentStack);
	}

	render() {
		if (this.state.error) {
			return (
				<div className="flex flex-1 items-center justify-center p-8">
					<div className="w-full max-w-md">
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertTitle>Something went wrong</AlertTitle>
							<AlertDescription className="mt-2 space-y-3">
								<p>An unexpected error occurred. Try refreshing the page.</p>
								<button
									onClick={() => window.location.reload()}
									className="rounded bg-destructive-foreground px-3 py-1.5 text-sm font-medium text-destructive hover:opacity-90"
								>
									Refresh page
								</button>
							</AlertDescription>
						</Alert>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
