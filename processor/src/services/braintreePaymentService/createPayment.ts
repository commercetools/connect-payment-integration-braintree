import { ErrorInvalidOperation, TransactionState } from "@commercetools/connect-payments-sdk";
import { PaymentResponseSchemaDTO } from "../../dtos/payment";
import { getCartIdFromContext, getPaymentInterfaceFromContext } from "../../libs/fastify/context";
import { hasPaymentAmountChanged } from "../helpers";
import { CreatePaymentRequest } from "../types/payment";
import { BraintreePaymentService } from "../BraintreePaymentService";
import { wrapBraintreeError } from "../../errors";
import { mapBraintreeToCtResultCode, mapCtTotalPriceToBraintreeAmount } from "../mappers";
import { logger } from "../../libs/logger";

/**
 * Create payment
 *
 * @remarks
 * Implementation to provide the mocking data for payment creation in external PSPs
 *
 * @param request - contains paymentType defined in composable commerce
 * @returns Promise with mocking data containing operation status and PSP reference
 */
export const createPayment = async function (
	// TODO refactor briantreeGateway on BraintreePaymentService and change to AbstractPaymentService?
	this: BraintreePaymentService,
	request: CreatePaymentRequest,
): Promise<PaymentResponseSchemaDTO> {
	let ctCart = await this.ctCartService.getCart({ id: getCartIdFromContext() });
	let ctPayment = request.data.paymentReference
		? await this.ctPaymentService.updatePayment({
				id: request.data.paymentReference,
				paymentMethod: request.data.paymentMethodType,
			})
		: undefined;

	// If there's a payment reference
	if (ctPayment) {
		// TODO fix binding requirement
		if (await hasPaymentAmountChanged.bind(this)(ctCart, ctPayment)) {
			throw new ErrorInvalidOperation("The payment amount does not fulfill the remaining amount of the cart", {
				fields: {
					cartId: ctCart.id,
					paymentId: ctPayment.id,
				},
			});
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
			const prefix = ["soft_declined", "hard_declined"].includes(btResponse?.transaction?.processorResponseType)
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
};
