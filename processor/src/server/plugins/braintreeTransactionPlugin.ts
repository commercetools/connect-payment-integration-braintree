import { FastifyInstance } from "fastify";
import { paymentSDK } from "../../sdk/paymentSDK";
import { braintreeTransactionRoutes } from "../../routes/braintreeTransactionRoutes";
import { BraintreeTransactionService } from "../../services/BraintreeTransactionService";

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO remove before release, these routes (at least /find/:transactionId) shouldn't make it into production
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export default async function (server: FastifyInstance) {
	const braintreeTransactionService = new BraintreeTransactionService({
		ctCartService: paymentSDK.ctCartService,
		ctPaymentService: paymentSDK.ctPaymentService,
	});

	await server.register(braintreeTransactionRoutes, {
		prefix: "/transaction",
		transactionService: braintreeTransactionService,
		sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
	});
}
