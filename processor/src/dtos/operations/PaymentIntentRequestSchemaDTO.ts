import { Static } from '@sinclair/typebox';
import { PaymentIntentRequestSchema } from './PaymentIntentResponseSchema';

export type PaymentIntentRequestSchemaDTO = Static<typeof PaymentIntentRequestSchema>;
