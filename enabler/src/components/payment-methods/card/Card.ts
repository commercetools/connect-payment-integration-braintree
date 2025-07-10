import { type BaseOptions, type ComponentOptions, PaymentMethod, type PaymentResult } from "../../../payment-enabler";

import { BaseComponent } from "../../BaseComponent";
import { hostedFields, type HostedFields, type HostedFieldsEvent } from "braintree-web";
import { PaymentOutcome } from "../../../dtos";
import type { PaymentResponseSchemaDTO } from "../../../dtos/PaymentResponseSchemaDTO";
import type { HostedFieldsHostedFieldsFieldData, HostedFieldsTokenizePayload } from "braintree-web/hosted-fields";
export class Card extends BaseComponent {
	private showPayButton: boolean;
	private hostedFieldsInstance: HostedFields | undefined;
	constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
		super(PaymentMethod.card, baseOptions, componentOptions);
		this.showPayButton = componentOptions?.showPayButton ?? false;
	}

	async mount(containerId: string) {
		document.getElementById(containerId)!.insertAdjacentHTML("afterbegin", this._getTemplate());
		this.hostedFieldsInstance = await hostedFields.create({
			client: this.sdk,
			styles: {
				input: {
					// change input styles to match
					// bootstrap styles
					"font-size": "2rem",
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

		function findLabel(field: HostedFieldsHostedFieldsFieldData): Element | null {
			return document.querySelector(`.hosted-field--label[for="${field.container.id}"]`);
		}

		this.hostedFieldsInstance.on("focus", function (event: HostedFieldsEvent) {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];

			const label = findLabel(field);
			if (label) {
				label.classList.add("label-float");
				label.classList.remove("filled");
			}
		});
		this.hostedFieldsInstance.on("blur", function (event: HostedFieldsEvent) {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];
			var label = findLabel(field);

			if (label && field.isEmpty) {
				label.classList.remove("label-float");
			} else if (label && field.isValid) {
				label.classList.add("filled");
			} else if (label) {
				label.classList.add("invalid");
			}
		});

		this.hostedFieldsInstance.on("empty", function (event: HostedFieldsEvent) {
			var field: HostedFieldsHostedFieldsFieldData = event.fields[event.emittedBy];
			var label = findLabel(field);
			if (label) {
				label.classList.remove("filled");
				label.classList.remove("invalid");
			}
		});

		this.hostedFieldsInstance.on("validityChange", function (event) {
			var field = event.fields[event.emittedBy];
			var label = findLabel(field);

			if (label && field.isPotentiallyValid) {
				label.classList.remove("invalid");
			} else if (label) {
				label.classList.add("invalid");
			}
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
			console.log("Payment response:", createPaymentResponse);
		
			const paymentResult: PaymentResult = {
				paymentReference: createPaymentResponse.paymentReference ?? "",
				isSuccess: createPaymentResponse.success,
			};
			await this.hostedFieldsInstance.teardown();

			this.onComplete && this.onComplete(paymentResult);
		} catch (error) {
			console.error("Error creating payment");
			this.onError(error);
		}
	}
	private _getTemplate() {
		return `<!-- Bootstrap inspired Braintree Hosted Fields example -->
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
