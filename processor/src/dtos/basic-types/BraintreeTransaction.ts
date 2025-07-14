import { Type } from "@sinclair/typebox";

export const BraintreeTransaction = Type.Object({
	id: Type.String(),
	success: Type.Boolean(),
	paymentReference: Type.Optional(Type.String()),
	additionalProcessorResponse: Type.String(),
	amount: Type.String(),
	status: Type.String(),
	statusHistory: Type.Optional(
		Type.Array(
			Type.Object({
				amount: Type.String(),
				status: Type.String(),
				timestamp: Type.Any(),
				transactionSource: Type.Optional(Type.String()),
				user: Type.String(),
			}),
		),
	),
});
