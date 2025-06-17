import {
	CancelPaymentRequest,
	CapturePaymentRequest,
	ConfigResponse,
	PaymentProviderModificationResponse,
	RefundPaymentRequest,
	StatusResponse,
} from "./types/operations";
import { AbstractPaymentService } from "./AbstractPaymentService";
import { SupportedPaymentComponentsSchemaDTO, TransactionDraftDTO, TransactionResponseDTO } from "../dtos/operations";
import { PaymentMethodType, PaymentResponseSchemaDTO } from "../dtos/payment";
import { BraintreePaymentServiceOptions } from "./types/payment/BraintreePaymentServiceOptions";
import { BraintreeInitResponse, CreatePaymentRequest } from "./types/payment";
import { BraintreeGateway, Environment } from "braintree";
import { getConfig } from "../dev-utils/getConfig";

const config = getConfig();

export class BraintreePaymentService extends AbstractPaymentService {
	private braintreeGateway: BraintreeGateway;

	constructor(opts: BraintreePaymentServiceOptions) {
		super(opts.ctCartService, opts.ctPaymentService);

		this.braintreeGateway = new BraintreeGateway({
			environment: Environment.Sandbox,
			merchantId: config.braintreeMerchantId,
			publicKey: config.braintreePublicKey,
			privateKey: config.braintreePrivateKey,
		});
	}

	/**
	 * Get configurations
	 *
	 * @remarks
	 * Implementation to provide mocking configuration information
	 *
	 * @returns Promise with mocking object containing configuration information
	 */
	public async config(): Promise<ConfigResponse> {
		throw new Error("Not yet implemented");
	}

	/**
	 * Initialize session
	 *
	 * @remarks
	 * Implementation to initialize Braintree payment session
	 *
	 * @returns Promise returning Braintree client token
	 */
	public async init(customerId?: string): Promise<BraintreeInitResponse> {
		try {
			const response = await this.braintreeGateway.clientToken.generate({
				customerId,
			});
			return { clientToken: response.clientToken };
		} catch (error) {
			console.error("Error in BraintreePaymentService init: ", error);
			throw error;
		}
	}

	/**
	 * Get status
	 *
	 * @remarks
	 * Implementation to provide mocking status of external systems
	 *
	 * @returns Promise with mocking data containing a list of status from different external systems
	 */
	public async status(): Promise<StatusResponse> {
		throw new Error("Not yet implemented");
	}

	/**
	 * Get supported payment components
	 *
	 * @remarks
	 * Implementation to provide the mocking payment components supported by the processor.
	 *
	 * @returns Promise with mocking data containing a list of supported payment components
	 */
	public async getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO> {
		return {
			dropins: [{ type: "embedded" }],
			components: [
				{
					type: PaymentMethodType.CARD,
				},
			],
		};
	}

	/**
	 * Create payment
	 *
	 * @remarks
	 * Implementation to provide the mocking data for payment creation in external PSPs
	 *
	 * @param request - contains paymentType defined in composable commerce
	 * @returns Promise with mocking data containing operation status and PSP reference
	 */
	public async createPayment(request: CreatePaymentRequest): Promise<PaymentResponseSchemaDTO> {
		throw new Error("Not yet implemented");
		try {
			const response = await this.braintreeGateway.transaction.sale({
				amount: request.data.amount,
				paymentMethodNonce: request.data.nonce,
				options: request.data.options,
			});
			if (response.success) {
				// TODO handle success
				response.transaction.
			} else {
				// TODO handle error
			}
		} catch (error) {
			// TODO handle error
		}
	}

	/**
	 * Capture payment
	 *
	 * @remarks
	 * Implementation to provide the mocking data for payment capture in external PSPs
	 *
	 * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
	 * @returns Promise with mocking data containing operation status and PSP reference
	 */
	public async capturePayment(
		// @ts-expect-error - unused parameter
		request: CapturePaymentRequest,
	): Promise<PaymentProviderModificationResponse> {
		throw new Error("Not yet implemented");
	}

	/**
	 * Cancel payment
	 *
	 * @remarks
	 * Implementation to provide the mocking data for payment cancel in external PSPs
	 *
	 * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
	 * @returns Promise with mocking data containing operation status and PSP reference
	 */
	public async cancelPayment(
		// @ts-expect-error - unused parameter
		request: CancelPaymentRequest,
	): Promise<PaymentProviderModificationResponse> {
		throw new Error("Not yet implemented");
	}

	/**
	 * Refund payment
	 *
	 * @remarks
	 * Implementation to provide the mocking data for payment refund in external PSPs
	 *
	 * @param request - contains amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
	 * @returns Promise with mocking data containing operation status and PSP reference
	 */
	public async refundPayment(
		// @ts-expect-error - unused parameter
		request: RefundPaymentRequest,
	): Promise<PaymentProviderModificationResponse> {
		throw new Error("Not yet implemented");
	}

	public async handleTransaction(
		// @ts-expect-error - unused parameter
		transactionDraft: TransactionDraftDTO,
	): Promise<TransactionResponseDTO> {
		throw new Error("Not yet implemented");
	}

	// @ts-expect-error - unused parameter
	private validatePaymentMethod(request: CreatePaymentRequest): void {
		throw new Error("Not yet implemented");
	}
}
