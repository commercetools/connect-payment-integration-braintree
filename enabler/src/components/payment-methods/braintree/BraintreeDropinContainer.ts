import {
  type BaseOptions,
  type ComponentOptions,
  PaymentMethod,
} from "../../../payment-enabler";
import { BaseComponent } from "../../BaseComponent";
import { setupBraintreeDropin } from "../../../setupBraintreeDropin";

export class BraintreeDropinContainer extends BaseComponent {
  private showPayButton: boolean;

  constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
    super(PaymentMethod.card, baseOptions, componentOptions);
    this.showPayButton = componentOptions?.showPayButton ?? false;
  }

  mount(selector: string) {
    setupBraintreeDropin(selector, this.sessionId);
    if (this.showPayButton) {
      //TODO
    }
  }

  async submit() {
    // here we would call the SDK to submit the payment
    this.sdk.init({ environment: this.environment });
  }
}
