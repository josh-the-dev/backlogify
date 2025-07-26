"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacklogsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let BacklogsService = class BacklogsService {
    backlogs = [
        {
            id: 'default',
            name: 'My Backlog',
            items: [],
        },
    ];
    getBacklog(id) {
        return this.backlogs.find((b) => b.id === id);
    }
    addItemToBacklog(backlogId, item) {
        const backlog = this.getBacklog(backlogId);
        if (!backlog)
            throw new common_1.NotFoundException('Backlog not found');
        const exists = backlog.items.find((g) => g.externalServiceId === item.externalServiceId);
        if (exists)
            throw new common_1.ConflictException('Item already exists');
        const newItem = {
            ...item,
            id: (0, crypto_1.randomUUID)(),
            addedAt: new Date(),
        };
        backlog.items.push(newItem);
        return newItem;
    }
};
exports.BacklogsService = BacklogsService;
exports.BacklogsService = BacklogsService = __decorate([
    (0, common_1.Injectable)()
], BacklogsService);
//# sourceMappingURL=backlogs.service.js.map