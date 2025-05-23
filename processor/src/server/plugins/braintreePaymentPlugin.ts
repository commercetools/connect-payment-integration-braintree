import { FastifyInstance } from "fastify";
import { paymentSDK } from "../../sdk/paymentSDK";
import { braintreePaymentRoutes } from "../../routes/braintreePaymentRoutes";
import { BraintreePaymentService } from "../../services/BraintreePaymentService";

export default async function (server: FastifyInstance) {
	const braintreePaymentService = new BraintreePaymentService({
		ctCartService: paymentSDK.ctCartService,
		ctPaymentService: paymentSDK.ctPaymentService,
	});

	await server.register(braintreePaymentRoutes, {
		paymentService: braintreePaymentService,
		sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
	});
}
