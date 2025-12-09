import ky from "ky";

export const config = {
	backendUrl: process.env.BACKEND_URL || "http://localhost:3001",
	apiKey: process.env.API_KEY || "",
};

export const backendApi = ky.create({
	prefixUrl: config.backendUrl,
	headers: {
		"x-api-key": config.apiKey,
	},
});
