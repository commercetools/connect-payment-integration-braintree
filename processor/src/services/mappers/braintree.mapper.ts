import { Address, Cart, LineItem, TransactionState } from "@commercetools/connect-payments-sdk";
import { PaymentAmount } from "@commercetools/connect-payments-sdk/dist/commercetools/types/payment.type";
import { type TransactionLineItem, type TransactionRequest, TransactionStatus } from "braintree";

export const mapBraintreeToCtResultCode = function (resultCode: TransactionStatus, success: boolean): TransactionState {
	switch (resultCode) {
		case "authorizing":
		case "settlement_pending":
		case "settling":
		case "submitted_for_settlement": {
			if (success) return "Success";
			return "Failure";
		}
		case "authorized":
		case "settlement_confirmed":
		case "settled":
		case "voided": {
			return "Success";
		}
		case "authorization_expired":
		case "settlement_declined":
		case "failed":
		case "gateway_rejected":
		case "processor_declined": {
			return "Failure";
		}
		default: {
			return "Initial";
		}
	}
};

export const mapToBraintreeCreatePaymentRequest = (cart: Cart): TransactionRequest => {
	return {
		amount: mapCtPaymentAmountToBraintreeAmount(cart.totalPrice),
		lineItems: mapLineItems(cart.lineItems, cart.locale),

		billing: mapBillingAddress(cart.billingAddress),
	};
};

export const mapCtPaymentAmountToBraintreeAmount = (amountPlanned: PaymentAmount): string => {
	if (amountPlanned.centAmount <= 0 || amountPlanned.centAmount.toString().indexOf(".") !== -1) {
		throw new Error(
			`Payment cent amount must be a positive integer above zero, received ${amountPlanned.centAmount}.`,
		);
	}
	if (amountPlanned.fractionDigits === 0) {
		return amountPlanned.centAmount.toString();
	}
	return (amountPlanned.centAmount / Math.pow(10, amountPlanned.fractionDigits)).toString();
};

const mapLineItems = (lineItems: LineItem[], locale: string | undefined): TransactionLineItem[] | undefined => {
	if (!lineItems || lineItems.length === 0) {
		return undefined;
	}
	return lineItems.map((lineItem) => ({
		quantity: lineItem.quantity.toString(),
		name: locale ? (lineItem.name[locale] as string) : "",
		kind: "debit",
		unitAmount: (lineItem.price.value.centAmount / Math.pow(10, lineItem.price.value.fractionDigits)).toString(),
		taxAmount: "0",
		totalAmount: "0",
	}));
};

const mapBillingAddress = (billingAddress: Address | undefined) => {
	if (!billingAddress) {
		return undefined;
	}
	return;
	{
		firstName: (billingAddress as Address).firstName;
		lastName: (billingAddress as Address).lastName;
		company: (billingAddress as Address).company;
		streetAddress: (billingAddress as Address).streetName;
		extendedAddress: (billingAddress as Address).streetNumber;
		locality: (billingAddress as Address).city;
		region: (billingAddress as Address).state;
		postalCode: (billingAddress as Address).postalCode;
		countryCodeAlpha2: (billingAddress as Address).country;
	}
};
