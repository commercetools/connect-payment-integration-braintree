import { PaymentModificationStatus } from "../../../dtos/operations";

export type PaymentProviderModificationResponse = {
	outcome: PaymentModificationStatus;
	pspReference: string;
};
