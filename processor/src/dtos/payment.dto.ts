import { Type, Static } from "@sinclair/typebox";
import { BraintreeTransaction } from "./basic-types";

export enum PaymentMethodType {
	CARD = "card",
	INVOICE = "invoice",
	PURCHASE_ORDER = "purchaseorder",
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

export const CreatePaymentResponseSchema = BraintreeTransaction;

export type CreatePaymentResponseSchemaDTO = Static<typeof CreatePaymentResponseSchema>;

export const PaymentRequestSchema = Type.Object({
	nonce: Type.String(),
	paymentMethodType: Type.Enum(PaymentMethodType),
	paymentReference: Type.Optional(Type.String()),
});

export type PaymentRequestSchemaDTO = Static<typeof PaymentRequestSchema>;
