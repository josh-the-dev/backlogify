import type { GameDetails as GameDetailsType } from "@backlogify/types";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { AddToBacklogButton } from "../AddToBacklogButton";
import { GameCover } from "../GameSearch/GameCover";

export function GameDetailsContent({ game }: { game: GameDetailsType }) {
	const formattedDate = game.releaseDate
		? format(new Date(game.releaseDate), "d MMM yyyy")
		: null;

	const metaLine = [formattedDate, ...(game.genres ?? [])]
		.filter(Boolean)
		.join(" · ");

	return (
		<div className="mx-auto w-full max-w-5xl px-6 pt-12 pb-16 sm:pt-24">
			<div className="flex flex-col gap-8 sm:flex-row sm:items-end">
				<GameCover
					name={game.name}
					coverUrl={game.coverUrl}
					className="aspect-[3/4] w-40 shrink-0 rounded-xl border border-white/10 shadow-2xl sm:w-52"
				/>
				<div className="min-w-0 flex-1 pb-1">
					<h1 className="font-display font-bold text-4xl tracking-tight sm:text-5xl">
						{game.name}
					</h1>
					{metaLine && (
						<p className="mt-3 text-muted-foreground text-sm">{metaLine}</p>
					)}
					<div className="mt-6">
						<AddToBacklogButton
							externalServiceId={game.id.toString()}
							name={game.name}
							coverUrl={game.coverUrl}
						/>
					</div>
				</div>
			</div>

			{game.platforms?.length > 0 && (
				<p className="mt-10 text-sm">
					<span className="font-medium">Platforms</span>{" "}
					<span className="text-muted-foreground">
						{game.platforms.join(", ")}
					</span>
				</p>
			)}

			<div
				className="game-description mt-6 max-w-3xl text-[15px] text-muted-foreground leading-relaxed"
				dangerouslySetInnerHTML={{
					__html: DOMPurify.sanitize(game.description),
				}}
			/>
		</div>
	);
}
