import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { BraintreeCustomerService } from "../services/BraintreeCustomerService";
import {
	CreateCustomerRequestSchema,
	CreateCustomerRequestSchemaDTO,
	CreateCustomerResponseSchema,
	CreateCustomerResponseSchemaDTO,
	DeleteCustomerRequestSchema,
	DeleteCustomerRequestSchemaDTO,
	FindCustomerRequestSchema,
	FindCustomerRequestSchemaDTO,
	FindCustomerResponseSchema,
	FindCustomerResponseSchemaDTO,
} from "../dtos/customer";

type PaymentRoutesOptions = {
	customerService: BraintreeCustomerService;
	sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const braintreeCustomerRoutes = async (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions & PaymentRoutesOptions,
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
			try {
				const response = await opts.customerService.createCustomer(
					request.body,
				);
				return reply.status(200).send(response);
			} catch (error) {
				console.error("Error in create customer: ", error);
				return reply.code(500).send();
			}
		},
	);
	fastify.post<{
		Body: FindCustomerRequestSchemaDTO;
		Reply: FindCustomerResponseSchemaDTO;
	}>(
		"/find",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: FindCustomerRequestSchema,
				response: {
					200: FindCustomerResponseSchema,
				},
			},
		},
		async (request, reply) => {
			try {
				const response = await opts.customerService.findCustomer(
					request.body.customerId,
				);
				return reply.status(200).send(response);
			} catch (error) {
				console.error("Error in find customer: ", error);
				return reply.code(500).send();
			}
		},
	);
	fastify.post<{ Body: DeleteCustomerRequestSchemaDTO }>(
		"/delete",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				body: DeleteCustomerRequestSchema,
				response: {
					204: {
						description: "Successfully deleted customer",
					},
				},
			},
		},
		async (request, reply) => {
			try {
				await opts.customerService.deleteCustomer(
					request.body.customerId,
				);
				return reply.status(204).send();
			} catch (error) {
				console.error("Error in delete customer: ", error);
				return reply.code(500).send();
			}
		},
	);
};
