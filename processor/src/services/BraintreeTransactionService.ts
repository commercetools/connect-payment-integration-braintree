import { CommercetoolsCartService, CommercetoolsPaymentService } from "@commercetools/connect-payments-sdk";
import braintree from "braintree";
import { getConfig } from "../dev-utils/getConfig";
import { appLogger } from "../libs/logger";
import { BraintreeTransactionServiceOptions } from "./types/transaction";

const config = getConfig();

export class BraintreeTransactionService {
	//@ts-expect-error - unused variable
	private ctCartService: CommercetoolsCartService;
	//@ts-expect-error - unused variable
	private ctPaymentService: CommercetoolsPaymentService;
	private braintreeGateway: braintree.BraintreeGateway;

	constructor(opts: BraintreeTransactionServiceOptions) {
		this.ctCartService = opts.ctCartService;
		this.ctPaymentService = opts.ctPaymentService;
		this.braintreeGateway = new braintree.BraintreeGateway({
			environment: braintree.Environment.Sandbox,
			merchantId: config.braintreeMerchantId,
			publicKey: config.braintreePublicKey,
			privateKey: config.braintreePrivateKey,
		});
	}

	/**
	 * Find transaction
	 *
	 * @remarks
	 * Implementation to find a Braintree transaction by ID
	 *
	 * @param transactionId - the ID of the transaction to be found
	 * @returns Promise with Braintree transaction with specified ID
	 */
	public async findTransaction(transactionId: string): Promise<braintree.Transaction> {
		const transaction = await this.braintreeGateway.transaction.find(transactionId);
		if (!transaction) {
			appLogger.info(
				{},
				`Error in BraintreeTransactionService findTransaction: transaction with ID ${transactionId} not found`,
			);
		}
		return transaction;
	}
}
