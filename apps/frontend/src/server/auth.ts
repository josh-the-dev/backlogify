import { auth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";

/**
 * Resolves the Clerk session, handing handlers the backend auth header, or
 * null for a signed-out visitor.
 */
export const sessionMiddleware = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		const { userId, getToken } = await auth();
		const token = userId ? await getToken() : null;

		return next({
			context: {
				authHeaders: token ? { Authorization: `Bearer ${token}` } : null,
			},
		});
	},
);

/** Like sessionMiddleware, but rejects signed-out callers. */
export const authMiddleware = createMiddleware({ type: "function" })
	.middleware([sessionMiddleware])
	.server(({ next, context }) => {
		if (!context.authHeaders) {
			throw new Error("Unauthorized");
		}

		return next({ context: { authHeaders: context.authHeaders } });
	});
