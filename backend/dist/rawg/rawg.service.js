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
var RawgService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RawgService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
let RawgService = RawgService_1 = class RawgService {
    httpService;
    configService;
    logger = new common_1.Logger(RawgService_1.name);
    baseUrl = 'https://api.rawg.io/api';
    apiKey;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiKey = this.configService.get('RAWG_API_KEY');
        if (!this.apiKey) {
            this.logger.error('RAWG_API_KEY is not configured');
            throw new Error('RAWG_API_KEY is required');
        }
    }
    async searchGames(query) {
        try {
            const url = `${this.baseUrl}/games`;
            const params = {
                key: this.apiKey,
                search: encodeURIComponent(query),
            };
            this.logger.log(`Making RAWG API request for query: "${query}"`);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, { params }));
            return response.data;
        }
        catch (error) {
            this.logger.error(`RAWG API request failed: ${error.message}`, error.stack);
            if (error.response?.status === 401) {
                throw new common_1.HttpException('Invalid RAWG API key', common_1.HttpStatus.UNAUTHORIZED);
            }
            if (error.response?.status === 429) {
                throw new common_1.HttpException('RAWG API rate limit exceeded', common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            throw new common_1.HttpException('Failed to fetch data from RAWG API', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.RawgService = RawgService;
exports.RawgService = RawgService = RawgService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], RawgService);
//# sourceMappingURL=rawg.service.js.map