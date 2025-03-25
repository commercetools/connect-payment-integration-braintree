import {
  type BaseOptions,
  type DropinComponent,
  type DropinOptions,
  type PaymentDropinBuilder,
} from "../payment-enabler";
import { DropinComponents } from "./DropinComponents";

export class DropinEmbeddedBuilder implements PaymentDropinBuilder {
  public dropinHasSubmit = false;

  constructor(_baseOptions: BaseOptions) {}

  build(config: DropinOptions): DropinComponent {
    const dropin = new DropinComponents({
      dropinOptions: config,
    });

    dropin.init();
    return dropin;
  }
}
