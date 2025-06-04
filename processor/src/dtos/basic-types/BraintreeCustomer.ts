import { Type } from "@sinclair/typebox";
import { BraintreeCreditCard } from "./BraintreeCreditCard";

export const BraintreeCustomer = Type.Object({
	company: Type.Optional(Type.String()),
	creditCard: Type.Optional(BraintreeCreditCard),
	customFields: Type.Optional(Type.Any()),
	deviceData: Type.Optional(Type.String()),
	email: Type.Optional(Type.String()),
	fax: Type.Optional(Type.String()),
	firstName: Type.Optional(Type.String()),
	id: Type.Optional(Type.String()),
	lastName: Type.Optional(Type.String()),
	paymentMethodNonce: Type.Optional(Type.String()),
	phone: Type.Optional(Type.String()),
	riskData: Type.Optional(
		Type.Object({
			customerBrowser: Type.Optional(Type.String()),
			customerIp: Type.Optional(Type.String()),
		}),
	),
	website: Type.Optional(Type.String()),
});
