import {
	type BaseOptions,
	type ComponentOptions,
	type PaymentComponent,
	type PaymentDropinBuilder,
} from "../../../payment-enabler";
import { BraintreeDropinContainer } from "./BraintreeDropinContainer";

export class BraintreeDropinContainerBuilder implements PaymentDropinBuilder {
	public dropinHasSubmit = true;

	constructor(private baseOptions: BaseOptions) {}

	build(config: ComponentOptions): PaymentComponent {
		return new BraintreeDropinContainer(this.baseOptions, config);
	}
}
