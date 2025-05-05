import { Type } from '@sinclair/typebox';

const AddressSchema = Type.Object({
  company: Type.Optional(Type.String()),
  countryCodeAlpha2: Type.Optional(Type.String()),
  countryCodeAlpha3: Type.Optional(Type.String()),
  countryCodeNumeric: Type.Optional(Type.String()),
  countryName: Type.Optional(Type.String()),
  extendedAddress: Type.Optional(Type.String()),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  locality: Type.Optional(Type.String()),
  postalCode: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  streetAddress: Type.Optional(Type.String()),
});

const CreditCardCreateRequestSchema = Type.Object({
  billingAddress: Type.Optional(AddressSchema),
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

export const CreateCustomerRequestSchema = Type.Object({
  company: Type.Optional(Type.String()),
  creditCard: Type.Optional(CreditCardCreateRequestSchema),
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
