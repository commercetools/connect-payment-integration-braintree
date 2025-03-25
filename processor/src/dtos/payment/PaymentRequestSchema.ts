import { Type } from '@sinclair/typebox';
import { PaymentOutcomeSchema } from './PaymentOutcomeSchema';
import { PaymentMethodType } from './PaymentMethodType';

export const PaymentRequestSchema = Type.Object({
  paymentMethod: Type.Object({
    type: Type.Enum(PaymentMethodType),
    poNumber: Type.Optional(Type.String()),
    invoiceMemo: Type.Optional(Type.String()),
  }),
  paymentOutcome: PaymentOutcomeSchema,
});
