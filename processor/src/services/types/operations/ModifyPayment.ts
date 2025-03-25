import { PaymentIntentRequestSchemaDTO } from '../../../dtos/operations';

export type ModifyPayment = {
  paymentId: string;
  data: PaymentIntentRequestSchemaDTO;
};
