import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Backlog, BacklogItem } from './backlogs.types';
import { randomUUID } from 'crypto';

@Injectable()
export class BacklogsService {
  private backlogs: Backlog[] = [];

  getBacklog(id: string) {
    const backlog = this.backlogs.find((b) => b.id === id);

    return backlog;
  }

  createBacklog(id: string, name: string) {
    if (this.getBacklog(id)) {
      throw new ConflictException('Backlog already exists');
    }
    const newBacklog: Backlog = {
      id,
      name,
      items: [],
    };
    this.backlogs.push(newBacklog);
    return newBacklog;
  }

  addItemToBacklog(
    backlogId: string,
    item: Omit<BacklogItem, 'id' | 'addedAt'>,
  ) {
    const backlog = this.getBacklog(backlogId);
    if (!backlog) throw new NotFoundException('Backlog not found');

    const exists = backlog.items.find(
      (g) => g.externalServiceId === item.externalServiceId,
    );
    if (exists) throw new ConflictException('Item already exists');

    const newItem: BacklogItem = {
      ...item,
      id: randomUUID(),
      addedAt: new Date(),
    };

    backlog.items.push(newItem);
    return newItem;
  }
}
