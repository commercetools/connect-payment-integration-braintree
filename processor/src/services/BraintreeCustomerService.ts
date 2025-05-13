import {
	CommercetoolsCartService,
	CommercetoolsPaymentService,
} from "@commercetools/connect-payments-sdk";
import { BraintreeCustomerServiceOptions } from "./types/payment/BraintreeCustomerServiceOptions";
import braintree from "braintree";
import { getConfig } from "../dev-utils/getConfig";
import {
	CreateCustomerRequest,
	CreateCustomerResponse,
} from "./types/customer";

const config = getConfig();

export class BraintreeCustomerService {
	//@ts-expect-error - unused variable
	private ctCartService: CommercetoolsCartService;
	//@ts-expect-error - unused variable
	private ctPaymentService: CommercetoolsPaymentService;
	private braintreeGateway: braintree.BraintreeGateway;

	constructor(opts: BraintreeCustomerServiceOptions) {
		this.ctCartService = opts.ctCartService;
		this.ctPaymentService = opts.ctPaymentService;
		this.braintreeGateway = new braintree.BraintreeGateway({
			environment: braintree.Environment.Sandbox,
			merchantId: config.braintreeMerchantId,
			publicKey: config.braintreePublicKey,
			privateKey: config.braintreePrivateKey,
		});
	}

	/**
	 * Find customer
	 *
	 * @remarks
	 * Implementation to find a Braintree customer by ID
	 *
	 * @param customerId - the ID of the customer to be found
	 * @returns Promise with Braintree customer with specified ID
	 */
	public async findCustomer(customerId: string): Promise<braintree.Customer> {
		const customer = await this.braintreeGateway.customer.find(customerId);
		if (!customer) {
			console.log(
				`Error in BraintreePaymentService findCustomer: customer with ID ${customerId} not found`,
			);
		}
		return customer;
	}

	/**
	 * Delete customer
	 *
	 * @remarks
	 * Implementation to delete a Braintree customer by ID
	 *
	 * @param customerId - the ID of the customer to be found
	 * @returns Void
	 */
	public async deleteCustomer(customerId: string): Promise<void> {
		await this.braintreeGateway.customer.delete(customerId);
	}

	/**
	 * Create customer
	 *
	 * @remarks
	 * Implementation to create a customer with Braintree
	 *
	 * @param request - contains the information of the new customer to be created
	 * @returns Promise with new customer created with Braintree
	 */
	public async createCustomer(
		request: CreateCustomerRequest,
	): Promise<CreateCustomerResponse> {
		const response = await this.braintreeGateway.customer.create(request);
		if (!response.success) {
			console.error(
				"Error in BraintreePaymentService createCustomer: ",
				response.errors,
			);
			throw new Error("Error in BraintreePaymentService createCustomer");
		}
		return response.customer;
	}
}
