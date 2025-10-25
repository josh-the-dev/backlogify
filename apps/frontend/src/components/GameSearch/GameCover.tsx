interface GameCoverProps {
	name: string;
	coverUrl: string | null;
}

export function GameCover({ name, coverUrl }: GameCoverProps) {
	if (!coverUrl) {
		return (
			<div className="mt-3 flex h-40 w-full items-center justify-center rounded-md bg-gray-100 text-gray-400">
				No image
			</div>
		);
	}

	return (
		<img
			src={coverUrl}
			alt={name}
			loading="lazy"
			className="mt-3 h-40 w-full rounded-md object-cover"
		/>
	);
}
