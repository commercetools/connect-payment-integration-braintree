import { Type } from "@sinclair/typebox";
import { ErrorResponse } from "./ErrorResponse";

/**
 * Represents https://docs.commercetools.com/api/errors#autherrorresponse
 */
export const AuthErrorResponse = Type.Composite([
	ErrorResponse,
	Type.Object({
		error: Type.String(),
		error_description: Type.Optional(Type.String()),
	}),
]);
