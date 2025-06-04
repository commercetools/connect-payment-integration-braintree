import { Static } from "@sinclair/typebox";
import { PaymentRequestSchema } from "./PaymentRequestSchema";

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
