import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Backlog, BacklogItem } from './backlogs.types';
import { randomUUID } from 'crypto';

@Injectable()
export class BacklogsService {
  private backlogs: Backlog[] = [
    {
      id: 'default',
      name: 'My Backlog',
      items: [],
    },
  ];

  getBacklog(id: string) {
    return this.backlogs.find((b) => b.id === id);
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
