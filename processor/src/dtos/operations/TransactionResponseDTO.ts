import { Static } from "@sinclair/typebox";
import { TransactionResponse } from "./TransactionResponse";

export type TransactionResponseDTO = Static<typeof TransactionResponse>;
