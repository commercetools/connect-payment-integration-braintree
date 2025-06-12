import { type PaymentEnabler } from "./PaymentEnabler";
import { type BaseOptions } from "./BaseOptions";
import { DropinType } from "./DropinType";
import { type EnablerOptions } from "./EnablerOptions";
import { type PaymentComponentBuilder } from "./PaymentComponentBuilder";
import { type PaymentDropinBuilder } from "./PaymentDropinBuilder";
import { BraintreeSdk } from "../sdk";
import { BraintreeDropinContainerBuilder } from "../dropin";

export class BraintreePaymentEnabler implements PaymentEnabler {
	setupData: Promise<{ baseOptions: BaseOptions }>;

	constructor(options: EnablerOptions) {
		this.setupData = BraintreePaymentEnabler._Setup(options);
	}

	private static _Setup = async (options: EnablerOptions): Promise<{ baseOptions: BaseOptions }> => {
		// Fetch SDK config from processor if needed, for example:

		// const configResponse = await fetch(instance.processorUrl + '/config', {
		//   method: 'GET',
		//   headers: { 'Content-Type': 'application/json', 'X-Session-Id': options.sessionId },
		// });

		// const configJson = await configResponse.json();

		const sdkOptions = {
			// environment: configJson.environment,
			environment: "test",
		};

		return {
			baseOptions: {
				sdk: new BraintreeSdk(sdkOptions),
				processorUrl: options.processorUrl,
				sessionId: options.sessionId,
				environment: sdkOptions.environment,
				onComplete: options.onComplete || (() => {}),
				onError: options.onError || (() => {}),
			},
		};
	};

	async createComponentBuilder(type: string): Promise<PaymentComponentBuilder | never> {
		// @ts-expect-error - unused variable
		const { baseOptions } = await this.setupData;

		const supportedMethods = {
			// 	card: TODO
		};

		// if (!Object.keys(supportedMethods).includes(type)) {
		throw new Error(
			`Component type not supported: ${type}. Supported types: ${Object.keys(supportedMethods).join(", ")}`,
		);
		// }

		// return new supportedMethods[
		// 	type as keyof typeof supportedMethods
		// ](baseOptions);
	}

	async createDropinBuilder(type: DropinType): Promise<PaymentDropinBuilder | never> {
		const { baseOptions } = await this.setupData;

		const supportedMethods = {
			embedded: BraintreeDropinContainerBuilder,
			// hpp: DropinHppBuilder,
		};

		if (!Object.keys(supportedMethods).includes(type)) {
			throw new Error(
				`Component type not supported: ${type}. Supported types: ${Object.keys(supportedMethods).join(", ")}`,
			);
		}

		// @ts-expect-error - DropinType.hpp currently not supported
		return new supportedMethods[type](baseOptions);
	}
}
