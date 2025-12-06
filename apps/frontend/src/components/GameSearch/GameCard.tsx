import type { GameSearchResult } from "@backlogify/types";
import { AddToBacklogButton } from "../AddToBacklogButton";
import { GameCover } from "./GameCover";

export function GameCard({ game }: { game: GameSearchResult }) {
	return (
		<li className="flex w-64 cursor-pointer flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:scale-[1.02] hover:shadow-md">
			<strong className="text-center font-medium text-gray-800 text-lg">
				{game.name}
			</strong>
			<GameCover name={game.name} coverUrl={game.coverUrl} />
			<div className="mt-3">
				<AddToBacklogButton
					externalServiceId={game.id.toString()}
					name={game.name}
					coverUrl={game.coverUrl}
					size="sm"
				/>
			</div>
		</li>
	);
}
