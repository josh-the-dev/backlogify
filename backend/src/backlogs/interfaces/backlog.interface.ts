import { BacklogItem } from './backlogItem.interface';

export interface Backlog {
  id: string;
  name: string;
  items: BacklogItem[];
}
