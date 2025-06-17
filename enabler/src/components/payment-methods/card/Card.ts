import { type BaseOptions, type ComponentOptions, PaymentMethod } from "../../../payment-enabler";

import { BaseComponent } from "../../BaseComponent";
import {  fieldIds, getCardBrand, getInput, validateAllFields } from "./utils";
// import { PaymentOutcome, type PaymentRequestSchemaDTO } from "../../../dtos";
import { hostedFields, type HostedFields } from "braintree-web";
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
				  'font-size': '2rem',
				  color: '#495057'
				}
			  },
			fields: {
				number: {
				  selector: '#cc-number',
				},
				cardholderName: {
					selector: '#cc-name',
				},
				cvv: {
				  selector: '#cc-cvv',
				},
				expirationDate: {
				  selector: '#cc-expiration',
				  placeholder: 'MM/YY'
				},
			}
		})
		if (this.showPayButton) {
			document.querySelector("#creditCardForm-paymentButton")!.addEventListener("click", (e) => {
				e.preventDefault();
				this.submit();
			});
		}

		//addFormFieldsEventListeners();
	}

	async submit() {
		// TODO: Do field validation
		// const isFormValid = validateAllFields();
		// if (!isFormValid) {
		// 	return;
		// }
		
		try {
			if (!this.hostedFieldsInstance) {
				throw new Error("Hosted Fields instance is not initialized.");
			} 
			const payload = await this.hostedFieldsInstance.tokenize();
			console.log('Tokenization result:', payload);
		} catch(error) {
			console.error('Error tokenizing card data:', error);
			this.onError("Card tokenization failed. Please try again.");
			return;
		};	

			
		
		// try {
		// 	// Below is a mock implementation but not recommend and PCI compliant approach,
		// 	// please use respective PSP iframe capabilities to handle PAN data
		// 	const requestData = {
		// 		paymentMethod: {
		// 			type: this.paymentMethod,
		// 			cardNumber: getInput(fieldIds.cardNumber).value.replace(/\s/g, ""),
		// 			expiryMonth: getInput(fieldIds.expiryDate).value.split("/")[0],
		// 			expiryYear: getInput(fieldIds.expiryDate).value.split("/")[1],
		// 			cvc: getInput(fieldIds.cvv).value,
		// 			holderName: getInput(fieldIds.holderName).value,
		// 		},
		// 	};

		// 	// Mock Validation
		// 	let isAuthorized = this.isCreditCardAllowed(requestData.paymentMethod.cardNumber);
		// 	const resultCode = isAuthorized ? PaymentOutcome.AUTHORIZED : PaymentOutcome.REJECTED;

		// 	const request: PaymentRequestSchemaDTO = {
		// 		paymentMethod: {
		// 			type: this.paymentMethod,
		// 		},
		// 		paymentOutcome: resultCode,
		// 	};
		// 	const response = await fetch(this.processorUrl + "/payments", {
		// 		method: "POST",
		// 		headers: {
		// 			"Content-Type": "application/json",
		// 			"X-Session-Id": this.sessionId,
		// 		},
		// 		body: JSON.stringify(request),
		// 	});
		// 	const data = await response.json();

		// 	if (resultCode === PaymentOutcome.AUTHORIZED) {
		// 		this.onComplete &&
		// 			this.onComplete({
		// 				isSuccess: true,
		// 				paymentReference: data.paymentReference,
		// 			});
		// 	} else {
		// 		this.onComplete && this.onComplete({ isSuccess: false });
		// 	}
		// } catch (e) {
		// 	this.onError("Some error occurred. Please try again.");
		// }
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
				<div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-autohide="false">
				<div class="toast-header">
					<strong class="mr-auto">Success!</strong>
					<small>Just now</small>
					<button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
					<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="toast-body">
					Next, submit the payment method nonce to your server.
				</div>
				</div>
				</div>`;
	}
	
	override showValidation() {
		validateAllFields();
	}

	override isValid() {
		return validateAllFields();
	}

	override getState() {
		return {
			card: {
				endDigits: getInput(fieldIds.cardNumber).value.slice(-4),
				brand: getCardBrand(getInput(fieldIds.cardNumber).value),
				expiryDate: getInput(fieldIds.expiryDate).value,
			},
		};
	}

	override isAvailable() {
		return Promise.resolve(true);
	}

	// private isCreditCardAllowed(cardNumber: string) {
	// 	const allowedCreditCards = ["4111111111111111", "5555555555554444", "341925950237632"];
	// 	return allowedCreditCards.includes(cardNumber);
	// }
}
