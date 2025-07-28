import { Injectable, Logger } from '@nestjs/common';
import { RawgService } from '../rawg/rawg.service';
import { GameSearchResult } from './interfaces/games.interface';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(private readonly rawgService: RawgService) {}

  async search(query: string): Promise<GameSearchResult[]> {
    try {
      this.logger.log(`Searching games for query: "${query}"`);

      const rawgResponse = await this.rawgService.searchGames(query);

      return rawgResponse.results.map((game) => ({
        id: game.id,
        name: game.name,
        coverUrl: game.background_image || null,
      }));
    } catch (error) {
      this.logger.error(
        `Failed to search games: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
