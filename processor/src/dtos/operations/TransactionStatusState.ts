import { Type } from "@sinclair/typebox";

const TransactionStatePending = Type.Literal("Pending", {
	description: "The authorization/capture has not happened yet. Most likely because we need to receive notification.",
});

const TransactionStateFailed = Type.Literal("Failed", {
	description: "Any error that occured for which the system can't recover automatically from.",
});

const TransactionStateComplete = Type.Literal("Completed", {
	description: "If there is a successful authorization/capture on the payment-transaction.",
});

export const TransactionStatusState = Type.Union([
	TransactionStateComplete,
	TransactionStateFailed,
	TransactionStatePending,
]);
