import { Inject, Injectable } from "@nestjs/common";
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { sql } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE } from "../database";
import * as schema from "../database/schema";

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
	constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {
		super();
	}

	async isHealthy(key: string): Promise<HealthIndicatorResult> {
		try {
			await this.db.execute(sql`SELECT 1`);
			return this.getStatus(key, true);
		} catch {
			throw new HealthCheckError("Database check failed", this.getStatus(key, false));
		}
	}
}
