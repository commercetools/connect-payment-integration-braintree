import { Type, Static } from "@sinclair/typebox";

export enum PaymentMethodType {
	CARD = "card",
}

export const BraintreeInitRequestSchema = Type.Object({
	customerId: Type.Optional(Type.String()),
});

export type BraintreeInitRequestSchemaDTO = Static<typeof BraintreeInitRequestSchema>;

export const BraintreeInitResponseSchema = Type.Object({
	clientToken: Type.String(),
	paymentReference: Type.String(),
});

export type BraintreeInitResponseSchemaDTO = Static<typeof BraintreeInitResponseSchema>;

export const CreatePaymentResponseSchema = Type.Object({
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

export type CreatePaymentResponseSchemaDTO = Static<typeof CreatePaymentResponseSchema>;

export const PaymentRequestSchema = Type.Object({
	nonce: Type.String(),
	paymentMethodType: Type.Enum(PaymentMethodType),
	paymentReference: Type.Optional(Type.String()),
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
