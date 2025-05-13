import {
	type BaseOptions,
	type ComponentOptions,
	PaymentMethod,
} from "../../../payment-enabler";
import { BaseComponent } from "../../BaseComponent";
import inputFieldStyles from "../../../style/inputField.module.scss";
import styles from "../../../style/style.module.scss";
import buttonStyles from "../../../style/button.module.scss";
import { PaymentOutcome, type PaymentRequestSchemaDTO } from "../../../dtos";

export class PurchaseOrder extends BaseComponent {
	private showPayButton: boolean;
	private poNumberId = "purchaseOrderForm-poNumber";
	private invoiceMemoId = "purchaseOrderForm-invoiceMemo";

	constructor(baseOptions: BaseOptions, componentOptions: ComponentOptions) {
		super(PaymentMethod.purchaseorder, baseOptions, componentOptions);
		this.showPayButton = componentOptions?.showPayButton ?? false;
	}

	mount(selector: string) {
		document
			.querySelector(selector)!
			.insertAdjacentHTML("afterbegin", this._getTemplate());

		if (this.showPayButton) {
			document
				.querySelector("#purchaseOrderForm-paymentButton")!
				.addEventListener("click", (e) => {
					e.preventDefault();
					this.submit();
				});
		}

		this.addFormFieldsEventListeners();
	}

	async submit() {
		// here we would call the SDK to submit the payment
		this.sdk.init({ environment: this.environment });

		const isFormValid = this.validateAllFields();
		if (!isFormValid) {
			return;
		}

		try {
			const requestData: PaymentRequestSchemaDTO = {
				paymentMethod: {
					type: this.paymentMethod,
					poNumber: this.getInput(this.poNumberId).value.trim(),
					invoiceMemo: this.getInput(this.invoiceMemoId).value.trim(),
				},
				paymentOutcome: PaymentOutcome.AUTHORIZED,
			};

			const response = await fetch(this.processorUrl + "/payments", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-Session-Id": this.sessionId,
				},
				body: JSON.stringify(requestData),
			});
			const data = await response.json();
			if (data.paymentReference) {
				this.onComplete &&
					this.onComplete({
						isSuccess: true,
						paymentReference: data.paymentReference,
					});
			} else {
				this.onError("Some error occurred. Please try again.");
			}
		} catch (e) {
			this.onError("Some error occurred. Please try again.");
		}
	}

	override showValidation() {
		this.validateAllFields();
	}

	override isValid() {
		return this.validateAllFields();
	}

	private _getTemplate() {
		const payButton = this.showPayButton
			? `<button class="${buttonStyles.button} ${buttonStyles.fullWidth} ${
					styles.submitButton as string
				}" id="purchaseOrderForm-paymentButton">Pay</button>`
			: "";
		return `
    <div class="${styles.wrapper}">
      <form class="${styles.paymentForm}">
        <div class="${inputFieldStyles.inputContainer as string}">
          <label class="${
				inputFieldStyles.inputLabel
			}" for="purchaseOrderForm-poNumber">
            PO Number <span aria-hidden="true"> *</span>
          </label>
          <input class="${
				inputFieldStyles.inputField as string
			}" type="text" id="purchaseOrderForm-poNumber" name="poNumber" value="">
          <span class="${styles.hidden as string} ${
				inputFieldStyles.errorField as string
			}">Invalid PO number</span>
        </div>
        <div class="${inputFieldStyles.inputContainer}">
          <label class="${
				inputFieldStyles.inputLabel
			}" for="purchaseOrderForm-invoiceMemo">
            Invoice memo
          </label>
          <input class="${
				inputFieldStyles.inputField as string
			}" type="text" id="purchaseOrderForm-invoiceMemo" name="invoiceMemo" value="">
          <span class="${styles.hidden as string} ${
				inputFieldStyles.errorField as string
			}">Invalid Invoice memo</span>
        </div>
        ${payButton}
      </form>
      </div>
    `;
	}

	private addFormFieldsEventListeners = () => {
		this.handleFieldValidation(this.poNumberId);
		this.handleFieldFocusOut(this.invoiceMemoId);
	};

	private getInput(field: string): HTMLInputElement {
		return document.querySelector(`#${field}`) as HTMLInputElement;
	}

	private validateAllFields(): boolean {
		let isValid = true;
		if (!this.isFieldValid(this.poNumberId)) {
			isValid = false;
			this.showErrorIfInvalid(this.poNumberId);
		}

		return isValid;
	}

	private isFieldValid(field: string): boolean {
		const input = this.getInput(field);
		return input.value.replace(/\s/g, "").length > 0;
	}

	private showErrorIfInvalid(field: string) {
		if (!this.isFieldValid(field)) {
			const input = this.getInput(field);
			if (input.parentElement) {
				input.parentElement.classList.add(
					inputFieldStyles.error as string,
				);
				input.parentElement
					.querySelector(
						`#${field} + .${inputFieldStyles.errorField as string}`,
					)!
					.classList.remove(styles.hidden as string);
			}
		}
	}

	private hideErrorIfValid = (field: string) => {
		if (this.isFieldValid(field)) {
			const input = this.getInput(field);
			if (input.parentElement) {
				input.parentElement.classList.remove(
					inputFieldStyles.error as string,
				);
				input.parentElement
					.querySelector(
						`#${field} + .${inputFieldStyles.errorField as string}`,
					)!
					.classList.add(styles.hidden as string);
			}
		}
	};

	private handleFieldValidation(field: string) {
		const input = this.getInput(field);
		input.addEventListener("input", () => {
			this.manageLabelClass(input);
			this.hideErrorIfValid(field);
		});
		input.addEventListener("focusout", () => {
			this.showErrorIfInvalid(field);
			this.manageLabelClass(input);
		});
	}

	private handleFieldFocusOut(field: string) {
		const input = this.getInput(field);
		input.addEventListener("focusout", () => {
			this.manageLabelClass(input);
		});
	}

	private manageLabelClass = (input: HTMLInputElement) => {
		if (input.parentElement) {
			input.value.length > 0
				? input.parentElement.classList.add(
						inputFieldStyles.containValue as string,
					)
				: input.parentElement.classList.remove(
						inputFieldStyles.containValue as string,
					);
		}
	};
}
