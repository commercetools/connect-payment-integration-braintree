import { Type } from "@sinclair/typebox";
//import { PaymentOutcomeSchema } from "./PaymentOutcomeSchema";
import { PaymentMethodType } from "./PaymentMethodType";

export const PaymentRequestSchema = Type.Object({
	nonce: Type.String(),
	amount: Type.String(),
	paymentMethod: Type.Object({
		type: Type.Enum(PaymentMethodType),
	}),
	options: Type.Object({
		submitForSettlement: Type.Boolean(),
	}),
	paymentReference: Type.Optional(Type.String()),
});
