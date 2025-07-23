import { Type } from "@sinclair/typebox";

import { PaymentMethodType } from "./PaymentMethodType";

export const PaymentRequestSchema = Type.Object({
	nonce: Type.String(),
	paymentMethodType: Type.Enum(PaymentMethodType),
	paymentReference: Type.Optional(Type.String()),
});
