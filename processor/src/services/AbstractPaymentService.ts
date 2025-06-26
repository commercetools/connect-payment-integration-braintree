import {
	Cart,
	CommercetoolsCartService,
	CommercetoolsPaymentService,
	ErrorInvalidJsonInput,
	ErrorInvalidOperation,
	Payment,
} from "@commercetools/connect-payments-sdk";
import {
	CancelPaymentRequest,
	CapturePaymentRequest,
	ConfigResponse,
	ModifyPayment,
	PaymentProviderModificationResponse,
	RefundPaymentRequest,
	StatusResponse,
} from "./types/operations";
import {
	SupportedPaymentComponentsSchemaDTO,
	TransactionDraftDTO,
	TransactionResponseDTO,
	AmountSchemaDTO,
	PaymentModificationStatus,
} from "../dtos/operations";

import { logger } from "../libs/logger";
import { PaymentTransactionTypes } from "./types/operations/PaymentTransactionTypes";

export abstract class AbstractPaymentService {
	protected ctCartService: CommercetoolsCartService;
	protected ctPaymentService: CommercetoolsPaymentService;

	protected constructor(ctCartService: CommercetoolsCartService, ctPaymentService: CommercetoolsPaymentService) {
		this.ctCartService = ctCartService;
		this.ctPaymentService = ctPaymentService;
	}

	/**
	 * Get configurations
	 *
	 * @remarks
	 * Abstract method to get configuration information
	 *
	 * @returns Promise with object containing configuration information
	 */
	abstract config(): Promise<ConfigResponse>;

	/**
	 * Get status
	 *
	 * @remarks
	 * Abstract method to get status of external systems
	 *
	 * @returns Promise with a list of status from different external systems
	 */
	abstract status(): Promise<StatusResponse>;

	/**
	 * Get supported payment components
	 *
	 * @remarks
	 * Abstract method to fetch the supported payment components by the processor. The actual invocation should be implemented in subclasses
	 *
	 * @returns Promise with a list of supported payment components
	 */
	abstract getSupportedPaymentComponents(): Promise<SupportedPaymentComponentsSchemaDTO>;

	/**
	 * Capture payment
	 *
	 * @remarks
	 * Abstract method to execute payment capture in external PSPs. The actual invocation to PSPs should be implemented in subclasses
	 *
	 * @param request - contains the amount and {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
	 * @returns Promise with the outcome containing operation status and PSP reference
	 */
	abstract capturePayment(request: CapturePaymentRequest): Promise<PaymentProviderModificationResponse>;

	/**
	 * Cancel payment
	 *
	 * @remarks
	 * Abstract method to execute payment cancel in external PSPs. The actual invocation to PSPs should be implemented in subclasses
	 *
	 * @param request - contains {@link https://docs.commercetools.com/api/projects/payments | Payment } defined in composable commerce
	 * @returns Promise with outcome containing operation status and PSP reference
	 */
	abstract cancelPayment(request: CancelPaymentRequest): Promise<PaymentProviderModificationResponse>;

	/**
	 * Refund payment
	 *
	 * @remarks
	 * Abstract method to execute payment refund in external PSPs. The actual invocation to PSPs should be implemented in subclasses
	 *
	 * @param request
	 * @returns Promise with outcome containing operation status and PSP reference
	 */
	abstract refundPayment(request: RefundPaymentRequest): Promise<PaymentProviderModificationResponse>;

	/**
	 * Handle the payment transaction request. It will create a new Payment in CoCo and associate it with the provided cartId. If no amount is given it will use the full cart amount.
	 *
	 * @remarks
	 * Abstract method to handle payment transaction requests. The actual invocation to PSPs should be implemented in subclasses
	 *
	 * @param transactionDraft the incoming request payload
	 * @returns Promise with the created Payment and whether or not it was a success or not
	 */
	abstract handleTransaction(transactionDraft: TransactionDraftDTO): Promise<TransactionResponseDTO>;

	/**
	 * Modify payment
	 *
	 * @remarks
	 * This method is used to execute Capture/Cancel/Refund payment in external PSPs and update composable commerce. The actual invocation to PSPs should be implemented in subclasses
	 *
	 * @param opts - input for payment modification including payment ID, action and payment amount
	 * @returns Promise with outcome of payment modification after invocation to PSPs
	 */
	public async modifyPayment(opts: ModifyPayment): Promise<PaymentProviderModificationResponse> {
		const ctPayment = await this.ctPaymentService.getPayment({
			id: opts.paymentId,
		});
		const request = opts.data.actions[0]!;
		const action = request.action;

		switch (action) {
			case "cancelPayment": {
				// TODO : execute cancel payment
				logger.error(`Operation not supported when modifying payment.`);
				throw new ErrorInvalidOperation(`Operation not supported.`);
			}
			case "capturePayment": {
				return await this.capturePayment({
					payment: ctPayment,
					merchantReference: request.merchantReference,
					amount: request.amount,
				});
			}
			case "refundPayment": {
				return await this.refundPayment({
					payment: ctPayment,
					merchantReference: request.merchantReference,
					amount: request.amount,
				});
			}
			default: {
				logger.error(`Operation not supported when modifying payment.`);
				throw new ErrorInvalidOperation(`Operation not supported.`);
			}
		}
	}

	protected convertPaymentModificationOutcomeToState(
		outcome: PaymentModificationStatus,
	): "Pending" | "Success" | "Failure" {
		if (outcome === PaymentModificationStatus.RECEIVED) {
			return "Pending";
		} else if (outcome === PaymentModificationStatus.APPROVED) {
			return "Success";
		} else {
			return "Failure";
		}
	}

	protected getPaymentTransactionType(action: string): PaymentTransactionTypes {
		switch (action) {
			case "cancelPayment": {
				return "CancelAuthorization";
			}
			case "capturePayment": {
				return "Charge";
			}
			case "refundPayment": {
				return "Refund";
			}
			// TODO: Handle Error case
			default: {
				throw new ErrorInvalidJsonInput(`Request body does not contain valid JSON.`);
			}
		}
	}

	protected async processPaymentModification(
		payment: Payment,
		transactionType: string,
		requestAmount: AmountSchemaDTO,
		merchantReference?: string,
	) {
		switch (transactionType) {
			case "CancelAuthorization": {
				return await this.cancelPayment({ payment, merchantReference });
			}
			case "Charge": {
				return await this.capturePayment({
					amount: requestAmount,
					payment,
					merchantReference,
				});
			}
			case "Refund": {
				return await this.refundPayment({
					amount: requestAmount,
					payment,
					merchantReference,
				});
			}
			default: {
				throw new ErrorInvalidOperation(`Operation ${transactionType} not supported.`);
			}
		}
	}

	protected async hasPaymentAmountChanged(cart: Cart, ctPayment: Payment): Promise<boolean> {
		const amountPlanned = await this.ctCartService.getPaymentAmount({ cart });
		return (
			ctPayment.amountPlanned.centAmount !== amountPlanned.centAmount ||
			ctPayment.amountPlanned.currencyCode !== amountPlanned.currencyCode
		);
	}
}
