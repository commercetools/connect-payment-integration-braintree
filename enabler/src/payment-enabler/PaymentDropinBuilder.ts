import { DropinComponent } from "./DropinComponent";
import { DropinOptions } from "./DropinOptions";

/**
 * Represents the interface for a payment drop-in builder.
 */
export interface PaymentDropinBuilder {
  /**
   * Indicates whether the drop-in component has a submit action.
   */
  dropinHasSubmit: boolean;

  /**
   * Builds a drop-in component with the specified configuration.
   * @param config - The configuration options for the drop-in component.
   * @returns The built drop-in component.
   */
  build(config: DropinOptions): DropinComponent;
}
