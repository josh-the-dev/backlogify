import { AlertCircle, RotateCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
	message: string;
	onRetry?: () => void;
}

export function GameDetailsError({ message, onRetry }: Props) {
	return (
		<div className="container mx-auto max-w-4xl p-6">
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{message}</AlertDescription>
			</Alert>
			{onRetry && (
				<Button
					variant="outline"
					size="sm"
					onClick={onRetry}
					className="mt-4"
				>
					<RotateCw className="size-4" />
					Try again
				</Button>
			)}
		</div>
	);
}
