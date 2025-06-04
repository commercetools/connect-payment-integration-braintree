import { Type } from "@sinclair/typebox";

const DropinType = Type.Enum({
	EMBEDDED: "embedded",
	HPP: "hpp",
});

export const SupportedPaymentDropinsData = Type.Object({
	type: DropinType,
});
