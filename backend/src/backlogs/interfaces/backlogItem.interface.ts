export interface BacklogItem {
  id: string;
  externalServiceId: number;
  name: string;
  coverUrl: string | null;
  addedAt: Date;
}
