import type { PublicBacklog, PublicGame, UserProfile } from "@backlogify/types";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
	getMyProfile,
	getPublicBacklog,
	updateMyProfile,
} from "../server/profiles";

/* Backend caps limit at 100 per request */
const PAGE_LIMIT = 100;
/* Hard stop (5000 games) so a misbehaving backend can never loop forever */
const MAX_PAGES = 50;

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
		queryFn: () => getMyProfile(),
	});

export const publicBacklogQueryOptions = (username: string) =>
	queryOptions({
		queryKey: ["public-backlog", username.toLowerCase()],
		// Pages through the backend until a short page, mirroring the authed
		// library so the whole backlog loads as a flat list. A missing or
		// private backlog resolves to null rather than failing: a failed query
		// prefetched during SSR could reach the browser stuck pending.
		queryFn: async (): Promise<PublicBacklog | null> => {
			const games: PublicGame[] = [];

			for (let page = 0; page < MAX_PAGES; page++) {
				const batch = await getPublicBacklog({
					data: { username, limit: PAGE_LIMIT, offset: page * PAGE_LIMIT },
				});
				if (!batch) return null;
				games.push(...batch.games);
				if (batch.games.length < PAGE_LIMIT) {
					return { username: batch.username, games };
				}
			}

			return { username, games };
		},
	});

export function useUpdateProfile() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (profile: UserProfile): Promise<UserProfile> => {
			const result = await updateMyProfile({ data: profile });
			if (result.status === "taken") throw new UsernameTakenError();
			return result.profile;
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
