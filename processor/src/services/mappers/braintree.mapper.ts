import { TransactionState } from "@commercetools/connect-payments-sdk";
import { TransactionStatus } from "braintree";

type CentPrecisionMoney = {
	/**
	 *	Amount in the smallest indivisible unit of a currency, such as:
	 *
	 *	* Cents for EUR and USD, pence for GBP, or centime for CHF (5 CHF is specified as `500`).
	 *	* The value in the major unit for currencies without minor units, like JPY (5 JPY is specified as `5`).
	 *
	 *
	 */
	readonly centAmount: number;
	/**
	 *	The number of default fraction digits for the given currency, like `2` for EUR or `0` for JPY.
	 *
	 *
	 */
	readonly fractionDigits: number;
};

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

export const mapCtTotalPriceToBraintreeAmount = (totalPrice: CentPrecisionMoney): string => {
	if (totalPrice.centAmount <= 0 || totalPrice.centAmount.toString().indexOf(".") !== -1) {
		throw new Error(
			`Payment cent amount must be a positive integer above zero, received ${totalPrice.centAmount}.`,
		);
	}
	if (totalPrice.fractionDigits === 0) {
		return totalPrice.centAmount.toString();
	}
	return (totalPrice.centAmount / Math.pow(10, totalPrice.fractionDigits)).toString();
};
