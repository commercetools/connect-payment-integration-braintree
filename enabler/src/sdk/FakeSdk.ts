import { BasePaymentSdk, type BasePaymentSdkOptions } from "./BasePaymentSdk";

/**
 * Represents a fake SDK.
 */
export class FakeSdk extends BasePaymentSdk {
  /**
   * Creates an instance of FakeSdk.
   * @param environment - The environment for the SDK.
   */
  constructor(options: BasePaymentSdkOptions) {
    super(options);
    console.log("FakeSdk constructor", this.environment);
  }

  /**
   * Initializes the SDK with the specified options.
   * @param opts - The options for initializing the SDK.
   */
  init(opts: any) {
    console.log("FakeSdk init", opts);
  }
}
