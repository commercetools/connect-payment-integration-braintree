import { Static } from "@sinclair/typebox";
import { CreateCustomerRequestSchema } from "./CreateCustomerRequestSchema";

export type CreateCustomerRequestSchemaDTO = Static<typeof CreateCustomerRequestSchema>;
