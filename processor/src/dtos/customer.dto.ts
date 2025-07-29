import { Type, Static } from "@sinclair/typebox";
import { BraintreeCustomer } from "./basic-types";

export const CreateCustomerRequestSchema = BraintreeCustomer;

export type CreateCustomerRequestSchemaDTO = Static<typeof CreateCustomerRequestSchema>;

export const CreateCustomerResponseSchema = Type.Object({
	// addresses?: Address[] | undefined,
	// androidPayCards?: AndroidPayCard[] | undefined,
	// applePayCards?: ApplePayCard[] | undefined,
	company: Type.Optional(Type.String()),
	createdAt: Type.String(),
	// creditCards?: CreditCard[] | undefined,
	customFields: Type.Optional(Type.Any()),
	email: Type.Optional(Type.String()),
	fax: Type.Optional(Type.String()),
	firstName: Type.Optional(Type.String()),
	id: Type.String(),
	lastName: Type.Optional(Type.String()),
	// masterpassCards?: MasterpassCard[] | undefined,
	// paymentMethods?: PaymentMethod[] | undefined,
	// paypalAccounts?: PayPalAccount[] | undefined,
	phone: Type.Optional(Type.String()),
	// samsungPayCards?: SamsungPayCard[] | undefined,
	updatedAt: Type.String(),
	// venmoAccounts?: VenmoAccount[] | undefined,
	// visaCheckoutCards?: VisaCheckoutCard[] | undefined,
	website: Type.Optional(Type.String()),
});

export type CreateCustomerResponseSchemaDTO = Static<typeof CreateCustomerResponseSchema>;

export const GetCustomerResponseSchema = BraintreeCustomer;

export type GetCustomerResponseSchemaDTO = Static<typeof GetCustomerResponseSchema>;
