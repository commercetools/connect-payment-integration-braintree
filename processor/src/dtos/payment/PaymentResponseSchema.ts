import { Type } from "@sinclair/typebox";
import { BraintreeTransaction } from "../basic-types";

export const PaymentResponseSchema = Type.Intersect([
	Type.Object({ paymentReference: Type.String() }),
	BraintreeTransaction,
]);
