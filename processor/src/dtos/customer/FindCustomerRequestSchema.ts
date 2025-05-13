import { Type } from "@sinclair/typebox";

export const FindCustomerRequestSchema = Type.Object({
	customerId: Type.String(),
});
