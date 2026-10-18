import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
	RawgGameDetails,
	RawgScreenshotsResponse,
	RawgSearchResponse,
	RawgStoresResponse,
} from "./interfaces/rawg.interface";

@Injectable()
export class RawgService {
	private readonly logger = new Logger(RawgService.name);
	private readonly baseUrl = "https://api.rawg.io/api";
	private readonly timeoutMs = 10_000;
	private readonly apiKey: string;

	constructor(private readonly configService: ConfigService) {
		this.apiKey = this.configService.get<string>("RAWG_API_KEY") ?? "";

		if (!this.apiKey) {
			const message = "RAWG_API_KEY is not configured";
			this.logger.error(message);
			throw new Error(message);
		}
	}

	/**
	 * Performs a GET request to the RAWG API.
	 * Handles consistent logging and error mapping.
	 */
	private async fetchFromRawg<T>(
		endpoint: string,
		context: string,
	): Promise<T> {
		this.logger.log(`Making RAWG API request: ${context}`);

		// Appended by hand because URLSearchParams would re-encode the commas
		// in params like dates=a,b
		const separator = endpoint.includes("?") ? "&" : "?";
		const url = `${this.baseUrl}${endpoint}${separator}key=${encodeURIComponent(this.apiKey)}`;

		let response: Response;
		try {
			response = await fetch(url, {
				signal: AbortSignal.timeout(this.timeoutMs),
			});
		} catch (error) {
			// Network failure or timeout, so there is no upstream status to map
			const err = error as Error;
			this.handleError(err.message, context, undefined, err.stack);
		}

		// fetch resolves on 4xx/5xx, unlike axios, so check the status here
		if (!response.ok) {
			this.handleError(
				`${response.status} ${response.statusText}`,
				context,
				response.status,
			);
		}

		return (await response.json()) as T;
	}

	/**
	 * Maps RAWG API errors to user-friendly HttpExceptions.
	 */
	private handleError(
		reason: string,
		context: string,
		status?: number,
		stack?: string,
	): never {
		const message = `RAWG API request failed (${context}): ${reason}`;
		this.logger.error(message, stack);

		switch (status) {
			case 401:
				throw new HttpException(
					"Invalid RAWG API key",
					HttpStatus.UNAUTHORIZED,
				);
			case 429:
				throw new HttpException(
					"RAWG API rate limit exceeded",
					HttpStatus.TOO_MANY_REQUESTS,
				);
			default:
				throw new HttpException(
					"Failed to fetch data from RAWG API",
					HttpStatus.SERVICE_UNAVAILABLE,
				);
		}
	}

	async searchGames(query: string, page = 1): Promise<RawgSearchResponse> {
		const encodedQuery = encodeURIComponent(query);
		return this.fetchFromRawg<RawgSearchResponse>(
			`/games?search=${encodedQuery}&page=${page}&page_size=20`,
			`search for query "${query}" (page ${page})`,
		);
	}

	async getPopularGames(page = 1): Promise<RawgSearchResponse> {
		// Most-added within the last year, so the shelf reflects what people
		// are playing now rather than the all-time most-added back catalogue
		const today = new Date();
		const yearAgo = new Date(today);
		yearAgo.setFullYear(yearAgo.getFullYear() - 1);
		const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

		return this.fetchFromRawg<RawgSearchResponse>(
			`/games?dates=${toDateParam(yearAgo)},${toDateParam(today)}&ordering=-added&page=${page}&page_size=20`,
			`get popular games (page ${page})`,
		);
	}

	async getGameDetails(id: string): Promise<RawgGameDetails> {
		return this.fetchFromRawg<RawgGameDetails>(
			`/games/${id}`,
			`get game details for ID "${id}"`,
		);
	}

	async getScreenshots(id: string): Promise<RawgScreenshotsResponse> {
		return this.fetchFromRawg<RawgScreenshotsResponse>(
			`/games/${id}/screenshots`,
			`get screenshots for ID "${id}"`,
		);
	}

	async getStores(id: string): Promise<RawgStoresResponse> {
		return this.fetchFromRawg<RawgStoresResponse>(
			`/games/${id}/stores`,
			`get stores for ID "${id}"`,
		);
	}

	async getSuggestedGames(id: string): Promise<RawgSearchResponse> {
		return this.fetchFromRawg<RawgSearchResponse>(
			`/games/${id}/game-series?page_size=12`,
			`get suggested games for ID "${id}"`,
		);
	}
}
