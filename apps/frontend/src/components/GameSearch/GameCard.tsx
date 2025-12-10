import type { GameSearchResult } from "@backlogify/types";
import { GameCover } from "./GameCover";

export function GameCard({ game }: { game: GameSearchResult }) {
	return (
		<div className="group relative h-52 w-40 overflow-hidden rounded-lg transition hover:scale-[1.02] hover:shadow-lg">
			<GameCover
				name={game.name}
				coverUrl={game.coverUrl}
				className="h-full w-full"
			/>
			<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
				<h3 className="mb-3 px-2 text-center font-semibold text-sm text-white">
					{game.name}
				</h3>
			</div>
		</div>
	);
}
