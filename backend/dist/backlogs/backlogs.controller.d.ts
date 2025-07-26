import { BacklogsService } from './backlogs.service';
import { AddItemToBacklogDto } from './backlogs.dto';
export declare class BacklogsController {
    private readonly backlogsService;
    constructor(backlogsService: BacklogsService);
    getBacklog(id: string): import("./backlogs.types").Backlog;
    addItem(id: string, body: AddItemToBacklogDto): {
        id: string;
        message: string;
    };
}
