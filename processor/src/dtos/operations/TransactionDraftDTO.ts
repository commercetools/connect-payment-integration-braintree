import { Static } from '@sinclair/typebox';
import { TransactionDraft } from './TransactionDraft';

export type TransactionDraftDTO = Static<typeof TransactionDraft>;
