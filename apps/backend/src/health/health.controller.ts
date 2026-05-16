import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult, HealthCheckService } from "@nestjs/terminus";
import { Public } from "../auth";
import { DatabaseHealthIndicator } from "./database.health";

@ApiTags("health")
@Controller("health")
@Public()
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly dbHealth: DatabaseHealthIndicator,
	) {}

	@Get()
	@HealthCheck()
	@ApiOperation({ summary: "Check service and database health" })
	@ApiResponse({ status: 200, description: "All checks healthy" })
	@ApiResponse({ status: 503, description: "One or more checks unhealthy" })
	check(): Promise<HealthCheckResult> {
		return this.health.check([() => this.dbHealth.isHealthy("database")]);
	}
}
