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
var GamesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const rawg_service_1 = require("../rawg/rawg.service");
let GamesService = GamesService_1 = class GamesService {
    rawgService;
    logger = new common_1.Logger(GamesService_1.name);
    constructor(rawgService) {
        this.rawgService = rawgService;
    }
    async search(query) {
        try {
            this.logger.log(`Searching games for query: "${query}"`);
            const rawgResponse = await this.rawgService.searchGames(query);
            return rawgResponse.results.map((game) => ({
                id: game.id,
                name: game.name,
                coverUrl: game.background_image || null,
            }));
        }
        catch (error) {
            this.logger.error(`Failed to search games: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = GamesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rawg_service_1.RawgService])
], GamesService);
//# sourceMappingURL=games.service.js.map