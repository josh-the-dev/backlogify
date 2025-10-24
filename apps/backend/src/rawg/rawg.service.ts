import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import type { RawgSearchResponse } from "./interfaces/rawg.interface";

@Injectable()
export class RawgService {
	private readonly logger = new Logger(RawgService.name);
	private readonly baseUrl = "https://api.rawg.io/api";
	private readonly apiKey: string;

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {
		this.apiKey = this.configService.get<string>("RAWG_API_KEY")!;

		if (!this.apiKey) {
			this.logger.error("RAWG_API_KEY is not configured");
			throw new Error("RAWG_API_KEY is required");
		}
	}

	async searchGames(query: string): Promise<RawgSearchResponse> {
		try {
			const url = `${this.baseUrl}/games`;
			const params = {
				key: this.apiKey,
				search: encodeURIComponent(query),
			};

			this.logger.log(`Making RAWG API request for query: "${query}"`);

			const response = await firstValueFrom(
				this.httpService.get<RawgSearchResponse>(url, { params }),
			);

			return response.data;
		} catch (error) {
			this.logger.error(
				`RAWG API request failed: ${error.message}`,
				error.stack,
			);

			if (error.response?.status === 401) {
				throw new HttpException(
					"Invalid RAWG API key",
					HttpStatus.UNAUTHORIZED,
				);
			}

			if (error.response?.status === 429) {
				throw new HttpException(
					"RAWG API rate limit exceeded",
					HttpStatus.TOO_MANY_REQUESTS,
				);
			}

			throw new HttpException(
				"Failed to fetch data from RAWG API",
				HttpStatus.SERVICE_UNAVAILABLE,
			);
		}
	}
}
