"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BacklogsController = void 0;
const common_1 = require("@nestjs/common");
const backlogs_service_1 = require("./backlogs.service");
const backlogs_dto_1 = require("./backlogs.dto");
let BacklogsController = class BacklogsController {
    backlogsService;
    constructor(backlogsService) {
        this.backlogsService = backlogsService;
    }
    getBacklog(id) {
        const backlog = this.backlogsService.getBacklog(id);
        if (!backlog) {
            throw new common_1.BadRequestException('Backlog not found');
        }
        return backlog;
    }
    addItem(id, body) {
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
};
exports.BacklogsController = BacklogsController;
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], BacklogsController.prototype, "getBacklog", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, backlogs_dto_1.AddItemToBacklogDto]),
    __metadata("design:returntype", void 0)
], BacklogsController.prototype, "addItem", null);
exports.BacklogsController = BacklogsController = __decorate([
    (0, common_1.Controller)('backlogs'),
    __metadata("design:paramtypes", [backlogs_service_1.BacklogsService])
], BacklogsController);
//# sourceMappingURL=backlogs.controller.js.map