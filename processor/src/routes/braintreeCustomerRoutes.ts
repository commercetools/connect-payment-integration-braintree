import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BraintreeCustomerService } from '../services/BraintreeCustomerService';
import {
  CreateCustomerRequestSchema,
  CreateCustomerRequestSchemaDTO,
  CreateCustomerResponseSchema,
  CreateCustomerResponseSchemaDTO,
} from '../dtos/customer';

type PaymentRoutesOptions = {
  customerService: BraintreeCustomerService;
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const braintreeCustomerRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
  fastify.post<{ Body: CreateCustomerRequestSchemaDTO; Reply: CreateCustomerResponseSchemaDTO }>(
    '/create',
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
        const response = await opts.customerService.createCustomer(request.body);
        return reply.status(200).send(response);
      } catch (error) {
        console.error('Error in create customer: ', error);
        return reply.code(500).send();
      }
    },
  );
};
