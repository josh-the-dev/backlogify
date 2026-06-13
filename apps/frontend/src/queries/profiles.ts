import type { PublicBacklog, UserGame, UserProfile } from "@backlogify/types";
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

/** Thrown when a public backlog is missing or private (both surface as 404). */
export class BacklogNotFoundError extends Error {
	constructor() {
		super("No public backlog found");
		this.name = "BacklogNotFoundError";
	}
}

/** Thrown by the update mutation when another user owns the username. */
export class UsernameTakenError extends Error {
	constructor() {
		super("That username is taken");
		this.name = "UsernameTakenError";
	}
}

export const profileQueryOptions = () =>
	queryOptions({
		queryKey: ["profile"],
		queryFn: async (): Promise<UserProfile | null> => {
			const res = await fetch("/api/profiles/me");
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
	});

export const publicBacklogQueryOptions = (username: string) =>
	queryOptions({
		queryKey: ["public-backlog", username.toLowerCase()],
		// Pages through the backend until a short page, mirroring the authed
		// library so the whole backlog loads as a flat list.
		queryFn: async (): Promise<PublicBacklog> => {
			const games: UserGame[] = [];

			for (let page = 0; page < MAX_PAGES; page++) {
				const res = await fetch(
					`/api/profiles/${encodeURIComponent(username)}/backlog?limit=${PAGE_LIMIT}&offset=${page * PAGE_LIMIT}`,
				);
				if (res.status === 404) throw new BacklogNotFoundError();
				if (!res.ok) throw new Error(`Request failed: ${res.status}`);
				const batch: PublicBacklog = await res.json();
				games.push(...batch.games);
				if (batch.games.length < PAGE_LIMIT) {
					return { username: batch.username, games };
				}
			}

			return { username, games };
		},
		retry: (failureCount, error) =>
			error instanceof BacklogNotFoundError ? false : failureCount < 3,
	});

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (profile: UserProfile): Promise<UserProfile> => {
			const res = await fetch("/api/profiles/me", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profile),
			});
			if (res.status === 409) throw new UsernameTakenError();
			if (!res.ok) {
				const error = await res.json().catch(() => ({}));
				throw new Error(error.error || `Request failed: ${res.status}`);
			}
			return res.json();
		},
		onSuccess: (data) => {
			queryClient.setQueryData(["profile"], data);
			toast.success(
				data.isPublic ? "Your backlog is now public" : "Profile saved",
			);
		},
		onError: (error) => {
			// The "taken" case is shown inline in the dialog, so skip the toast.
			if (error instanceof UsernameTakenError) return;
			toast.error("Failed to save profile");
		},
	});
}
