import braintree from "braintree";
import { type Transaction, type ValidatedResponse } from "braintree";
import { getConfig } from "../dev-utils/getConfig";
/**
 * Find customer
 *
 * @remarks
 * Implementation to find a Braintree customer by ID
 *
 * @param customerId - the ID of the customer to be found
 * @returns Promise with Braintree customer with specified ID
 */
export class BraintreeClient {
	private braintreeGateway: braintree.BraintreeGateway;
	private static instance: BraintreeClient;

	private constructor() {
		const config = getConfig();
		this.braintreeGateway = new braintree.BraintreeGateway({
			environment:
				config.braintreeEnvironment === "production"
					? braintree.Environment.Production
					: braintree.Environment.Sandbox,
			merchantId: config.braintreeMerchantId,
			publicKey: config.braintreePublicKey,
			privateKey: config.braintreePrivateKey,
		});
	}

	public static getInstance(): BraintreeClient {
		if (!BraintreeClient.instance) {
			BraintreeClient.instance = new BraintreeClient();
		}
		return BraintreeClient.instance;
	}

	public async refundPayment(interactionId: string): Promise<ValidatedResponse<Transaction>> {
		const refundResult: ValidatedResponse<Transaction> =
			await this.braintreeGateway.transaction.refund(interactionId);
		return refundResult;
	}
}
