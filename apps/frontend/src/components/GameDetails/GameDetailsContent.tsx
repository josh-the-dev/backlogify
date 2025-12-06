import type { GameDetails as GameDetailsType } from "@backlogify/types";
import { format } from "date-fns";
import { AddToBacklogButton } from "../AddToBacklogButton";

export function GameDetailsContent({ game }: { game: GameDetailsType }) {
	const formattedDate = game.releaseDate
		? format(new Date(game.releaseDate), "dd/MM/yyyy")
		: "Unknown";

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="font-bold text-3xl">{game.name}</h1>
				<AddToBacklogButton
					externalServiceId={game.id.toString()}
					name={game.name}
					coverUrl={game.coverUrl}
				/>
			</div>

			{game.coverUrl && (
				<img
					src={game.coverUrl}
					alt={game.name}
					className="mb-6 max-h-[500px] w-full rounded-2xl object-cover shadow"
				/>
			)}

			<p>
				<strong>Released:</strong> {formattedDate}
			</p>

			{game.genres?.length > 0 && (
				<p>
					<strong>Genres:</strong> {game.genres.join(", ")}
				</p>
			)}

			{game.platforms?.length > 0 && (
				<p>
					<strong>Platforms:</strong> {game.platforms.join(", ")}
				</p>
			)}

			<div
				className="prose max-w-none"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted RAWG API
				dangerouslySetInnerHTML={{ __html: game.description }}
			/>
		</>
	);
}
