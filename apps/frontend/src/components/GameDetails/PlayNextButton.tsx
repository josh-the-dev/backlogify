import { Button } from "@/components/ui/button";
import type { UserGame } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { Pin, PinOff } from "lucide-react";
import {
	useUpdateUserGamePin,
	userGamesQueryOptions,
} from "../../queries/user-games";

/**
 * Pin toggle for the Up next slot, shown on a game's detail page once the
 * game is in the user's library with a pinnable status. Render inside
 * <SignedIn> only.
 */
export function PlayNextButton({
	externalServiceId,
}: {
	externalServiceId: string;
}) {
	const userGamesQuery = useQuery(userGamesQueryOptions());
	const updatePin = useUpdateUserGamePin();

	const game = userGamesQuery.data?.find(
		(g: UserGame) => g.externalServiceId === externalServiceId,
	);

	if (!game || (game.status !== "backlog" && game.status !== "playing")) {
		return null;
	}

	const isPinned = Boolean(game.pinnedAt);

	return (
		<Button
			variant="outline"
			onClick={() => updatePin.mutate({ gameId: game.id, pinned: !isPinned })}
			disabled={updatePin.isPending}
			className={
				isPinned ? "border-primary/50 bg-primary/10 text-primary" : undefined
			}
		>
			{isPinned ? (
				<>
					<PinOff className="size-4" />
					Pinned as Up next
				</>
			) : (
				<>
					<Pin className="size-4" />
					Play this next
				</>
			)}
		</Button>
	);
}
