import { Payment } from "@commercetools/connect-payments-sdk/dist/commercetools";

export type ReversePaymentRequest = {
	payment: Payment;
	merchantReference?: string;
};
