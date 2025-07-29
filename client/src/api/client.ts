import ky from "ky";

export const apiClient = ky.create({
	// TODO: Environment variable for base URL
	// TODO: Setup token and auth headers
	prefixUrl: "http://localhost:3000",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000, // optional timeout in ms
});
