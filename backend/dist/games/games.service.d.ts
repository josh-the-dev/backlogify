import { RawgService } from '../rawg/rawg.service';
import { GameSearchResult } from './types/games.types';
export declare class GamesService {
    private readonly rawgService;
    private readonly logger;
    constructor(rawgService: RawgService);
    search(query: string): Promise<GameSearchResult[]>;
}
