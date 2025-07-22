import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import {
	BraintreeInitRequestSchema,
	BraintreeInitRequestSchemaDTO,
	BraintreeInitResponseSchema,
	BraintreeInitResponseSchemaDTO,
	PaymentRequestSchema,
	PaymentRequestSchemaDTO,
	CreatePaymentResponseSchema,
	CreatePaymentResponseSchemaDTO,
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
			const response = await opts.paymentService.init(request.body.customerId);
			return reply.status(200).send(response);
		},
	);
	fastify.post<{
		Body: PaymentRequestSchemaDTO;
		Reply: CreatePaymentResponseSchemaDTO;
	}>(
		"/payment",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: PaymentRequestSchema,
				response: {
					200: CreatePaymentResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const response = await opts.paymentService.createPayment({
				data: request.body,
			});
			if (response.paymentReference) {
				return reply.status(200).send(response);
			} else {
				return reply.status(500).send();
			}
		},
	);
};
