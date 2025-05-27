import { BraintreePaymentEnabler } from "../../src/payment-enabler";
import { createSession, fetchAccessToken, getConfig, tryUpdateSessionFromLocalStorage } from "..";
import { braintreeContainerId, createCheckoutButtonId } from "../../src/constants";
import { cocoSessionStore } from "../../src/store";
import { getPaymentMethods } from "../../src/integrations/braintree/operations";

const config = getConfig();

export const setupIndex = function async(): void {
	document.addEventListener("DOMContentLoaded", async () => {
		await tryUpdateSessionFromLocalStorage();
		const accessToken = await fetchAccessToken();

		await setupPaymentMethods(accessToken);
		await createCheckout();
	});
};

const setupPaymentMethods = async function (accessToken: string): Promise<void> {
	const paymentMethodSelect = document.getElementById("paymentMethod");

	if (paymentMethodSelect) {
		const paymentMethods = await getPaymentMethods(accessToken);
		paymentMethods.components.forEach((component) => {
			const option = document.createElement("option");
			option.value = component.type;
			option.textContent = component.type;
			paymentMethodSelect.appendChild(option);
		});
	} else {
		console.error('Cannot populate payment method selection, select with ID "paymentMethod" not found.');
	}
};

const createCheckout = async function () {
	const cartIdInputId = "cartId";
	const cartId = cocoSessionStore.getSnapshot()?.activeCart.cartRef.id;
	if (cartId) {
		(document.getElementById(cartIdInputId) as HTMLInputElement)!.value = cartId;
	}

	const createCheckoutButton = document.getElementById(createCheckoutButtonId);
	if (createCheckoutButton) {
		createCheckoutButton.addEventListener("click", async (event) => {
			event.preventDefault();
			const cartIdInput = document.getElementById(cartIdInputId) as HTMLInputElement | null;
			if (!cartIdInput) {
				console.error(`Cannot get cart Id, input element with ID ${cartIdInputId} not found.`);
				return;
			}
			const cartId = cartIdInput.value;
			if (!cartId) {
				console.error("Cart ID field is empty.");
				return;
			}

			let session = cocoSessionStore.getSnapshot();
			if (session?.activeCart.cartRef.id !== cartId) {
				await createSession(cartId);
				session = cocoSessionStore.getSnapshot();
			}

			const paymentMethodSelect = document.getElementById("paymentMethod") as HTMLSelectElement | null;
			if (!paymentMethodSelect) {
				console.error('Cannot get payment method selection, select with ID "paymentMethod" not found.');
				return;
			}
			const selectedPaymentMethod = paymentMethodSelect.value;

			const braintreeEnabler = new BraintreePaymentEnabler({
				processorUrl: config.PROCESSOR_URL,
				sessionId: session!.id,
				currency: "EUR",
				onComplete: (result) => {
					console.log("onComplete", result);
				},
				onError: (err) => {
					console.error("onError", err);
				},
			});

			const builder = await braintreeEnabler.createComponentBuilder(selectedPaymentMethod);
			const component = await builder.build({
				showPayButton: !builder.componentHasSubmit,
				...(builder.componentHasSubmit
					? {}
					: {
							onPayButtonClick: async () => {
								// to be used for validation
								const termsChecked = (document.getElementById("termsCheckbox") as HTMLInputElement)
									?.checked;
								if (!termsChecked) {
									event.preventDefault();
									alert("You must agree to the terms and conditions.");
									return Promise.reject("error-occurred");
								}
								return Promise.resolve(); // change to true, to test payment flow
							},
						}),
			});

			component.mount(braintreeContainerId);
		});
	} else {
		console.error('Cannot create checkout component, element with ID "createCheckout" not found.');
	}
};
