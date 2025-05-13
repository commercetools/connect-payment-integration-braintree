import { Static } from "@sinclair/typebox";
import { FindCustomerResponseSchema } from "./FindCustomerResponseSchema";

export type FindCustomerResponseSchemaDTO = Static<
	typeof FindCustomerResponseSchema
>;
