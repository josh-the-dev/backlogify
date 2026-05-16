import { cn } from "@/lib/utils";

interface GameCoverProps {
	name: string;
	coverUrl: string | null;
	className?: string;
}

export function GameCover({ name, coverUrl, className }: GameCoverProps) {
	if (!coverUrl) {
		return (
			<div className={cn("flex items-center justify-center bg-muted text-muted-foreground text-xs", className)}>
				No image
			</div>
		);
	}

	return (
		<img
			src={coverUrl}
			alt={name}
			loading="lazy"
			className={cn("object-cover", className)}
		/>
	);
}
