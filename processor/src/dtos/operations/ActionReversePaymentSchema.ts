import { Type } from "@sinclair/typebox";
import { AmountSchema } from "./AmountSchema";

export const ActionReversePaymentSchema = Type.Composite([
	Type.Object({
		action: Type.Literal("reversePayment"),
	}),
	Type.Object({
		amount: AmountSchema,
		merchantReference: Type.Optional(Type.String()),
	}),
]);
