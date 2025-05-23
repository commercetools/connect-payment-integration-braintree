import { createSession, tryUpdateSessionFromLocalStorage } from "../dev-utils";
import {
	type CreateBraintreeCustomerRequest,
	createCustomer,
	deleteCustomer,
	findCustomer,
} from "../dev-utils/integrations/braintree/customer";
import { createCustomerFormElements } from "./createCustomerFormElements";
import {
	createCustomerFormId,
	customerPageId,
	submitCreateCustomerId,
} from "../src/constants";
import { cocoSessionStore } from "../src/store";
import {
	addLabelledInputToParent,
	createButtonElement,
	createHeaderElement,
} from "../src/helpers/elements";

export const __setup = function () {
	tryUpdateSessionFromLocalStorage().then(() => {
		if (!cocoSessionStore.getSnapshot()?.id) {
			createSessionIdFields();
		} else {
			createCustomerPage();
		}
	});
};

const createCustomerPage = function () {
	createCreateCustomerForm();
	createFindCustomerFields();
	createDeleteCustomerFields();
};

const createSessionIdFields = function () {
	const customerPage = document.getElementById(customerPageId);
	let sessionContainer = document.createElement("div");
	const sessionContainerId = "sessionContainer";
	sessionContainer.setAttribute("id", sessionContainerId);
	const cartIdInputId = "cartIdInput";

	sessionContainer = addLabelledInputToParent(
		{
			id: cartIdInputId,
			label: "Cart ID:",
			labelStyle: "margin-right: 5px",
		},
		sessionContainer,
	);

	const createSessionButton = createButtonElement({
		id: submitCreateCustomerId,
		value: "Create Session",
		onClick: async (event: MouseEvent) => {
			event.preventDefault();

			const cartId = (
				document.getElementById(cartIdInputId) as HTMLInputElement
			)?.value;
			if (!cartId) {
				window.alert("Cart Id missing");
				return;
			}

			createSession(cartId)
				.then(() => {
					const sessionContainer =
						document.getElementById(sessionContainerId);
					if (sessionContainer) {
						sessionContainer.innerHTML = "";
					}
					createCustomerPage();
				})
				.catch((error) => {
					window.alert(
						`There was an error creating the session: ${error}`,
					);
				});
		},
	});

	sessionContainer.appendChild(createSessionButton);
	customerPage?.appendChild(sessionContainer);
};

const createCreateCustomerForm = function () {
	const customerPage = document.getElementById(customerPageId);
	customerPage?.appendChild(
		createHeaderElement({ type: "h4", text: "Create Customer" }),
	);
	let createCustomerForm = document.createElement("form");
	createCustomerForm.setAttribute("id", createCustomerFormId);

	createCustomerFormElements.forEach((inputData) => {
		createCustomerForm = addLabelledInputToParent(
			inputData,
			createCustomerForm,
		);
	});

	const submitButton = createButtonElement({
		id: submitCreateCustomerId,
		value: "Create Customer",
		onClick: async (event: MouseEvent) => {
			event.preventDefault();

			let createCustomerBody: CreateBraintreeCustomerRequest = {
				firstName: "",
				lastName: "",
				email: "",
			};
			let missingRequiredParams: string[] = [];
			createCustomerFormElements.forEach((elementData) => {
				const element = document.getElementById(
					elementData.id,
				) as HTMLInputElement;
				if (!element) {
					console.error(
						`Element with id ${elementData.id} not found when creating customer`,
					);
					return;
				}
				if (!element.value) {
					if (!elementData.isOptional) {
						missingRequiredParams.push(elementData.id);
					}
					return;
				}
				createCustomerBody[
					elementData.parameterName ?? elementData.id
				] = element.value;
			});

			if (missingRequiredParams.length > 0) {
				console.error(
					`Cannot submit, missing required params ${missingRequiredParams.join(
						", ",
					)}`,
				);
				return;
			}

			const sessionId = cocoSessionStore.getSnapshot()?.id;
			if (!sessionId) {
				window.alert("Session not active");
				return;
			}

			const customer = await createCustomer(
				sessionId,
				createCustomerBody,
			);
			if (!customer) {
				window.alert("Create customer failed.");
				return;
			}

			window.alert(`Customer created, ID: ${customer.id}`);
		},
	});

	createCustomerForm.appendChild(submitButton);
	customerPage?.appendChild(createCustomerForm);
	customerPage?.appendChild(document.createElement("br"));
};

const createFindCustomerFields = function () {
	const customerPage = document.getElementById(customerPageId);
	let findCustomerContainer = document.createElement("div");
	findCustomerContainer?.appendChild(
		createHeaderElement({ type: "h4", text: "Find Customer" }),
	);

	const findCustomerInputId = "findCustomerInputId";

	findCustomerContainer = addLabelledInputToParent(
		{
			id: findCustomerInputId,
			label: "Customer ID:",
			labelStyle: "margin-right: 5px",
		},
		findCustomerContainer,
	);

	findCustomerContainer.appendChild(
		createButtonElement({
			id: submitCreateCustomerId,
			value: "Find Customer",
			onClick: async (event: MouseEvent) => {
				event.preventDefault();

				const customerId = (
					document.getElementById(
						findCustomerInputId,
					) as HTMLInputElement
				)?.value;
				if (!customerId) {
					window.alert("Customer Id missing");
					return;
				}

				const sessionId = cocoSessionStore.getSnapshot()?.id;
				if (!sessionId) {
					window.alert("Session not active");
					return;
				}

				const customer = await findCustomer(sessionId, {
					customerId: customerId,
				});
				if (!customer) {
					return;
				}
				window.alert(`Customer found, ID: ${customer.id}`);
			},
		}),
	);

	customerPage?.appendChild(findCustomerContainer);
	customerPage?.appendChild(document.createElement("br"));
};

const createDeleteCustomerFields = function () {
	const customerPage = document.getElementById(customerPageId);
	let deleteCustomerContainer = document.createElement("div");
	deleteCustomerContainer?.appendChild(
		createHeaderElement({ type: "h4", text: "Delete Customer" }),
	);

	const deleteCustomerInputId = "deleteCustomerInputId";

	deleteCustomerContainer = addLabelledInputToParent(
		{
			id: deleteCustomerInputId,
			label: "Customer ID:",
			labelStyle: "margin-right: 5px",
		},
		deleteCustomerContainer,
	);

	deleteCustomerContainer.appendChild(
		createButtonElement({
			id: submitCreateCustomerId,
			value: "Delete Customer",
			onClick: async (event: MouseEvent) => {
				event.preventDefault();

				const customerId = (
					document.getElementById(
						deleteCustomerInputId,
					) as HTMLInputElement
				)?.value;
				if (!customerId) {
					window.alert("Customer Id missing");
					return;
				}

				const sessionId = cocoSessionStore.getSnapshot()?.id;
				if (!sessionId) {
					window.alert("Session not active");
					return;
				}

				const successResponse = await deleteCustomer(sessionId, {
					customerId: customerId,
				});
				if (!successResponse) {
					window.alert(`Error deleting customer, ID: ${customerId}`);
					return;
				}
				window.alert(`Customer deleted, ID: ${customerId}`);
			},
		}),
	);

	customerPage?.appendChild(deleteCustomerContainer);
	customerPage?.appendChild(document.createElement("br"));
};
