import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { BraintreeCustomerService } from '../services/BraintreeCustomerService';
import {
  CreateCustomerRequestSchema,
  CreateCustomerRequestSchemaDTO,
  CreateCustomerResponseSchema,
  CreateCustomerResponseSchemaDTO,
  GetCustomerResponseSchema,
  GetCustomerResponseSchemaDTO,
} from '../dtos/customer';
import { Type } from '@sinclair/typebox';

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
  fastify.get<{ Params: { customerId: string }; Reply: GetCustomerResponseSchemaDTO }>(
    '/find/:customerId',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        params: {
          $id: 'paramsSchema',
          type: 'object',
          properties: {
            customerId: Type.String(),
          },
          required: ['customerId'],
        },
        response: {
          200: GetCustomerResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const response = await opts.customerService.findCustomer(request.params.customerId);
        return reply.status(200).send(response);
      } catch (error) {
        console.error('Error in find customer: ', error);
        return reply.code(500).send();
      }
    },
  );
  fastify.delete<{ Params: { customerId: string } }>(
    '/delete/:customerId',
    {
      preHandler: [opts.sessionHeaderAuthHook.authenticate()],
      schema: {
        params: {
          $id: 'paramsSchema',
          type: 'object',
          properties: {
            customerId: Type.String(),
          },
          required: ['customerId'],
        },
        response: {
          204: {
            description: 'Successfully deleted customer',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        await opts.customerService.deleteCustomer(request.params.customerId);
        return reply.status(204).send();
      } catch (error) {
        console.error('Error in delete customer: ', error);
        return reply.code(500).send();
      }
    },
  );
};
