import { Test, TestingModule } from '@nestjs/testing';
import { BacklogsService } from './backlogs.service';
import { NotFoundException } from '@nestjs/common';

describe('BacklogsService', () => {
  let service: BacklogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BacklogsService],
    }).compile();

    service = module.get<BacklogsService>(BacklogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a backlog and add item to it', () => {
    const backlogId = 'test-backlog';

    // Create the backlog first
    service.createBacklog(backlogId, 'Test Backlog');

    const item = {
      externalServiceId: 123,
      name: 'Test Game',
      coverUrl: 'https://example.com/image.jpg',
    };

    const result = service.addItemToBacklog(backlogId, item);

    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test Game');

    const backlog = service.getBacklog(backlogId);
    expect(backlog).toBeDefined();
    expect(backlog!.items.length).toBe(1);
    expect(backlog!.items[0].externalServiceId).toBe(123);
  });

  it('should return undefined if backlog does not exist', () => {
    const result = service.getBacklog('non-existent');
    expect(result).toBeUndefined();
  });
});
