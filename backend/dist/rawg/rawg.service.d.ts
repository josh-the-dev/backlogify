import { RawgSearchResponse } from './rawg.types';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export declare class RawgService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    constructor(httpService: HttpService, configService: ConfigService);
    searchGames(query: string): Promise<RawgSearchResponse>;
}
