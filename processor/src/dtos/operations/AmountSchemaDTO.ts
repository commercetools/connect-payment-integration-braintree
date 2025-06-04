import { Static } from "@sinclair/typebox";
import { AmountSchema } from "./AmountSchema";

export type AmountSchemaDTO = Static<typeof AmountSchema>;
