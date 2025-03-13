import { RequestContextData, setupPaymentSDK } from '@commercetools/connect-payments-sdk';
import { getConfig } from '../config';
import { getRequestContext, updateRequestContext } from '../libs/fastify/context';
import { appLogger } from '../libs/logger/appLogger';

const config = getConfig();

export const paymentSDK = setupPaymentSDK({
  apiUrl: config.apiUrl,
  authUrl: config.authUrl,
  clientId: config.clientId,
  clientSecret: config.clientSecret,
  projectKey: config.projectKey,
  sessionUrl: config.sessionUrl,
  jwksUrl: config.jwksUrl,
  jwtIssuer: config.jwtIssuer,
  getContextFn: (): RequestContextData => {
    const { correlationId, requestId, authentication } = getRequestContext();
    return {
      correlationId: correlationId || '',
      requestId: requestId || '',
      authentication,
    };
  },
  updateContextFn: (context: Partial<RequestContextData>) => {
    const requestContext = Object.assign(
      {},
      context.correlationId ? { correlationId: context.correlationId } : {},
      context.requestId ? { requestId: context.requestId } : {},
      context.authentication ? { authentication: context.authentication } : {},
    );
    updateRequestContext(requestContext);
  },
  logger: appLogger,
});
