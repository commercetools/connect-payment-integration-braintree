import { Errorx, ErrorxAdditionalOpts } from "@commercetools/connect-payments-sdk";

export type BraintreeApiErrorData = {
	status: number;
	name?: string;
	type?: string;
};

export class BraintreeApiError extends Errorx {
	constructor(errorData: BraintreeApiErrorData, additionalOpts?: ErrorxAdditionalOpts) {
		super({
			code: `BraintreeError-${errorData.name}`,
			httpErrorStatus: errorData.status,
			message: `error type : ${errorData.type}`,
			...additionalOpts,
		});
	}
}
