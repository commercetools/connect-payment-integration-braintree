import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { BraintreeCustomerService } from "../services/braintree-customer.service";
import {
	CreateCustomerRequestSchema,
	CreateCustomerRequestSchemaDTO,
	CreateCustomerResponseSchema,
	CreateCustomerResponseSchemaDTO,
} from "../dtos/customer.dto";
import { Type } from "@sinclair/typebox";

type CustomerRoutesOptions = {
	customerService: BraintreeCustomerService;
	sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const braintreeCustomerRoutes = async (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions & CustomerRoutesOptions,
) => {
	fastify.post<{
		Body: CreateCustomerRequestSchemaDTO;
		Reply: CreateCustomerResponseSchemaDTO;
	}>(
		"/create",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: CreateCustomerRequestSchema,
				response: {
					200: CreateCustomerResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const response = await opts.customerService.createCustomer(request.body);
			return reply.status(200).send(response);
		},
	);
	fastify.get<{
		Params: { customerId: string };
		Reply: CreateCustomerResponseSchemaDTO;
	}>(
		"/find/:customerId",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				params: {
					$id: "paramsSchema",
					type: "object",
					properties: {
						customerId: Type.String(),
					},
					required: ["customerId"],
				},
				response: {
					200: CreateCustomerResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const response = await opts.customerService.findCustomer(request.params.customerId);
			return reply.status(200).send(response);
		},
	);
	fastify.delete<{ Params: { customerId: string } }>(
		"/delete/:customerId",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				params: {
					$id: "paramsSchema",
					type: "object",
					properties: {
						customerId: Type.String(),
					},
					required: ["customerId"],
				},
				response: {
					204: {
						description: "Successfully deleted customer",
					},
				},
			},
		},
		async (request, reply) => {
			await opts.customerService.deleteCustomer(request.params.customerId);
			return reply.status(204).send();
		},
	);
};
