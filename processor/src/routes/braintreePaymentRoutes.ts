import { SessionHeaderAuthenticationHook } from '@commercetools/connect-payments-sdk';
import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import {
  PaymentRequestSchema,
  PaymentRequestSchemaDTO,
  PaymentResponseSchema,
  PaymentResponseSchemaDTO,
} from '../dtos/payment';
import { BraintreePaymentService } from '../services/BraintreePaymentService';

type PaymentRoutesOptions = {
  paymentService: BraintreePaymentService;
  sessionHeaderAuthHook: SessionHeaderAuthenticationHook;
};

export const braintreePaymentRoutes = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions & PaymentRoutesOptions,
) => {
  fastify.post<{ Body: PaymentRequestSchemaDTO; Reply: PaymentResponseSchemaDTO }>(
    '/payment',
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
      const resp = await opts.paymentService.createPayment({
        data: request.body,
      });
      if (resp.paymentReference) {
        return reply.status(200).send(resp);
      } else {
        return reply.status(500).send();
      }
    },
  );
};
