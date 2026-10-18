import { applyDecorators, SerializeOptions } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import type { z } from "zod";

interface ApiSchemaResponseOptions {
	status: number;
	description: string;
	// The serializer maps array responses item by item, so list routes pass
	// the item schema and flag the array here for Swagger
	isArray?: boolean;
}

/**
 * Documents a success response with a shared schema and serializes the
 * handler's return value through it: fields the schema leaves out are
 * stripped and dates are encoded as ISO strings.
 */
export function ApiSchemaResponse(
	schema: z.ZodType,
	{ status, description, isArray }: ApiSchemaResponseOptions,
) {
	return applyDecorators(
		SerializeOptions({ schema }),
		ApiResponse({ status, description, standardSchema: schema, isArray }),
	);
}
