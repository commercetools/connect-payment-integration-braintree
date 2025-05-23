import { paymentSDK } from "../sdk/paymentSDK";
import { BraintreePaymentService } from "../services/BraintreePaymentService";

const paymentService = new BraintreePaymentService({
	ctCartService: paymentSDK.ctCartService,
	ctPaymentService: paymentSDK.ctPaymentService,
});

export const app = {
	services: {
		paymentService,
	},
};
