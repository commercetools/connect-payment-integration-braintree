import { Type } from "@sinclair/typebox";
import { TransactionStatusState } from "./TransactionStatusState";

export const TransactionResponse = Type.Object({
	transactionStatus: Type.Object({
		state: TransactionStatusState,
		errors: Type.Array(
			Type.Object({
				code: Type.Literal("PaymentRejected"),
				message: Type.String(),
			}),
		),
	}),
});
