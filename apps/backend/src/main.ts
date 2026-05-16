import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/http-exception.filter";
import { LoggingInterceptor } from "./common/logging.interceptor";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalFilters(new AllExceptionsFilter());
	app.useGlobalInterceptors(new LoggingInterceptor());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	app.enableCors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
	});

	const port = process.env.PORT ?? 3001;
	await app.listen(port, "0.0.0.0");
	console.log(`Server listening on port ${port}`);
}
bootstrap();
