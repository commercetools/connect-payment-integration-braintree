import { Type } from "@sinclair/typebox";

export const SupportedPaymentComponentsData = Type.Object({
	type: Type.String(),
	subtypes: Type.Optional(Type.Array(Type.String())),
});
