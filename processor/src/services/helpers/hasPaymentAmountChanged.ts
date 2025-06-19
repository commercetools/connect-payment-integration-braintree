import { Cart, Payment } from "@commercetools/connect-payments-sdk";
import { AbstractPaymentService } from "../AbstractPaymentService";

export const hasPaymentAmountChanged = async function (
	this: AbstractPaymentService,
	cart: Cart,
	ctPayment: Payment,
): Promise<boolean> {
	const amountPlanned = await this.ctCartService.getPaymentAmount({ cart });
	return (
		ctPayment.amountPlanned.centAmount !== amountPlanned.centAmount ||
		ctPayment.amountPlanned.currencyCode !== amountPlanned.currencyCode
	);
};
