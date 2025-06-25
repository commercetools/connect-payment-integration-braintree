import { Type } from "@sinclair/typebox";
//import { PaymentOutcomeSchema } from "./PaymentOutcomeSchema";
import { PaymentMethodType } from "./PaymentMethodType";

export const PaymentRequestSchema = Type.Object({
	nonce: Type.String(),
	paymentMethodType: Type.Enum(PaymentMethodType),
	options: Type.Optional(
		Type.Object({
			submitForSettlement: Type.Boolean(),
		}),
	),
	paymentReference: Type.Optional(Type.String()),
});
