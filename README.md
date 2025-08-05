# connect-payment-integration-Braintree

This repository provides a [connect](https://docs.commercetools.com/connect) for integration to Braintree payment service provider (PSP).

## Features

- Typescript language supported.
- Uses Fastify as web server framework.
- Uses [commercetools SDK](https://docs.commercetools.com/sdk/js-sdk-getting-started) for the commercetools-specific communication.
- Uses [connect payment SDK](https://github.com/commercetools/connect-payments-sdk) to manage request context, sessions and JWT authentication.
- Includes local development utilities in npm commands to build, start, test, lint & prettify code.

## Important Notes

### Merchant Account Configuration
- Each connect deployment supports only one Braintree merchant account.
- Cart currency is validated against the Braintree merchant account currency during:
  - Payment session initialization
  - Payment creation

### Payment Status Updates
Our payment connector submits requests for various payment operations to Braintree. Since the payment capture and refund operations are asynchronous in Braintree (Payment reversal is also asynchronous in case the payment has been captured), the most up-to-date status of these operations reside in the Braintree platform, not in commercetools payment transactions.

**Note for Merchants**: 
- The transaction status indicates whether payment capture/refund requests can be delivered to to Braintree platform.
- Merchants are suggested to implement their own mechanism to fetch the latest capture/refund status from Braintree after submission.

## Prerequisite

#### 1. commercetools composable commerce API client

Users are expected to create API client responsible for payment management in composable commerce project. Details of the API client are taken as input as environment variables/ configuration for connect such as `CTP_PROJECT_KEY` , `CTP_CLIENT_ID`, `CTP_CLIENT_SECRET`. For details, please read [Deployment Configuration](./README.md#deployment-configuration).
In addition, please make sure the API client should have enough scope to be able to manage payment. For details, please refer to [Running Application](./processor/README.md#running-application)

#### 2. various URLs from commercetools composable commerce

Various URLs from commercetools platform are required to be configured so that the connect application can handle session and authentication process for endpoints.
Their values are taken as input as environment variables/ configuration for connect with variable names `CTP_API_URL`, `CTP_AUTH_URL` and `CTP_SESSION_URL`.

3. Braintree account credentials
Various account data provided by Braintree are necessary to be configured so that the requests from the connect application can be authenticated by Braintree platform within the integration. Their values are taken as input as environment variables/ configuration for connect with variable names `BRAINTREE_MERCHANT_ID`, `BRAINTREE_MERCHANT_ACCOUNT_ID`, `BRAINTREE_PUBLIC_KEY`, `BRAINTREE_PRIVATE_KEY`.

## Development Guide
Regarding the development of enabler module, please refer to the following documentations:
- [Development of Enabler](./enabler/README.md)

Regarding the development of processor module, please refer to the following documentations:
- [Development of Processor](./processor/README.md)

#### Connector in commercetools Connect
Use public connector listed in connect marketplace. If any customization done, follow guidelines [here](https://docs.commercetools.com/connect/getting-started) to register the connector for private use.

#### Deployment Configuration
In order to deploy your customized connector application on commercetools Connect, it needs to be published. For details, please refer to [documentation about commercetools Connect](https://docs.commercetools.com/connect/concepts)
In addition, in order to support connect, the Braintree payment integration connector has a folder structure as listed below
```
├── enabler
│   ├── src
│   ├── test
│   └── package.json
├── processor
│   ├── src
│   ├── test
│   └── package.json
└── connect.yaml
```

Connect deployment configuration is specified in `connect.yaml` which is required information needed for publishing of the application. Following is the deployment configuration used by enabler and processor modules
```
deployAs:
  - name: enabler
    applicationType: assets
  - name: processor
    applicationType: service
    endpoint: /
    configuration:
      standardConfiguration:
        - key: CTP_PROJECT_KEY
          description: commercetools project key
          required: true
        - key: CTP_AUTH_URL
          description: commercetools Auth URL
          required: true
          default: https://auth.europe-west1.gcp.commercetools.com
        - key: CTP_API_URL
          description: commercetools API URL
          required: true
          default: https://api.europe-west1.gcp.commercetools.com
        - key: CTP_SESSION_URL
          description: Session API URL
          required: true
          default: https://session.europe-west1.gcp.commercetools.com
        - key: CTP_CLIENT_ID
          description: commercetools client ID with manage_payments, manage_orders, view_sessions, view_api_clients, manage_checkout_payment_intents & introspect_oauth_tokens scopes
          required: true
        - key: CTP_JWKS_URL
          description: JWKs url (example - https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json)
          required: true
          default: https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json
        - key: CTP_JWT_ISSUER
          description: JWT Issuer for jwt validation (example - https://mc-api.europe-west1.gcp.commercetools.com)
          required: true
          default: https://mc-api.europe-west1.gcp.commercetools.com
        - key: BRAINTREE_MERCHANT_ID
          description: Braintree merchant ID
          required: true
        - key: BRAINTREE_MERCHANT_ACCOUNT_ID
          description: Braintree merchant account ID
          required: true          
        - key: BRAINTREE_ENVIRONMENT
          description: Braintree environment (sandbox or production)
          required: true
      securedConfiguration:
        - key: CTP_CLIENT_SECRET
          description: commercetools client secret
          required: true
        - key: BRAINTREE_PUBLIC_KEY
          description: Braintree public key
          required: true
        - key: BRAINTREE_PRIVATE_KEY
          description: Braintree private key
          required: true

```

Here you can see the details about various variables in configuration
- `CTP_PROJECT_KEY`: The key of commercetools composable commerce project.
- `CTP_CLIENT_ID`: The client ID of your commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK. Expected scopes are: `manage_payments` `manage_orders` `view_sessions` `view_api_clients` `manage_checkout_payment_intents` `introspect_oauth_tokens`.
- `CTP_CLIENT_SECRET`: The client secret of commercetools composable commerce user account. It is used in commercetools client to communicate with commercetools composable commerce via SDK.
- `CTP_AUTH_URL`: The URL for authentication in commercetools platform. It is used to generate OAuth 2.0 token which is required in every API call to commercetools composable commerce. The default value is `https://auth.europe-west1.gcp.commercetools.com`. For details, please refer to documentation [here](https://docs.commercetools.com/tutorials/api-tutorial#authentication).
- `CTP_API_URL`: The URL for commercetools composable commerce API. Default value is `https://api.europe-west1.gcp.commercetools.com`.
- `CTP_SESSION_URL`: The URL for session creation in commercetools platform. Connectors relies on the session created to be able to share information between enabler and processor. The default value is `https://session.europe-west1.gcp.commercetools.com`.
- `CTP_JWKS_URL`: The URL which provides JSON Web Key Set. Default value is `https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json`.
- `CTP_JWT_ISSUER`: The issuer inside JSON Web Token which is required in JWT validation process. Default value is `default: https://mc-api.europe-west1.gcp.commercetools.com`
- `BRAINTREE_ENVIRONMENT`: The indicator of Braintree environment.  Default value is `SANDBOX`. It can be configured either as `PRODUCTION` or `SANDBOX`.
- `BRAINTREE_MERCHANT_ID`: A unique identifier for the entire gateway account. This value is required to send API calls to the Braintree gateway.
- `BRAINTREE_MERCHANT_ACCOUNT_ID`: The merchant account ID is a unique identifier for a specific merchant account in your Braintree gateway, and is used to specify which merchant account to use when creating a transaction. Remember that each connect deployment supports only 1 merchant account.
- `BRAINTREE_PUBLIC_KEY`: This is the user-specific public identifier for Braintree. Each user associated with their Braintree gateway will have their own public key.
- `BRAINTREE_PRIVATE_KEY`: This is the user-specific private identifier. Each user associated with their Braintree gateway will have their own private key. 

## Development
In order to get started developing this connector certain configuration are necessary, most of which involve updating environment variables in both services (enabler, processor).

#### Configuration steps

#### 1. Environment Variable Setup

Navigate to each service directory and duplicate the .env.template file, renaming the copy to .env. Populate the newly created .env file with the appropriate values.

```bash
cp .env.template .env
```

#### 2. Spin Up Components via Docker Compose
With the help of docker compose, you are able to spin up all necessary components required for developing the connector by running the following command from the root directory;

```bash
docker compose up
```

This command would start 3 required services, necessary for development
1. JWT Server
2. Enabler
3. Processor