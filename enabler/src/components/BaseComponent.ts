import {
	type BaseOptions,
	type ComponentOptions,
	type PaymentComponent,
	PaymentMethod,
	type PaymentResult,
} from "../payment-enabler";
import { BasePaymentSdk } from "../sdk";

export type ElementOptions = {
	paymentMethod: PaymentMethod;
};

/**
 * Base Web Component
 */
export abstract class BaseComponent implements PaymentComponent {
	protected paymentMethod: ElementOptions["paymentMethod"];
	protected sdk: BasePaymentSdk;
	protected processorUrl: BaseOptions["processorUrl"];
	protected sessionId: BaseOptions["sessionId"];
	protected environment: BaseOptions["environment"];
	protected onComplete: (result: PaymentResult) => void;
	protected onError: (error?: any) => void;

	constructor(
		paymentMethod: PaymentMethod,
		baseOptions: BaseOptions,
		_componentOptions: ComponentOptions,
	) {
		this.paymentMethod = paymentMethod;
		this.sdk = baseOptions.sdk;
		this.processorUrl = baseOptions.processorUrl;
		this.sessionId = baseOptions.sessionId;
		this.environment = baseOptions.environment;
		this.onComplete = baseOptions.onComplete;
		this.onError = baseOptions.onError;
	}

	abstract submit(): void;

	abstract mount(selector: string): void;

	showValidation?(): void;
	isValid?(): boolean;
	getState?(): {
		card?: {
			endDigits?: string;
			brand?: string;
			expiryDate?: string;
		};
	};
	isAvailable?(): Promise<boolean>;
}
