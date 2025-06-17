import { logger } from "../libs/logger";

export const wrapBraintreeError = (e: any): Error => {
	if (e?.responseBody) {
		const errorData = JSON.parse(e.responseBody);
		// TODO return better error
		return new Error(errorData, { cause: e });
	}

	logger.error("Unexpected error calling Braintree", e);
	return e;
};
