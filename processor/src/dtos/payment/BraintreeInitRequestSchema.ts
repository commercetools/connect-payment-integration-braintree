import { Type } from '@sinclair/typebox';

export const BraintreeInitRequestSchema = Type.Object({
  customerId: Type.String(),
});
