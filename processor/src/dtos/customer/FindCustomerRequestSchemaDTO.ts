import { Static } from '@sinclair/typebox';
import { FindCustomerRequestSchema } from './FindCustomerRequestSchema';

export type FindCustomerRequestSchemaDTO = Static<typeof FindCustomerRequestSchema>;
