import { Static } from "@sinclair/typebox";
import { PaymentIntentRequestSchema } from "./PaymentIntentRequestSchema";

export type PaymentIntentRequestSchemaDTO = Static<typeof PaymentIntentRequestSchema>;
