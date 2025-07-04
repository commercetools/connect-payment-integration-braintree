import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
	BraintreeInitRequestSchema,
	BraintreeInitRequestSchemaDTO,
	BraintreeInitResponseSchema,
	BraintreeInitResponseSchemaDTO,
	PaymentRequestSchema,
	PaymentRequestSchemaDTO,
	PaymentResponseSchema,
	PaymentResponseSchemaDTO,
} from "../dtos/payment";
import { BraintreePaymentService } from "../services/BraintreePaymentService";

type PaymentRoutesOptions = {
	paymentService: BraintreePaymentService;
	sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const braintreePaymentRoutes = async (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
	fastify.post<{
		Body: BraintreeInitRequestSchemaDTO;
		Reply: BraintreeInitResponseSchemaDTO;
	}>(
		"/init",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: BraintreeInitRequestSchema,
				response: {
					200: BraintreeInitResponseSchema,
				},
			},
		},
		async (request, reply) => {
			try {
				const response = await opts.paymentService.init(request.body.customerId);
				return reply.status(200).send(response);
			} catch (error) {
				console.error("Error in /init: ", error);
				return reply.code(500).send();
			}
		},
	);
	fastify.post<{
		Body: PaymentRequestSchemaDTO;
		Reply: PaymentResponseSchemaDTO;
	}>(
		"/payment",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: PaymentRequestSchema,
				response: {
					200: PaymentResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const response = await opts.paymentService.createPayment({
				data: request.body,
			});
			if (response.paymentReference) {
				return reply.status(200).send({
					paymentReference: response.paymentReference,
					id: response.id,
					additionalProcessorResponse: response.additionalProcessorResponse,
					amount: response.amount,
					status: response.status,
					statusHistory:
						response.statusHistory?.map((history) => ({
							amount: history.amount,
							status: history.status,
							timestamp: history.timestamp,
							transactionSource: history.transactionSource,
							user: history.user,
						})) ?? undefined,
				});
			} else {
				return reply.status(500).send();
			}
		},
	);
};
