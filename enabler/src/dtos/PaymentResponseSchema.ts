import { Type } from "@sinclair/typebox";

export const PaymentResponseSchema = Type.Object({
	paymentReference: Type.String(),
	resultCode: Type.Enum({
		AUTHORIZED: "Authorized",
		REJECTED: "Rejected",
	}),
});
