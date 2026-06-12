import type { GameStatus, UserGame } from "@backlogify/types";
import { useAuth } from "@clerk/tanstack-react-start";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

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
				const res = await fetch(
					`/api/user-games?limit=${PAGE_LIMIT}&offset=${page * PAGE_LIMIT}`,
				);
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const batch: UserGame[] = await res.json();
				games.push(...batch);
				if (batch.length < PAGE_LIMIT) break;
			}

			return games;
		},
	});

interface AddUserGameParams {
	externalServiceId: string;
	name: string;
	coverUrl?: string;
	status: GameStatus;
}

export function useAddUserGame() {
	const queryClient = useQueryClient();
	const { userId } = useAuth();

	return useMutation({
		mutationFn: async (params: AddUserGameParams): Promise<UserGame> => {
			const res = await fetch("/api/user-games", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(params),
			});
			if (!res.ok) {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.error || `Request failed: ${res.status}`);
			}
			return res.json();
		},
		onMutate: async (newGame) => {
			await queryClient.cancelQueries({ queryKey: ["user-games"] });
			const previousGames = queryClient.getQueryData<UserGame[]>([
				"user-games",
			]);

			if (previousGames) {
				const optimisticGame: UserGame = {
					id: `temp-${Date.now()}`,
					userId: userId ?? "",
					externalServiceId: newGame.externalServiceId,
					name: newGame.name,
					coverUrl: newGame.coverUrl,
					status: newGame.status,
					addedAt: new Date(),
				};
				queryClient.setQueryData<UserGame[]>(
					["user-games"],
					[...previousGames, optimisticGame],
				);
			}

			return { previousGames };
		},
		onError: (_err, _newGame, context) => {
			if (context?.previousGames) {
				queryClient.setQueryData(["user-games"], context.previousGames);
			}
			toast.error("Failed to add game to library");
		},
		onSuccess: (_data, newGame) => {
			toast.success(`${newGame.name} added to your backlog`);
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["user-games"] });
		},
	});
}

export function useUpdateUserGameStatus() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			status,
		}: {
			gameId: string;
			status: GameStatus;
		}): Promise<UserGame> => {
			const res = await fetch(`/api/user-games/${gameId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status }),
			});
			if (!res.ok) {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.error || `Request failed: ${res.status}`);
			}
			return res.json();
		},
		onMutate: async ({ gameId, status }) => {
			await queryClient.cancelQueries({ queryKey: ["user-games"] });
			const previousGames = queryClient.getQueryData<UserGame[]>([
				"user-games",
			]);

			if (previousGames) {
				queryClient.setQueryData<UserGame[]>(
					["user-games"],
					previousGames.map((game) =>
						game.id === gameId
							? {
									...game,
									status,
									// Mirror the backend: played stamps the finish
									// date, anything else clears it
									finishedAt: status === "played" ? new Date() : null,
								}
							: game,
					),
				);
			}

			return { previousGames };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousGames) {
				queryClient.setQueryData(["user-games"], context.previousGames);
			}
			toast.error("Failed to update game status");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["user-games"] });
		},
	});
}

export function useUpdateUserGameNote() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			gameId,
			note,
		}: {
			gameId: string;
			note: string | null;
		}): Promise<UserGame> => {
			const res = await fetch(`/api/user-games/${gameId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ note }),
			});
			if (!res.ok) {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.error || `Request failed: ${res.status}`);
			}
			return res.json();
		},
		onMutate: async ({ gameId, note }) => {
			await queryClient.cancelQueries({ queryKey: ["user-games"] });
			const previousGames = queryClient.getQueryData<UserGame[]>([
				"user-games",
			]);

			if (previousGames) {
				queryClient.setQueryData<UserGame[]>(
					["user-games"],
					previousGames.map((game) =>
						game.id === gameId ? { ...game, note } : game,
					),
				);
			}

			return { previousGames };
		},
		onError: (_err, _variables, context) => {
			if (context?.previousGames) {
				queryClient.setQueryData(["user-games"], context.previousGames);
			}
			toast.error("Failed to save note");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["user-games"] });
		},
	});
}

export function useRemoveUserGame() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (gameId: string): Promise<void> => {
			const res = await fetch(`/api/user-games/${gameId}`, {
				method: "DELETE",
			});
			if (!res.ok) {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.error || `Request failed: ${res.status}`);
			}
		},
		onError: () => {
			toast.error("Failed to remove game from library");
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-games"] });
		},
	});
}
