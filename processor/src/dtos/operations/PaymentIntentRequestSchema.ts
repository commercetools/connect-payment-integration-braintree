import { Type } from "@sinclair/typebox";
import { ActionCancelPaymentSchema } from "./ActionCancelPaymentSchema";
import { ActionCapturePaymentSchema } from "./ActionCapturePaymentSchema";
import { ActionRefundPaymentSchema } from "./ActionRefundPaymentSchema";
import { ActionReversePaymentSchema } from "./ActionReversePaymentSchema";

/**
 * Payment intent request schema.
 *
 * Example:
 * {
 *  "actions": [
 *   {
 *    "action": "capturePayment",
 *    "amount": {
 *      "centAmount": 100,
 *      "currencyCode": "EUR"
 *    }
 *  ]
 * }
 */
export const PaymentIntentRequestSchema = Type.Object({
	actions: Type.Array(
		Type.Union([
			ActionCapturePaymentSchema,
			ActionRefundPaymentSchema,
			ActionCancelPaymentSchema,
			ActionReversePaymentSchema,
		]),
		{
			maxItems: 1,
		},
	),
});
