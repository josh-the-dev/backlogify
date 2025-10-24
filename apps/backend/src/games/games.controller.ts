import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { GamesService }       from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('search')
  async search(@Query('query') query: string) {
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Search query is required');
    }

    return this.gamesService.search(query.trim());
  }
}
