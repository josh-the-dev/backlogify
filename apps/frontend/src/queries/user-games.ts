import type { GameStatus, UserGame } from "@backlogify/types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

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
		onSuccess: () => {
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
		onSuccess: () => {
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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["user-games"] });
		},
	});
}
