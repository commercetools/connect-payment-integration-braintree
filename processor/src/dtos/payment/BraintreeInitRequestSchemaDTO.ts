import { Static } from "@sinclair/typebox";
import { BraintreeInitRequestSchema } from "./BraintreeInitRequestSchema";

export type BraintreeInitRequestSchemaDTO = Static<typeof BraintreeInitRequestSchema>;
