import { Type } from "@sinclair/typebox";

export const BraintreeInitRequestSchema = Type.Object({
	customerId: Type.Optional(Type.String()),
});
