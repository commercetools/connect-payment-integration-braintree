import { Type } from "@sinclair/typebox";
import { PaymentModificationStatus } from "./PaymentModificationStatus";

const PaymentModificationSchema = Type.Enum(PaymentModificationStatus);

export const PaymentIntentResponseSchema = Type.Object({
	outcome: PaymentModificationSchema,
	pspReference: Type.String(),
});
