import { Inject, Injectable } from "@nestjs/common";
import {
	HealthIndicatorResult,
	HealthIndicatorService,
} from "@nestjs/terminus";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../database";
import * as schema from "../database/schema";

@Injectable()
export class DatabaseHealthIndicator {
	constructor(
		@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
		private readonly healthIndicatorService: HealthIndicatorService,
	) {}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		// A hung connection reports down rather than stalling the health check
		return this.healthIndicatorService
			.check(key)
			.attempt(() => this.db.execute(sql`SELECT 1`).then(() => undefined))
			.withTimeout(3000);
	}
}
