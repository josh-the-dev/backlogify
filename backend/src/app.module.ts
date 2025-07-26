import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [GamesModule],
})
export class AppModule {}
