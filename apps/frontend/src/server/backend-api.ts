// Fails the build if anything pulls this into the client bundle: it holds
// the server-to-server API key. Server function modules import it only
// inside handlers, which the Start compiler strips from the client.
import "@tanstack/react-start/server-only";
import ky, { HTTPError } from "ky";

export const backendApi = ky.create({
	prefixUrl: process.env.BACKEND_URL || "http://localhost:3001",
	headers: {
		"x-api-key": process.env.API_KEY || "",
	},
	// TanStack Query already retries failed queries in the browser; retrying
	// here too stacked ky's backoff on top and turned one backend 5xx into a
	// request that hung for a minute
	retry: 0,
	timeout: 15_000,
	hooks: {
		beforeError: [
			// Server function errors are serialized to the browser, so keep the
			// internal backend URL out of the message
			(error) => {
				error.message = `Backend request failed (${error.response.status})`;
				return error;
			},
		],
	},
});

export function isBackendStatus(error: unknown, status: number) {
	return error instanceof HTTPError && error.response.status === status;
}
