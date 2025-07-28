import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { RawgModule } from '../rawg/rawg.module';

@Module({
  imports: [RawgModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
