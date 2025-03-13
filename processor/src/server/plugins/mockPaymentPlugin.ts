import { FastifyInstance } from 'fastify';
import { paymentSDK } from '../../sdk/paymentSDK';
import { mockPaymentRoutes } from '../../routes/mockPaymentRoutes';
import { MockPaymentService } from '../../services/MockPaymentService';

export default async function (server: FastifyInstance) {
  const mockPaymentService = new MockPaymentService({
    ctCartService: paymentSDK.ctCartService,
    ctPaymentService: paymentSDK.ctPaymentService,
  });

  await server.register(mockPaymentRoutes, {
    paymentService: mockPaymentService,
    sessionHeaderAuthHook: paymentSDK.sessionHeaderAuthHookFn,
  });
}
