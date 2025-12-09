import type { GameSearchResult } from "@backlogify/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AddToBacklogButton } from "../AddToBacklogButton";
import { GameCover } from "./GameCover";

export function GameCard({ game }: { game: GameSearchResult }) {
	return (
		<Card className="w-64 transition hover:scale-[1.02] hover:shadow-md">
			<CardHeader className="pb-2">
				<CardTitle className="text-center text-lg">{game.name}</CardTitle>
			</CardHeader>
			<CardContent className="flex justify-center">
				<GameCover name={game.name} coverUrl={game.coverUrl} />
			</CardContent>
			<CardFooter className="justify-center">
				<AddToBacklogButton
					externalServiceId={game.id.toString()}
					name={game.name}
					coverUrl={game.coverUrl}
					size="sm"
				/>
			</CardFooter>
		</Card>
	);
}
