import {
  BaseOptions,
  ComponentOptions,
  PaymentComponent,
  PaymentComponentBuilder,
} from "../../../payment-enabler";
import { Invoice } from "./Invoice";

export class InvoiceBuilder implements PaymentComponentBuilder {
  public componentHasSubmit = true;
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): PaymentComponent {
    return new Invoice(this.baseOptions, config);
  }
}
