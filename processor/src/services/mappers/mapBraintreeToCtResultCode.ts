import { TransactionState } from "@commercetools/connect-payments-sdk";
import { TransactionStatus } from "braintree";

export const mapBraintreeToCtResultCode = function (
	resultCode: TransactionStatus,
	isActionRequired: boolean,
): TransactionState {
	//TODO check this is correct, currently based on the Ayden method and guessing
	switch (resultCode) {
		case "authorizing":
		case "settlement_pending":
		case "settling":
		case "submitted_for_settlement": {
			if (!isActionRequired) {
				return "Pending";
			} else {
				return "Initial";
			}
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
