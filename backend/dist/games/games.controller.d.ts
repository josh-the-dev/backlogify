import { GamesService } from './games.service';
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    search(query: string): Promise<import("./games.types").GameSearchResult[]>;
}
