import {
  BaseOptions,
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../../../payment-enabler";
import { Card } from "./Card";

export class CardBuilder implements PaymentComponentBuilder {
  public componentHasSubmit = true;

  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): PaymentComponent {
    return new Card(this.baseOptions, config);
  }
}
