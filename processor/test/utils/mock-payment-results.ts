import { Payment, Transaction } from "@commercetools/connect-payments-sdk";
import { ValidationErrorsCollection, type ValidatedResponse, type Transaction as BraintreeTransaction, type ValidationError, Address } from "braintree";
export const mockGetPaymentResult: Payment = {
	id: "123456",
	version: 1,
	amountPlanned: {
		type: "centPrecision",
		currencyCode: "GBP",
		centAmount: 120000,
		fractionDigits: 2,
	},
	interfaceId: "92C12661DS923781G",
	paymentMethodInfo: {
		method: "Debit Card",
		name: { "en-US": "Debit Card", "en-GB": "Debit Card" },
	},
	paymentStatus: { interfaceText: "Paid" },
	transactions: [],
	interfaceInteractions: [],
	createdAt: "2024-02-13T00:00:00.000Z",
	lastModifiedAt: "2024-02-13T00:00:00.000Z",
};

const mockCancelPaymentTransaction: Transaction = {
	id: "dummy-transaction-id",
	timestamp: "2024-02-13T00:00:00.000Z",
	type: "CancelAuthorization",
	amount: {
		type: "centPrecision",
		centAmount: 120000,
		currencyCode: "GBP",
		fractionDigits: 2,
	},
	state: "Initial",
};

export const mockUpdatePaymentResult: Payment = {
	id: "123456",
	version: 1,
	amountPlanned: {
		type: "centPrecision",
		currencyCode: "GBP",
		centAmount: 120000,
		fractionDigits: 2,
	},
	interfaceId: "92C12661DS923781G",
	paymentMethodInfo: {
		method: "Debit Card",
		name: { "en-US": "Debit Card", "en-GB": "Debit Card" },
	},
	paymentStatus: { interfaceText: "Paid" },
	transactions: [mockCancelPaymentTransaction],
	interfaceInteractions: [],
	createdAt: "2024-02-13T00:00:00.000Z",
	lastModifiedAt: "2024-02-13T00:00:00.000Z",
};

const error: ValidationError = {
	attribute: "dummy-attribute",
	code: "dummy-code",
	message: "dummy-message"
}

const errorsCollection: ValidationErrorsCollection = {
	deepErrors: () => [error],
	for: (name: string) => { return errorsCollection },
	forIndex: (index: number) => { return errorsCollection},
	on: (name: string) => error,
}

export const mockBraintreeRefundPaymentResponse: ValidatedResponse<BraintreeTransaction> = {
	success: true,
	message: "Refund successful",
	params: {},
	errors: errorsCollection
} as ValidatedResponse<BraintreeTransaction>;