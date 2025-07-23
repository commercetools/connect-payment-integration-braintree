import { Errorx, ErrorxAdditionalOpts } from "@commercetools/connect-payments-sdk";

export type BraintreeApiErrorData = {
	status: number;
	name?: string;
	message?: string;
	debug_id?: string | null;
};

export class BraintreeApiError extends Errorx {
	constructor(errorData: BraintreeApiErrorData, additionalOpts?: ErrorxAdditionalOpts) {
		super({
			code: `BraintreeError-${errorData.name}`,
			httpErrorStatus: errorData.status,
			message: errorData.message as string,
			...additionalOpts,
		});
	}
}
