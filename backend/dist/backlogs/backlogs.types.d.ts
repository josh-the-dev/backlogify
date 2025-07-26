export interface BacklogItem {
    id: string;
    externalServiceId: number;
    name: string;
    coverUrl: string | null;
    addedAt: Date;
}
export interface Backlog {
    id: string;
    name: string;
    items: BacklogItem[];
}
