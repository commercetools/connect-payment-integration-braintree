import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../sdk/paymentSDK';
import { braintreeCustomerRoutes } from '../../routes/braintreeCustomerRoutes';
import { BraintreeCustomerService } from '../../services/BraintreeCustomerService';

export default async function (server: FastifyInstance) {
  const braintreeCustomerService = new BraintreeCustomerService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  });

  await server.register(braintreeCustomerRoutes, {
    prefix: '/customer',
    customerService: braintreeCustomerService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
  });
}
