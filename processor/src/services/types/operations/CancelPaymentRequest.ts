import { Payment } from '@commercetools/connect-payments-sdk/dist/commercetools';

export type CancelPaymentRequest = {
  payment: Payment;
  merchantReference?: string;
};
