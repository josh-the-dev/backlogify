import type { AddUserGame, GameStatus, UserGame } from "@backlogify/types";
import { useAuth } from "@clerk/tanstack-react-start";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	addUserGame,
	listUserGames,
	removeUserGame,
	updateUserGame,
} from "../server/user-games";

/* Backend caps limit at 100 per request */
const PAGE_LIMIT = 100;
/* Hard stop (5000 games) so a misbehaving backend can never loop forever */
const MAX_PAGES = 50;

export const userGamesQueryOptions = () =>
	queryOptions({
		queryKey: ["user-games"],
		// Pages through the backend until a short page so the whole library
		// loads, keeping the flat UserGame[] shape that filters, counts, and
		// optimistic updates rely on
		queryFn: async (): Promise<UserGame[]> => {
			const games: UserGame[] = [];

			for (let page = 0; page < MAX_PAGES; page++) {
				const batch = await listUserGames({
					data: { limit: PAGE_LIMIT, offset: page * PAGE_LIMIT },
				});
				games.push(...batch);
				if (batch.length < PAGE_LIMIT) break;
			}

			return games;
		},
	});

const userGamesKey = userGamesQueryOptions().queryKey;

/**
 * Shared shape for library mutations: optionally apply the change to the
 * cached library straight away, roll back and toast on failure, and always
 * refetch afterwards so the cache matches the backend.
 */
function useUserGamesMutation<TVariables, TData>({
	mutationFn,
	optimistic,
	errorMessage,
	onSuccess,
}: {
	mutationFn: (variables: TVariables) => Promise<TData>;
	optimistic?: (games: UserGame[], variables: TVariables) => UserGame[];
	errorMessage: string;
	onSuccess?: (data: TData, variables: TVariables) => void;
}) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn,
		onMutate: async (variables) => {
			if (!optimistic) return {};
			await queryClient.cancelQueries({ queryKey: userGamesKey });
			const previousGames = queryClient.getQueryData(userGamesKey);
			if (previousGames) {
				queryClient.setQueryData(
					userGamesKey,
					optimistic(previousGames, variables),
				);
			}
			return { previousGames };
		},
		onError: (_error, _variables, context) => {
			if (context?.previousGames) {
				queryClient.setQueryData(userGamesKey, context.previousGames);
			}
			toast.error(errorMessage);
		},
		onSuccess,
		onSettled: () => queryClient.invalidateQueries({ queryKey: userGamesKey }),
	});
}

export function useAddUserGame() {
	const { userId } = useAuth();

	return useUserGamesMutation({
		mutationFn: (game: AddUserGame) => addUserGame({ data: game }),
		optimistic: (games, game) => {
			const now = new Date().toISOString();
			return [
				...games,
				{
					id: `temp-${Date.now()}`,
					userId: userId ?? "",
					externalServiceId: game.externalServiceId,
					name: game.name,
					coverUrl: game.coverUrl ?? null,
					status: game.status,
					addedAt: now,
					finishedAt: game.status === "played" ? now : null,
					note: null,
					pinnedAt: null,
				},
			];
		},
		errorMessage: "Failed to add game to library",
		onSuccess: (_data, game) => {
			toast.success(`${game.name} added to your backlog`);
		},
	});
}

export function useUpdateUserGameStatus() {
	return useUserGamesMutation({
		mutationFn: (variables: { gameId: string; status: GameStatus }) =>
			updateUserGame({ data: variables }),
		optimistic: (games, { gameId, status }) =>
			games.map((game) =>
				game.id === gameId
					? {
							...game,
							status,
							// Mirror the backend: played stamps the finish date,
							// anything else clears it; finishing or abandoning also
							// frees the Up next slot
							finishedAt: status === "played" ? new Date().toISOString() : null,
							pinnedAt:
								status === "played" || status === "abandoned"
									? null
									: game.pinnedAt,
						}
					: game,
			),
		errorMessage: "Failed to update game status",
	});
}

export function useUpdateUserGameNote() {
	return useUserGamesMutation({
		mutationFn: (variables: { gameId: string; note: string | null }) =>
			updateUserGame({ data: variables }),
		optimistic: (games, { gameId, note }) =>
			games.map((game) => (game.id === gameId ? { ...game, note } : game)),
		errorMessage: "Failed to save note",
	});
}

export function useUpdateUserGamePin() {
	return useUserGamesMutation({
		mutationFn: (variables: { gameId: string; pinned: boolean }) =>
			updateUserGame({ data: variables }),
		// Mirror the backend: the Up next slot holds one game, so pinning
		// steals it from whoever had it
		optimistic: (games, { gameId, pinned }) =>
			games.map((game) =>
				game.id === gameId
					? { ...game, pinnedAt: pinned ? new Date().toISOString() : null }
					: pinned
						? { ...game, pinnedAt: null }
						: game,
			),
		errorMessage: "Failed to update Up next",
	});
}

export function useRemoveUserGame() {
	return useUserGamesMutation({
		mutationFn: (gameId: string) => removeUserGame({ data: { gameId } }),
		errorMessage: "Failed to remove game from library",
	});
}
