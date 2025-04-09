import { Type } from '@sinclair/typebox';

export const BraintreeInitResponseSchema = Type.Object({
  clientToken: Type.String(),
});
