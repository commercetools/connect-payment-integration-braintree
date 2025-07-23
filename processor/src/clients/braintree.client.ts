import braintree, { type ClientToken, type Transaction, type ValidatedResponse } from "braintree";
import { getConfig } from "../dev-utils/getConfig";
import { logger } from "../libs/logger";
import { BraintreeApiError, BraintreeApiErrorData } from "../errors/braintree-api.error";

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

	public async initiateSession(customerId?: string): Promise<ValidatedResponse<ClientToken>> {
		try {
			const response = await this.braintreeGateway.clientToken.generate({
				customerId,
			});
			return response;
		} catch (e: any) {
			logger.error(`Error generating Braintree client token.`, {
				error: e,
			});
			const errorData: BraintreeApiErrorData = {
				status: 500,
				name: e?.name,
				type: e?.type,
			};
			throw new BraintreeApiError(errorData, {
				privateMessage: "Braintree client token generation failed.",
				cause: e,
			});
		}
	}

	public async createPayment(amount: string, nonce: string): Promise<ValidatedResponse<Transaction>> {
		let btResponse: braintree.ValidatedResponse<braintree.Transaction>;
		try {
			btResponse = await this.braintreeGateway.transaction.sale({
				amount,
				paymentMethodNonce: nonce,
				options: { submitForSettlement: false },
			});
			return btResponse;
			// if (!btResponse.success) {
			// 	const message = `Braintree transaction failed with status [${btResponse.transaction.status}] and message [${btResponse.message}]`;
			// 	logger.error(message, {
			// 		transactionId: btResponse.transaction.id,
			// 		status: btResponse.transaction.status,
			// 	});
			// 	throw new Errorx(message, {
			// 		fields: {
			// 			transactionId: btResponse.transaction.id,
			// 			status: btResponse.transaction.status,
			// 		},
			// 	});
			// }
		} catch (e: any) {
			logger.error(`Error creating Braintree transaction.`, {
				error: e,
			});
			const errorData: BraintreeApiErrorData = {
				status: 500,
				name: e?.name,
				type: e?.type,
			};
			throw new BraintreeApiError(errorData, {
				privateMessage: "Error creating Braintree transaction.",
				cause: e,
			});
		}
	}

	public async refundPayment(interactionId: string): Promise<ValidatedResponse<Transaction>> {
		try {
			const refundResult: ValidatedResponse<Transaction> =
				await this.braintreeGateway.transaction.refund(interactionId);
			return refundResult;
		} catch (e: any) {
			logger.error(`Error processing Braintree refund payment for transaction [${interactionId}].`, {
				error: e,
			});
			const errorData: BraintreeApiErrorData = {
				status: 500,
				name: e?.name,
				type: e?.type,
			};
			throw new BraintreeApiError(errorData, {
				privateMessage: "Error refund Braintree transaction.",
				cause: e,
			});
		}
	}

	public async cancelPayment(interactionId: string): Promise<ValidatedResponse<Transaction>> {
		try {
			const cancelResult: ValidatedResponse<Transaction> =
				await this.braintreeGateway.transaction.void(interactionId);
			return cancelResult;
		} catch (e: any) {
			logger.error(`Error processing Braintree cancel payment for transaction [${interactionId}].`, {
				error: e,
			});
			const errorData: BraintreeApiErrorData = {
				status: 500,
				name: e?.name,
				type: e?.type,
			};
			throw new BraintreeApiError(errorData, {
				privateMessage: "Error cancel Braintree transaction.",
				cause: e,
			});
		}
	}

	public async capturePayment(interactionId: string): Promise<ValidatedResponse<Transaction>> {
		try {
			const captureResult: ValidatedResponse<Transaction> =
				await this.braintreeGateway.transaction.submitForSettlement(interactionId);
			return captureResult;
		} catch (e: any) {
			logger.error(`Error processing Braintree capture payment for transaction [${interactionId}].`, {
				error: e,
			});
			const errorData: BraintreeApiErrorData = {
				status: 500,
				name: e?.name,
				type: e?.type,
			};
			throw new BraintreeApiError(errorData, {
				privateMessage: "Error capture Braintree transaction.",
				cause: e,
			});
		}
	}
}
