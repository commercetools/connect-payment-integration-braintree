import { CommercetoolsCartService, CommercetoolsPaymentService } from "@commercetools/connect-payments-sdk";

export type BraintreeTransactionServiceOptions = {
	ctCartService: CommercetoolsCartService;
	ctPaymentService: CommercetoolsPaymentService;
};
