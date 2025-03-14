import { DropinComponent, DropinOptions } from "../payment-enabler";

export class DropinComponents implements DropinComponent {
  private dropinOptions: DropinOptions;

  constructor(opts: { dropinOptions: DropinOptions }) {
    this.dropinOptions = opts.dropinOptions;
  }

  init(): void {
    this.dropinOptions.onDropinReady?.();
  }

  mount(selector: string) {
    document
      .querySelector(selector)
      .insertAdjacentHTML("afterbegin", "Dropin Embedded");
  }

  submit(): void {
    throw new Error("Implementation not provided");
  }
}
