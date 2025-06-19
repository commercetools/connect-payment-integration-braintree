import { Type } from "@sinclair/typebox";

export const BraintreeTransaction = Type.Object({
	additionalProcessorResponse: Type.String(),
	amount: Type.String(),
	//TODO COMPLETE TRANSATION FROM processor\node_modules\@types\braintree\index.d.ts
});
