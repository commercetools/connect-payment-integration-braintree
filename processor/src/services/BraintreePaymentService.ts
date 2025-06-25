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
import { logger } from "../libs/logger";
import { PaymentModificationStatus } from "../dtos/operations";
import type { AmountSchemaDTO } from "../dtos/operations";
import { ErrorInvalidOperation, Errorx, TransactionState } from "@commercetools/connect-payments-sdk";
import { wrapBraintreeError } from "../errors";
import { mapBraintreeToCtResultCode } from "./mappers/mapBraintreeToCtResultCode";
import { mapCtTotalPriceToBraintreeAmount } from "./mappers";
import { getCartIdFromContext, getPaymentInterfaceFromContext } from "../libs/fastify/context";

const config = getConfig();

export class BraintreePaymentService extends AbstractPaymentService {
	protected braintreeGateway: BraintreeGateway;

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
		let ctCart = await this.ctCartService.getCart({ id: getCartIdFromContext() });
		let ctPayment = request.data.paymentReference
			? await this.ctPaymentService.updatePayment({
					id: request.data.paymentReference,
					paymentMethod: request.data.paymentMethodType,
				})
			: undefined;

		// If there's a payment reference
		if (ctPayment) {
			if (await this.hasPaymentAmountChanged(ctCart, ctPayment)) {
				throw new ErrorInvalidOperation(
					"The payment amount does not fulfill the remaining amount of the cart",
					{
						fields: {
							cartId: ctCart.id,
							paymentId: ctPayment.id,
						},
					},
				);
			}
		} else {
			// Else no payment reference
			const amountPlanned = await this.ctCartService.getPaymentAmount({ cart: ctCart });
			ctPayment = await this.ctPaymentService.createPayment({
				amountPlanned,
				paymentMethodInfo: {
					paymentInterface: getPaymentInterfaceFromContext() || "braintree",
					method: request.data.paymentMethodType,
				},
				...(ctCart.customerId && {
					customer: {
						typeId: "customer",
						id: ctCart.customerId,
					},
				}),
				...(!ctCart.customerId &&
					ctCart.anonymousId && {
						anonymousId: ctCart.anonymousId,
					}),
			});
			ctCart = await this.ctCartService.addPayment({
				resource: {
					id: ctCart.id,
					version: ctCart.version,
				},
				paymentId: ctPayment.id,
			});
		}

		let btResponse: braintree.ValidatedResponse<braintree.Transaction>;
		try {
			btResponse = await this.braintreeGateway.transaction.sale({
				amount: mapCtTotalPriceToBraintreeAmount(ctCart.totalPrice),
				paymentMethodNonce: request.data.nonce,
				options: request.data.options ?? { submitForSettlement: true },
			});
			if (!btResponse.success) {
				const prefix = ["soft_declined", "hard_declined"].includes(
					btResponse?.transaction?.processorResponseType,
				)
					? `[${btResponse.transaction.processorResponseType}] `
					: "";
				// TODO standardize errors
				throw new Error(`Error: 500. ${prefix}${btResponse.message}`);
			}
		} catch (error) {
			throw wrapBraintreeError(error);
		}

		const txState: TransactionState = mapBraintreeToCtResultCode(
			btResponse.transaction.status,
			btResponse.transaction.type !== undefined, // TODO check this, currently based loosely on Adyen isActionRequired method
		);

		const updatedPayment = await this.ctPaymentService.updatePayment({
			id: ctPayment.id,
			pspReference: btResponse.transaction.id,
			transaction: {
				type: "Authorization", //TODO: is there any case where this could be a direct charge?
				amount: ctPayment.amountPlanned,
				interactionId: btResponse.transaction.id,
				state: txState,
			},
		});

		logger.info(`Payment authorization processed.`, {
			paymentId: updatedPayment.id,
			interactionId: btResponse.transaction.id,
			result: btResponse.transaction.status,
		});

		return {
			...btResponse.transaction,
			paymentReference: updatedPayment.id,
			//TODO copied verbatim from Adyen, likely not needed for card transactions
			// ...(txState === "Success" || txState === "Pending"
			// 	? { merchantReturnUrl: this.buildRedirectMerchantUrl(updatedPayment.id, btResponse.transaction.status) }
			// 	: {}),
		};
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
	async capturePayment(capturePaymentRequest: CapturePaymentRequest): Promise<PaymentProviderModificationResponse> {
		const action = "capturePayment";
		const transactionType = this.getPaymentTransactionType(action);
		logger.info(`Processing payment modification.`, {
			paymentId: capturePaymentRequest.payment.id,
			action,
		});

		const response = await this.processPaymentModificationInternal({
			request: capturePaymentRequest,
			transactionType,
			braintreeOperation: "capture",
			amount: capturePaymentRequest.amount,
		});

		logger.info(`Payment modification completed.`, {
			paymentId: capturePaymentRequest.payment.id,
			action: "capturePayment",
			result: response.outcome,
		});

		return {
			outcome: response.outcome,
			pspReference: response.pspReference,
		};
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

	private async makeCallToBraintreeInternal(
		// @ts-expect-error - unused parameter
		interfaceId: string,
		braintreeOperation: "capture" | "refund" | "cancel" | "reverse",
		// @ts-expect-error - unused parameter
		request: CapturePaymentRequest | CancelPaymentRequest | RefundPaymentRequest,
	): Promise<PaymentProviderModificationResponse> {
		try {
			switch (braintreeOperation) {
				case "capture": {
					throw new Error("Not yet implemented");
				}
				case "refund": {
					throw new Error("Not yet implemented");
				}
				case "cancel": {
					throw new Error("Not yet implemented");
				}
				case "reverse": {
					throw new Error("Not yet implemented");
				}
				default: {
					logger.error(
						`makeCallToBraintreeInternal: Operation  ${braintreeOperation} not supported when modifying payment.`,
					);
					throw new ErrorInvalidOperation(`Operation not supported.`);
				}
			}
		} catch (e) {
			if (e instanceof Errorx) {
				throw e;
			} else {
				throw wrapBraintreeError(e);
			}
		}
	}

	private async processPaymentModificationInternal(opts: {
		request: CapturePaymentRequest | CancelPaymentRequest | RefundPaymentRequest;
		transactionType: "Charge" | "Refund" | "CancelAuthorization";
		braintreeOperation: "capture" | "refund" | "cancel" | "reverse";
		amount: AmountSchemaDTO;
	}): Promise<PaymentProviderModificationResponse> {
		const { request, transactionType, braintreeOperation, amount } = opts;
		await this.ctPaymentService.updatePayment({
			id: request.payment.id,
			transaction: {
				type: transactionType,
				amount,
				state: "Initial",
			},
		});

		const interfaceId = request.payment.interfaceId as string;

		const response = await this.makeCallToBraintreeInternal(interfaceId, braintreeOperation, request);

		await this.ctPaymentService.updatePayment({
			id: request.payment.id,
			transaction: {
				type: transactionType,
				amount,
				interactionId: response.pspReference,
				state: this.convertPaymentModificationOutcomeToState(PaymentModificationStatus.RECEIVED),
			},
		});

		return { outcome: PaymentModificationStatus.RECEIVED, pspReference: response.pspReference };
	}
}
