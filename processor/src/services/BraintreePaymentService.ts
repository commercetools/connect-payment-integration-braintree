import {
	CancelPaymentRequest,
	CapturePaymentRequest,
	ConfigResponse,
	PaymentProviderModificationResponse,
	RefundPaymentRequest,
	ReversePaymentRequest,
	StatusResponse,
} from "./types/operations";

import type { TransactionType } from "@commercetools/connect-payments-sdk";

import { AbstractPaymentService } from "./AbstractPaymentService";
import { SupportedPaymentComponentsSchemaDTO, TransactionDraftDTO, TransactionResponseDTO } from "../dtos/operations";
import { PaymentMethodType, CreatePaymentResponseSchemaDTO } from "../dtos/payment";
import { BraintreePaymentServiceOptions } from "./types/payment/BraintreePaymentServiceOptions";
import { BraintreeInitResponse, CreatePaymentRequest } from "./types/payment";
import { type ValidatedResponse, type Transaction } from "braintree";
import { logger } from "../libs/logger";
import { PaymentModificationStatus } from "../dtos/operations";
import type { AmountSchemaDTO } from "../dtos/operations";
import { ErrorInvalidOperation, TransactionState } from "@commercetools/connect-payments-sdk";
import { mapBraintreeToCtResultCode } from "./mappers/mapBraintreeToCtResultCode";
import { mapCtTotalPriceToBraintreeAmount } from "./mappers";
import { getCartIdFromContext, getPaymentInterfaceFromContext } from "../libs/fastify/context";
import { BraintreeClient } from "../clients/braintree.client";

export class BraintreePaymentService extends AbstractPaymentService {
	constructor(opts: BraintreePaymentServiceOptions) {
		super(opts.ctCartService, opts.ctPaymentService);
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
		const ctCart = await this.ctCartService.getCart({
			id: getCartIdFromContext(),
		});

		const amountPlanned = await this.ctCartService.getPlannedPaymentAmount({ cart: ctCart });
		const ctPayment = await this.ctPaymentService.createPayment({
			amountPlanned,
			paymentMethodInfo: {
				paymentInterface: getPaymentInterfaceFromContext() || "braintree",
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

		await this.ctCartService.addPayment({
			resource: {
				id: ctCart.id,
				version: ctCart.version,
			},
			paymentId: ctPayment.id,
		});
		const braintreeClient = BraintreeClient.getInstance();

		const response = await braintreeClient.initiateSession(customerId);
		return { clientToken: response.clientToken, paymentReference: ctPayment.id };
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
	public async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponseSchemaDTO> {
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

		const amount: string = mapCtTotalPriceToBraintreeAmount(ctCart.totalPrice);
		const nonce: string = request.data.nonce;

		let btResponse = await BraintreeClient.getInstance().createPayment(amount, nonce);

		const txState: TransactionState = mapBraintreeToCtResultCode(btResponse.transaction.status, btResponse.success);
		const updatedPayment = await this.ctPaymentService.updatePayment({
			id: ctPayment.id,
			pspReference: btResponse.transaction.id,
			transaction: {
				type: "Authorization",
				amount: ctPayment.amountPlanned,
				interactionId: btResponse.transaction.id,
				state: txState,
			},
		});

		logger.info(`Payment authorization processed.`, {
			paymentId: updatedPayment.id,
			interactionId: btResponse.transaction.id,
			result: btResponse.success,
			status: btResponse.transaction.status,
		});

		return {
			id: btResponse.transaction.id,
			success: btResponse.success,
			status: btResponse.transaction.status,
			additionalProcessorResponse: btResponse.transaction.additionalProcessorResponse,
			amount: btResponse.transaction.amount,
			paymentReference: updatedPayment.id,
			statusHistory:
				btResponse.transaction.statusHistory?.map((history: any) => ({
					amount: history.amount,
					status: history.status,
					timestamp: history.timestamp,
					transactionSource: history.transactionSource,
					user: history.user,
				})) ?? undefined,
		};
	}

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

	async cancelPayment(cancelPaymentRequest: CancelPaymentRequest): Promise<PaymentProviderModificationResponse> {
		const action = "cancelPayment";
		const transactionType = this.getPaymentTransactionType(action);
		logger.info(`Processing payment modification.`, {
			paymentId: cancelPaymentRequest.payment.id,
			action,
		});

		const response = await this.processPaymentModificationInternal({
			request: cancelPaymentRequest,
			transactionType,
			braintreeOperation: "cancel",
			amount: cancelPaymentRequest.payment.amountPlanned,
		});

		logger.info(`Payment modification completed.`, {
			paymentId: cancelPaymentRequest.payment.id,
			action,
			result: response.outcome,
		});
		return {
			outcome: response.outcome,
			pspReference: response.pspReference,
		};
	}

	async refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse> {
		const action = "refundPayment";
		logger.info(`Processing payment modification.`, {
			paymentId: request.payment.id,
			action,
		});

		const response = await this.processPaymentModificationInternal({
			request,
			transactionType: "Refund",
			braintreeOperation: "refund",
			amount: request.amount,
		});

		logger.info(`Payment modification completed.`, {
			paymentId: request.payment.id,
			action,
			result: response.outcome,
		});

		return response;
	}

	async reversePayment(request: ReversePaymentRequest): Promise<PaymentProviderModificationResponse> {
		logger.info(`Processing payment modification.`, {
			paymentId: request.payment.id,
			action: "reversePayment",
		});

		const transactionStateChecker = (transactionType: TransactionType, states: TransactionState[]) =>
			this.ctPaymentService.hasTransactionInState({ payment: request.payment, transactionType, states });

		const hasCharge = transactionStateChecker("Charge", ["Success"]);
		const hasAuthorization = transactionStateChecker("Authorization", ["Success"]);

		let response!: PaymentProviderModificationResponse;
		if (hasCharge) {
			response = await this.processPaymentModificationInternal({
				request,
				transactionType: "Refund",
				braintreeOperation: "reverse",
				amount: request.payment.amountPlanned,
			});
		} else if (hasAuthorization) {
			response = await this.processPaymentModificationInternal({
				request,
				transactionType: "CancelAuthorization",
				braintreeOperation: "reverse",
				amount: request.payment.amountPlanned,
			});
		} else {
			throw new ErrorInvalidOperation(`There is no successful payment transaction to reverse.`);
		}

		logger.info(`Payment modification completed.`, {
			paymentId: request.payment.id,
			action: "reversePayment",
			result: response.outcome,
		});

		return response;
	}

	// @ts-expect-error - unused parameter
	private validatePaymentMethod(request: CreatePaymentRequest): void {
		throw new Error("Not yet implemented");
	}

	private async makeCallToBraintreeInternal(
		interfaceId: string,
		transactionType: TransactionType,
		braintreeOperation: "capture" | "refund" | "cancel" | "reverse",
		// @ts-expect-error - unused parameter
		request: CapturePaymentRequest | CancelPaymentRequest | RefundPaymentRequest,
	): Promise<ValidatedResponse<Transaction>> {
		switch (braintreeOperation) {
			case "capture": {
				const braintreeClient = BraintreeClient.getInstance();
				return await braintreeClient.capturePayment(interfaceId);
			}
			case "refund": {
				const braintreeClient = BraintreeClient.getInstance();
				return await braintreeClient.refundPayment(interfaceId);
			}
			case "cancel": {
				const braintreeClient = BraintreeClient.getInstance();
				return await braintreeClient.cancelPayment(interfaceId);
			}
			case "reverse": {
				if (transactionType === "CancelAuthorization") {
					const braintreeClient = BraintreeClient.getInstance();
					return await braintreeClient.cancelPayment(interfaceId);
				} else {
					// transactionType === "Charge"
					const braintreeClient = BraintreeClient.getInstance();
					return await braintreeClient.refundPayment(interfaceId);
				}
			}
			default: {
				logger.error(
					`makeCallToBraintreeInternal: Operation ${braintreeOperation} not supported when modifying payment.`,
				);
				throw new ErrorInvalidOperation(`Operation not supported.`);
			}
		}
	}

	private async processPaymentModificationInternal(opts: {
		request: CapturePaymentRequest | CancelPaymentRequest | RefundPaymentRequest | ReversePaymentRequest;
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
		const response = await this.makeCallToBraintreeInternal(
			interfaceId,
			transactionType,
			braintreeOperation,
			request,
		);

		await this.ctPaymentService.updatePayment({
			id: request.payment.id,
			transaction: {
				type: transactionType,
				amount,
				interactionId: response.transaction.id,
				state: this.convertPaymentModificationOutcomeToState(
					response.success ? PaymentModificationStatus.APPROVED : PaymentModificationStatus.REJECTED,
				),
			},
		});
		const outcome = response.success ? PaymentModificationStatus.APPROVED : PaymentModificationStatus.REJECTED;
		return { outcome, pspReference: response.transaction.id };
	}
}
