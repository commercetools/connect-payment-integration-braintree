import { BraintreeInitResponseSchemaDTO, PaymentRequestSchemaDTO } from "../../dtos/payment";
import { CommercetoolsCartService, CommercetoolsPaymentService } from "@commercetools/connect-payments-sdk";

export type CreatePaymentRequest = {
	data: PaymentRequestSchemaDTO;
};

export type BraintreeInitResponse = BraintreeInitResponseSchemaDTO;

export type BraintreePaymentServiceOptions = {
	ctCartService: CommercetoolsCartService;
	ctPaymentService: CommercetoolsPaymentService;
};

export type BraintreeTransactionServiceOptions = {
	ctCartService: CommercetoolsCartService;
	ctPaymentService: CommercetoolsPaymentService;
};
