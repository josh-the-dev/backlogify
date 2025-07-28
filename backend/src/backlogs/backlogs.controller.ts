import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { BacklogsService } from './backlogs.service';
import { AddItemToBacklogDto } from './dtos/add-item-to-backlog.dto';
import { CreateBacklogDto } from './dtos/create-backlog.dto';

@Controller('backlogs')
export class BacklogsController {
  constructor(private readonly backlogsService: BacklogsService) {}

  @Get(':id')
  getBacklog(@Param('id') id: string) {
    const backlog = this.backlogsService.getBacklog(id);
    if (!backlog) {
      throw new BadRequestException('Backlog not found');
    }
    return backlog;
  }

  @Post()
  @HttpCode(201)
  createBacklog(@Body(ValidationPipe) body: CreateBacklogDto) {
    const backlog = this.backlogsService.createBacklog(body.name);
    return {
      id: backlog.id,
      name: backlog.name,
      message: 'Backlog created successfully',
    };
  }

  @Post(':id/items')
  @HttpCode(201)
  addItem(
    @Param('id') id: string,
    @Body(ValidationPipe) body: AddItemToBacklogDto,
  ) {
    const item = this.backlogsService.addItemToBacklog(id, {
      externalServiceId: body.externalServiceId,
      name: body.name,
      coverUrl: body.coverUrl || null,
    });

    return {
      id: item.id,
      message: 'Item added successfully',
    };
  }
}
