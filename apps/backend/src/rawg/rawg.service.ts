import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AxiosError } from "axios";
import { firstValueFrom } from "rxjs";
import type {
	RawgGameDetails,
	RawgSearchResponse,
} from "./interfaces/rawg.interface";

@Injectable()
export class RawgService {
	private readonly logger = new Logger(RawgService.name);
	private readonly baseUrl = "https://api.rawg.io/api";
	private readonly apiKey: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
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
		try {
			this.logger.log(`Making RAWG API request: ${context}`);
			const url = `${this.baseUrl}${endpoint}`;
			const response = await firstValueFrom(
				this.httpService.get<T>(url, { params: { key: this.apiKey } }),
			);
			return response.data;
		} catch (error) {
			this.handleError(error, context);
		}
	}

	/**
	 * Maps RAWG API errors to user-friendly HttpExceptions.
	 */
	private handleError(error: AxiosError, context: string): never {
		const message = `RAWG API request failed (${context}): ${error.message}`;
		this.logger.error(message, error.stack);

		const status = error.response?.status;
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

	async searchGames(query: string): Promise<RawgSearchResponse> {
		const encodedQuery = encodeURIComponent(query);
		return this.fetchFromRawg<RawgSearchResponse>(
			`/games?search=${encodedQuery}`,
			`search for query "${query}"`,
		);
	}

	async getPopularGames(): Promise<RawgSearchResponse> {
		// Most-added within the last year, so the shelf reflects what people
		// are playing now rather than the all-time most-added back catalogue
		const today = new Date();
		const yearAgo = new Date(today);
		yearAgo.setFullYear(yearAgo.getFullYear() - 1);
		const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

		return this.fetchFromRawg<RawgSearchResponse>(
			`/games?dates=${toDateParam(yearAgo)},${toDateParam(today)}&ordering=-added&page_size=18`,
			"get popular games",
		);
	}

	async getGameDetails(id: string): Promise<RawgGameDetails> {
		return this.fetchFromRawg<RawgGameDetails>(
			`/games/${id}`,
			`get game details for ID "${id}"`,
		);
	}
}
