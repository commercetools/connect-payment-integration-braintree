import { Static } from '@sinclair/typebox';
import { StatusResponseSchema } from './StatusResponseSchema';

export type StatusResponseSchemaDTO = Static<typeof StatusResponseSchema>;
