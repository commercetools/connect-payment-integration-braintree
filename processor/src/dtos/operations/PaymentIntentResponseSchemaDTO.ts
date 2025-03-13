import { Static } from '@sinclair/typebox';
import { PaymentIntentResponseSchema } from './PaymentIntentRequestSchemaDTO';

export type PaymentIntentResponseSchemaDTO = Static<typeof PaymentIntentResponseSchema>;
