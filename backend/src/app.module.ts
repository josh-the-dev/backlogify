import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { ConfigModule } from '@nestjs/config';
import { BacklogsModule } from './backlogs/backlogs.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [GamesModule, ConfigModule.forRoot(), BacklogsModule],
})
export class AppModule {}
