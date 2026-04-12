import type { GameStatus, UserGame } from "@backlogify/types";
import { useAuth } from "@clerk/tanstack-react-start";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const userGamesQueryOptions = () =>
	queryOptions({
		queryKey: ["user-games"],
		queryFn: async (): Promise<UserGame[]> => {
			const res = await fetch("/api/user-games");
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
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
						game.id === gameId ? { ...game, status } : game,
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
