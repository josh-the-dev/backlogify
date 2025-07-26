import { Backlog, BacklogItem } from './backlogs.types';
export declare class BacklogsService {
    private backlogs;
    getBacklog(id: string): Backlog | undefined;
    addItemToBacklog(backlogId: string, item: Omit<BacklogItem, 'id' | 'addedAt'>): BacklogItem;
}
