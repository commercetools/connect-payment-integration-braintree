import { type BaseOptions, type ComponentOptions, PaymentMethod, type PaymentResult } from "../../../payment-enabler";

import { BaseComponent } from "../../BaseComponent";
import { hostedFields, type HostedFields, type HostedFieldsEvent } from "braintree-web";
import type { PaymentResponseSchemaDTO } from "../../../dtos/PaymentResponseSchemaDTO";
import type {
	HostedFieldsHostedFieldsFieldData,
	HostedFieldsState,
	HostedFieldsTokenizePayload,
} from "braintree-web/hosted-fields";

export class Card extends BaseComponent {
	private showPayButton: boolean;
	private hostedFieldsInstance: HostedFields | undefined;
	private hasComponentRendered: boolean = false;

	constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
		super(PaymentMethod.card, baseOptions, componentOptions);
		this.showPayButton = componentOptions?.showPayButton ?? false;
	}

	async mount(containerId: string) {
		console.log("Mounting card component");
		const container = document.querySelector(containerId);
		if (!container) {
			throw new Error(`Container with selector "${containerId}" not found`);
		}
		container.insertAdjacentHTML("afterbegin", this._getTemplate());
		this.hostedFieldsInstance = await hostedFields.create({
			client: this.sdk,
			styles: {
				input: {
					// change input styles to match
					// bootstrap styles
					"font-size": "1rem",
					color: "#495057",
				},
			},
			fields: {
				number: {
					selector: "#cc-number",
				},
				cardholderName: {
					selector: "#cc-name",
				},
				cvv: {
					selector: "#cc-cvv",
				},
				expirationDate: {
					selector: "#cc-expiration",
					placeholder: "MM/YY",
				},
			},
		});
		if (!this.hostedFieldsInstance) {
			throw new Error("Failed to create Hosted Fields instance.");
		}

		this.hostedFieldsInstance.on("focus", (event: HostedFieldsEvent) => {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];
			field.container.classList.add("label-float");
			field.container.classList.remove("filled");
			this.hasComponentRendered = true;
		});

		this.hostedFieldsInstance.on("blur", (event: HostedFieldsEvent) => {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];

			if (field.isEmpty) {
				field.container.classList.remove("label-float");
			} else if (field.isValid) {
				field.container.classList.add("filled");
			} else {
				field.container.classList.add("is-invalid");
			}
			this.hasComponentRendered = true;
		});

		this.hostedFieldsInstance.on("empty", (event: HostedFieldsEvent) => {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];
			field.container.classList.remove("filled");
			field.container.classList.remove("is-invalid");
			this.hasComponentRendered = true;
		});

		this.hostedFieldsInstance.on("validityChange", (event) => {
			var field = event.fields[event.emittedBy];
			if (field.isValid) {
				field.container.classList.remove("is-invalid");
			} else {
				field.container.classList.add("is-invalid");
			}
			this.hasComponentRendered = true;
		});

		if (this.showPayButton) {
			document.querySelector("#creditCardForm-paymentButton")!.addEventListener("click", (e) => {
				e.preventDefault();
				this.submit();
			});
		}
	}

	async submit() {
		let payload: HostedFieldsTokenizePayload;
		try {
			if (!this.hostedFieldsInstance) {
				throw new Error("Hosted Fields instance is not initialized.");
			}
			payload = await this.hostedFieldsInstance.tokenize();
			console.log("Tokenization result:", payload);
		} catch (error) {
			this.onError(error);
			return;
		}

		const request = {
			nonce: payload.nonce,
			paymentMethodType: "card",
			paymentReference: this.paymentReference,
		};
		try {
			const response = await fetch(this.processorUrl + "/payment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Session-Id": this.sessionId,
				},
				body: JSON.stringify(request),
			});

			const createPaymentResponse: PaymentResponseSchemaDTO = await response.json();
			const paymentResult: PaymentResult = createPaymentResponse.success
				? {
						isSuccess: true,
						paymentReference: createPaymentResponse.paymentReference ?? "",
					}
				: {
						isSuccess: false,
						paymentReference: createPaymentResponse.paymentReference ?? "",
						message: createPaymentResponse.message ?? "",
					};

			this.onComplete && this.onComplete(paymentResult);
		} catch (error) {
			console.error("Error creating payment");
			this.onError(error);
		} finally {
			await this.hostedFieldsInstance.teardown();
		}
	}

	async showValidation(): Promise<void> {
		console.log("Showing card validation");
		if (!this.hostedFieldsInstance) {
			throw new Error("Hosted Fields instance is not initialized.");
		}
		var state: HostedFieldsState = this.hostedFieldsInstance.getState();
		Object.keys(state.fields).forEach((key) => {
			const field = state.fields[key as keyof typeof state.fields];
			if (field.isValid) {
				field.container.classList.add("is-valid");
			} else {
				field.container.classList.add("is-invalid");
			}
		});
	}

	async isValid(): Promise<boolean> {
		console.log("Checking if card form is valid");
		if (this.hasComponentRendered === false) {
			this.hasComponentRendered = true;
			return Promise.resolve(true);
		}
		if (!this.hostedFieldsInstance) {
			throw new Error("Hosted Fields instance is not initialized.");
		}
		var state: HostedFieldsState = this.hostedFieldsInstance.getState();
		console.log("state:", state);
		// state fields is an array containing [number, cvv, expirationDate, cardholderName]
		console.log("state fields:", state.fields);
		console.log(Object.keys(state.fields).every((key) => state.fields[key as keyof typeof state.fields]?.isValid));
		return Object.keys(state.fields).every((key) => state.fields[key as keyof typeof state.fields]?.isValid);
	}

	async getState() {
		console.log("Getting card state");
		const state = {
			card: {
				brand: this._mapCardBrandType("visa"),
			},
		};
		return state;
	}

	async isAvailable(): Promise<boolean> {
		console.log("Checking if card component is available");
		return Promise.resolve(true);
	}

	private _mapCardBrandType(brand: string): string {
		switch (brand) {
			case "visa":
				return "Visa";
			case "master-card":
				return "Mastercard";
			case "maestro":
				return "Maestro";
			case "american-express":
				return "Amex";
			case "discover":
				return "Discover";
			case "jcb":
				return "Jcb";
			case "diners-club":
				return "Diners";
			case "unionpay":
				return "UnionPay";
			default:
				return "Unknown";
		}
	}

	private _getTemplate() {
		return `<!-- Bootstrap inspired Braintree Hosted Fields example -->
				<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
				<style>
					.form-control {
						height: calc(1.5em + .75rem + 2px);
					}
						
					body {
						background-color: #fff;
						padding: 15px;
					}

					.toast {
						position: fixed;
						top: 15px;
						right: 15px;
						z-index: 9999;
					}

					.bootstrap-basic {
						background: white;
					}

					/* Braintree Hosted Fields styling classes*/
					.braintree-hosted-fields-focused {
						color: #495057;
						background-color: #fff;
						border-color: #80bdff;
						outline: 0;
						box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
					}

					.braintree-hosted-fields-focused.is-invalid {
						border-color: #dc3545;
						box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
					}


				</style>
				<div class="bootstrap-basic">
				<form class="needs-validation" novalidate="">

					<div class="row">
					<div class="col-sm-6 mb-3">
						<label for="cc-name">Cardholder Name</label>
						<div class="form-control" id="cc-name"></div>
						<small class="text-muted">Full name as displayed on card</small>
						<div class="invalid-feedback">
						Name on card is required
						</div>
					</div>
					<div class="col-sm-6 mb-3">
						<label for="email">Email</label>
						<input type="email" class="form-control" id="email" placeholder="you@example.com">
						<div class="invalid-feedback">
						Please enter a valid email address for shipping updates.
						</div>
					</div>
					</div>

					<div class="row">
					<div class="col-sm-6 mb-3">
						<label for="cc-number">Credit card number</label>
						<div class="form-control" id="cc-number"></div>
						<div class="invalid-feedback">
						Credit card number is required
						</div>
					</div>
					<div class="col-sm-3 mb-3">
						<label for="cc-expiration">Expiration</label>
						<div class="form-control" id="cc-expiration"></div>
						<div class="invalid-feedback">
						Expiration date required
						</div>
					</div>
					<div class="col-sm-3 mb-3">
						<label for="cc-expiration">CVV</label>
						<div class="form-control" id="cc-cvv"></div>
						<div class="invalid-feedback">
						Security code required
						</div>
					</div>
					</div>

					<hr class="mb-4">
					<div class="text-center">
					<button class="btn btn-primary btn-lg" type="submit" id="creditCardForm-paymentButton">Pay with <span id="card-brand">Card</span></button>
					</div>
				</form>
				</div>
				<div aria-live="polite" aria-atomic="true" style="position: relative; min-height: 200px;">
	
				</div>`;
	}
}
