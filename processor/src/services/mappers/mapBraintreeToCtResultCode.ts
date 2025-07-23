import { TransactionState } from "@commercetools/connect-payments-sdk";
import { TransactionStatus } from "braintree";

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
