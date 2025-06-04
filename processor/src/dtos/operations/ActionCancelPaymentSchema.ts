import { Type } from "@sinclair/typebox";

export const ActionCancelPaymentSchema = Type.Composite([
	Type.Object({
		action: Type.Literal("cancelPayment"),
		merchantReference: Type.Optional(Type.String()),
	}),
]);
