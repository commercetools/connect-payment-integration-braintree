import { Static } from '@sinclair/typebox';
import { PaymentIntentResponseSchema } from './PaymentIntentResponseSchema';

export type PaymentIntentResponseSchemaDTO = Static<typeof PaymentIntentResponseSchema>;
