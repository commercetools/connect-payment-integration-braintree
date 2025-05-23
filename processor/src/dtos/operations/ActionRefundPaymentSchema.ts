import { Type } from "@sinclair/typebox";
import { AmountSchema } from "./AmountSchema";

export const ActionRefundPaymentSchema = Type.Composite([
	Type.Object({
		action: Type.Literal("refundPayment"),
	}),
	Type.Object({
		amount: AmountSchema,
		merchantReference: Type.Optional(Type.String()),
	}),
]);
