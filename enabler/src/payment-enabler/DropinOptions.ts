/**
 * Represents the options for a drop-in component.
 */
export type DropinOptions = {
  /**
   * Indicates whether to show the pay button.
   **/
  showPayButton?: boolean;

  /**
   * A callback function that is called when the drop-in component is ready.
   * @returns A Promise indicating whether the drop-in component is ready.
   */
  onDropinReady?: () => Promise<void>;

  /**
   * A callback function that is called when the pay button is clicked.
   * @returns A Promise indicating whether the payment should proceed.
   */
  onPayButtonClick?: () => Promise<void>;
};
