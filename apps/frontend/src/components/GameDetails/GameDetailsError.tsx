import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Props {
	message: string;
}

export function GameDetailsError({ message }: Props) {
	return (
		<div className="container mx-auto max-w-4xl p-6">
			<Alert variant="destructive">
				<AlertCircle className="size-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{message}</AlertDescription>
			</Alert>
		</div>
	);
}
