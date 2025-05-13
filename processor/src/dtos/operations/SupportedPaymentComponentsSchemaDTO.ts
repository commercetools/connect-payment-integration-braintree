import { Static } from "@sinclair/typebox";
import { SupportedPaymentComponentsSchema } from "./SupportedPaymentComponentsSchema";

export type SupportedPaymentComponentsSchemaDTO = Static<
	typeof SupportedPaymentComponentsSchema
>;
