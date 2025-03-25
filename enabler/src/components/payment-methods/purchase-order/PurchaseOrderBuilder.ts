import {
  type BaseOptions,
  type ComponentOptions,
  type PaymentComponent,
  type PaymentComponentBuilder,
} from "../../../payment-enabler";
import { PurchaseOrder } from "./PurchaseOrder";

export class PurchaseOrderBuilder implements PaymentComponentBuilder {
  public componentHasSubmit = true;
  constructor(private baseOptions: BaseOptions) {}

  build(config: ComponentOptions): PaymentComponent {
    return new PurchaseOrder(this.baseOptions, config);
  }
}
