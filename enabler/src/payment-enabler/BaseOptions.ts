import type { BasePaymentSdk } from "../sdk";
import { type PaymentResult } from "./PaymentResult";

export type BaseOptions = {
  sdk: BasePaymentSdk;
  processorUrl: string;
  sessionId: string;
  environment: string;
  locale?: string;
  onComplete: (result: PaymentResult) => void;
  onError: (error?: any) => void;
};
