import { SessionHeaderAuthenticationHook } from "@commercetools/connect-payments-sdk";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { Type } from "@sinclair/typebox";

import { BraintreeTransactionService } from "../services/BraintreeTransactionService";
import { type Transaction } from "braintree";

type transactionRoutesOptions = {
	transactionService: BraintreeTransactionService;
	sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO remove before release, these routes (at least /find/:transactionId) shouldn't make it into production
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export const braintreeTransactionRoutes = async (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions & transactionRoutesOptions,
) => {
	fastify.get<{
		Params: { transactionId: string };
		Reply: Transaction;
	}>(
		"/find/:transactionId",
		{
			preHandler: [opts.sessionHeaderAuthHook.authenticate()],
			schema: {
				params: {
					$id: "paramsSchema",
					type: "object",
					properties: {
						transactionId: Type.String(),
					},
					required: ["transactionId"],
				},
				// response: {
				// 	200: FindTransactionResponseSchema,
				// },
			},
		},
		async (request, reply) => {
			try {
				const response = await opts.transactionService.findTransaction(request.params.transactionId);
				return reply.status(200).send(response);
			} catch (error) {
				console.error("Error in find transaction: ", error);
				return reply.code(500).send();
			}
		},
	);
};
