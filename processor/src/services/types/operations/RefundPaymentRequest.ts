import { AmountSchemaDTO } from '../../../dtos/operations';
import { Payment } from '@commercetools/connect-payments-sdk/dist/commercetools';

export type RefundPaymentRequest = {
  amount: AmountSchemaDTO;
  payment: Payment;
  merchantReference?: string;
};
