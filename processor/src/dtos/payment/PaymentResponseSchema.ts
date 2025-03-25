import { Type } from '@sinclair/typebox';

export const PaymentResponseSchema = Type.Object({
  paymentReference: Type.String(),
});
