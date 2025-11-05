import type { GameDetails as GameDetailsType } from "@backlogify/types";
import { GameDetailsContent } from "./GameDetailsContent";

interface GameDetailsProps {
	game: GameDetailsType;
}

export function GameDetails({ game }: GameDetailsProps) {
	return (
		<div className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
			<GameDetailsContent game={game} />
		</div>
	);
}
