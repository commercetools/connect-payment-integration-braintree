import { Type } from '@sinclair/typebox';
import { ErrorObject } from './ErrorObject';

/**
 * Represents https://docs.commercetools.com/api/errors#errorresponse
 */
export const ErrorResponse = Type.Object({
  statusCode: Type.Integer(),
  message: Type.String(),
  errors: Type.Array(ErrorObject),
});
