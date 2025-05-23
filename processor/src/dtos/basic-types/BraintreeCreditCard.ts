import { Type } from "@sinclair/typebox";
import { BraintreeAddress } from "./BraintreeAddress";

export const BraintreeCreditCard = Type.Object({
	billingAddress: Type.Optional(BraintreeAddress),
	billingAddressId: Type.Optional(Type.String()),
	cardholderName: Type.Optional(Type.String()),
	customerId: Type.String(),
	cvv: Type.Optional(Type.String()),
	expirationDate: Type.Optional(Type.String()),
	expirationMonth: Type.Optional(Type.String()),
	expirationYear: Type.Optional(Type.String()),
	number: Type.Optional(Type.String()),
	options: Type.Optional(
		Type.Object({
			failOnDuplicatePaymentMethod: Type.Optional(Type.Boolean()),
			makeDefault: Type.Optional(Type.Boolean()),
			verificationAmount: Type.Optional(Type.String()),
			verificationMerchantAccountId: Type.Optional(Type.String()),
			verifyCard: Type.Optional(Type.Boolean()),
		}),
	),
	paymentMethodNonce: Type.Optional(Type.String()),
	token: Type.Optional(Type.String()),
});
