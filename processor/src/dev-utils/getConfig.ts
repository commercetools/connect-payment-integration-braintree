const config = {
	// Required by Payment SDK
	projectKey: process.env.CTP_PROJECT_KEY || "payment-integration",
	clientId: process.env.CTP_CLIENT_ID || "xxx",
	clientSecret: process.env.CTP_CLIENT_SECRET || "xxx",
	jwksUrl: process.env.CTP_JWKS_URL || "https://mc-api.europe-west1.gcp.commercetools.com/.well-known/jwks.json",
	jwtIssuer: process.env.CTP_JWT_ISSUER || "https://mc-api.europe-west1.gcp.commercetools.com",
	authUrl: process.env.CTP_AUTH_URL || "https://auth.europe-west1.gcp.commercetools.com",
	apiUrl: process.env.CTP_API_URL || "https://api.europe-west1.gcp.commercetools.com",
	sessionUrl: process.env.CTP_SESSION_URL || "https://session.europe-west1.gcp.commercetools.com/",
	healthCheckTimeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || "5000"),

	// Required by logger
	loggerLevel: process.env.LOGGER_LEVEL || "info",

	// Update with specific payment providers config
	braintreeMerchantId: process.env.BRAINTREE_MERCHANT_ID || "xxx",
	braintreePublicKey: process.env.BRAINTREE_PUBLIC_KEY || "xxx",
	braintreePrivateKey: process.env.BRAINTREE_PRIVATE_KEY || "xxx",

	// Payment Providers config
	returnUrl: process.env.MERCHANT_RETURN_URL,
};

for (const key in config) {
	if (!config[key as keyof typeof config]) {
		console.warn(`Config parameter "${key}" is undefined.`);
	}
}

export const getConfig = () => config;
