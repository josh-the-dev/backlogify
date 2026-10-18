import {
	paginationSchema,
	updateProfileSchema,
	type PublicBacklog,
	type UserProfile,
} from "@backlogify/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "./auth";
import { backendApi, isBackendStatus } from "./backend-api";

export const getMyProfile = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async ({ context }): Promise<UserProfile | null> => {
		// The backend answers a 200 with an empty body when no profile exists
		const profile = await backendApi
			.get("profiles/me", { headers: context.authHeaders })
			.json<UserProfile | "">();
		return profile || null;
	});

// A taken username is an expected outcome the dialog shows inline, so it is
// returned rather than thrown (thrown errors lose their type crossing to the
// browser)
export const updateMyProfile = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(updateProfileSchema)
	.handler(
		async ({
			data,
			context,
		}): Promise<
			{ status: "saved"; profile: UserProfile } | { status: "taken" }
		> => {
			try {
				const profile = await backendApi
					.put("profiles/me", { headers: context.authHeaders, json: data })
					.json<UserProfile>();
				return { status: "saved", profile };
			} catch (error) {
				if (isBackendStatus(error, 409)) return { status: "taken" };
				throw error;
			}
		},
	);

// Public: no Clerk session needed; backendApi still carries the
// server-to-server x-api-key. Missing and private backlogs both come back as
// null so visitors can't tell them apart.
export const getPublicBacklog = createServerFn({ method: "GET" })
	.validator(paginationSchema.extend({ username: z.string().min(1) }))
	.handler(async ({ data: { username, ...page } }) => {
		try {
			return await backendApi
				.get(`profiles/${encodeURIComponent(username)}/backlog`, {
					searchParams: page,
				})
				.json<PublicBacklog>();
		} catch (error) {
			if (isBackendStatus(error, 404)) return null;
			throw error;
		}
	});
