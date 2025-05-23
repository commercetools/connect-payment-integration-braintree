import {
	type BaseOptions,
	type ComponentOptions,
	type PaymentComponent,
	type PaymentComponentBuilder,
} from "../../../payment-enabler";
import { BraintreeDropinContainer } from "./BraintreeDropinContainer";

export class BraintreeDropinContainerBuilder implements PaymentComponentBuilder {
	public componentHasSubmit = true;

	constructor(private baseOptions: BaseOptions) {}

	build(config: ComponentOptions): PaymentComponent {
		return new BraintreeDropinContainer(this.baseOptions, config);
	}
}
