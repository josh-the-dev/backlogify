import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { isNotFound, isRedirect } from "@tanstack/react-router";
import {
	createCsrfMiddleware,
	createMiddleware,
	createStart,
} from "@tanstack/react-start";

// Server function mutations ride on the Clerk session cookie, so only accept
// state-changing requests from our own pages. Reads are left alone: plain
// navigations (Sec-Fetch-Site: none) would fail the same-origin check.
const csrfMiddleware = createCsrfMiddleware({
	filter: ({ request }) => !["GET", "HEAD", "OPTIONS"].includes(request.method),
});

// Start can only send an error to the browser if it can serialize it. One it
// can't (ky's HTTPError holds a live Request/Response) falls back to a plain
// JSON 500 that the client resolves as a *successful* result, so a failed
// save would look like it worked. Rethrow every error as a plain Error.
const serializableErrorsMiddleware = createMiddleware({
	type: "function",
}).server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (isRedirect(error) || isNotFound(error)) throw error;
		throw new Error(error instanceof Error ? error.message : String(error));
	}
});

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [csrfMiddleware, clerkMiddleware()],
		functionMiddleware: [serializableErrorsMiddleware],
	};
});
