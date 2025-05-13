import { Type } from "@sinclair/typebox";
import { PaymentOutcome } from "./PaymentOutcome";

export const PaymentOutcomeSchema = Type.Enum(PaymentOutcome);
