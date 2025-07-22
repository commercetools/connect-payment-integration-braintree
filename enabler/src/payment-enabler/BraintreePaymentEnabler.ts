import { type PaymentEnabler } from "./PaymentEnabler";
import { type BaseOptions } from "./BaseOptions";
import { type EnablerOptions } from "./EnablerOptions";
import { type PaymentComponentBuilder } from "./PaymentComponentBuilder";
import { CardBuilder } from "../components/payment-methods/card";
import { client } from "braintree-web";
import type { Client } from "braintree-web";

export class BraintreePaymentEnabler implements PaymentEnabler {
	setupData: Promise<{ baseOptions: BaseOptions }>;

	constructor(options: EnablerOptions) {
		this.setupData = BraintreePaymentEnabler._Setup(options);
	}

	private static getBraintreeToken = async (
		options: EnablerOptions,
	): Promise<{ clientToken: string; paymentReference: string }> => {
		let response!: Response;
		try {
			response = await fetch(`${options.processorUrl}/init`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Session-Id": options.sessionId,
				},
				body: JSON.stringify({}),
			});
		} catch (error) {
			console.log("error: ", error);
			console.log("response: ", response);
		}

		const initResponse: { clientToken: string; paymentReference: string } = await response.json();
		return { clientToken: initResponse.clientToken, paymentReference: initResponse.paymentReference };
	};

	private static _Setup = async (options: EnablerOptions): Promise<{ baseOptions: BaseOptions }> => {
		const { clientToken, paymentReference } = await BraintreePaymentEnabler.getBraintreeToken(options);

		const sdkOptions = {
			environment: "test",
		};

		const braintreeClient: Client = await client.create({
			authorization: clientToken,
		});

		return {
			baseOptions: {
				sdk: braintreeClient,
				processorUrl: options.processorUrl,
				sessionId: options.sessionId,
				environment: sdkOptions.environment,
				paymentReference,
				onComplete: options.onComplete || (() => {}),
				onError: options.onError || (() => {}),
			},
		};
	};

	async createComponentBuilder(type: string): Promise<PaymentComponentBuilder | never> {
		const { baseOptions } = await this.setupData;

		const supportedMethods = {
			card: CardBuilder,
		};

		if (!Object.keys(supportedMethods).includes(type)) {
			throw new Error(
				`Component type not supported: ${type}. Supported types: ${Object.keys(supportedMethods).join(", ")}`,
			);
		}

		return new supportedMethods[type as keyof typeof supportedMethods](baseOptions);
	}
}
