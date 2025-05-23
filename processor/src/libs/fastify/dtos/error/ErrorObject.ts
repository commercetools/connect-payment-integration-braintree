import { Type } from "@sinclair/typebox";

/**
 * Represents https://docs.commercetools.com/api/errors#errorobject
 */
export const ErrorObject = Type.Object(
	{
		code: Type.String(),
		message: Type.String(),
	},
	{ additionalProperties: true },
);
