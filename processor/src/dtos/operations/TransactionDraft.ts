import { Type } from '@sinclair/typebox';

export const TransactionDraft = Type.Object({
  cartId: Type.String({ format: 'uuid' }),
  paymentInterface: Type.String({ format: 'uuid' }),
  amount: Type.Optional(
    Type.Object({
      centAmount: Type.Number(),
      currencyCode: Type.String(),
    }),
  ),
  futureOrderNumber: Type.Optional(Type.String()),
});
