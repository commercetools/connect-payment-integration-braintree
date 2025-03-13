import { paymentSDK } from '../sdk/paymentSDK';
import { MockPaymentService } from '../services/MockPaymentService';

const paymentService = new MockPaymentService({
  ctCartService: paymentSDK.ctCartService,
  ctPaymentService: paymentSDK.ctPaymentService,
});

export const app = {
  services: {
    paymentService,
  },
};
