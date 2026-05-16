import type { GameSearchResult } from "@backlogify/types";
import { GameCover } from "./GameCover";

export function GameCard({ game }: { game: GameSearchResult }) {
	return (
		<div className="group flex w-40 flex-col overflow-hidden rounded-lg border border-border/50 bg-card transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_24px_oklch(0.68_0.28_280/0.2)] hover:-translate-y-1">
			<GameCover
				name={game.name}
				coverUrl={game.coverUrl}
				className="h-52 w-full transition-transform duration-200 group-hover:scale-[1.02]"
			/>
			<div className="flex h-14 items-center justify-center p-2">
				<h3 className="line-clamp-2 text-center text-sm font-medium">
					{game.name}
				</h3>
			</div>
		</div>
	);
}
