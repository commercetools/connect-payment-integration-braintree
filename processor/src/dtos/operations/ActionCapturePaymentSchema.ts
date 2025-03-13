import { Type } from '@sinclair/typebox';
import { AmountSchema } from './AmountSchema';

export const ActionCapturePaymentSchema = Type.Composite([
  Type.Object({
    action: Type.Literal('capturePayment'),
  }),
  Type.Object({
    amount: AmountSchema,
    merchantReference: Type.Optional(Type.String()),
  }),
]);
