import { Type } from '@sinclair/typebox';

export const BraintreeAddress = Type.Object({
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
