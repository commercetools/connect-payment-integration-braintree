import { FakeSdk } from "../FakeSdk";
import { PaymentResult } from "./PaymentResult";

export type BaseOptions = {
  sdk: FakeSdk;
  processorUrl: string;
  sessionId: string;
  environment: string;
  locale?: string;
  onComplete: (result: PaymentResult) => void;
  onError: (error?: any) => void;
};
