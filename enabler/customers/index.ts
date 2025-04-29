import { getConfig } from "../dev-utils/getConfig";
import {
  customerFormElementsData,
  type SubsetInputData,
} from "./customerFormElements";
import {
  createCustomerFormId,
  customerPageId,
  submitCreateCustomerId,
} from "../src/constants";
import { cocoSessionStore } from "../src/store";
import { createSession } from "../dev-utils/createSession";

export const __setup = function () {
  createCustomerPage();
};

const createCustomerPage = function () {
  if (!cocoSessionStore.getSnapshot()?.id) {
    createSessionIdFields();
  } else {
    createCreateCustomerForm();
  }
};

const createSessionIdFields = function () {
  const customerPage = document.getElementById(customerPageId);
  const sessionContainer = document.createElement("div");
  const sessionContainerId = "sessionContainer";
  sessionContainer.setAttribute("id", sessionContainerId);
  const cartIdInputId = "cartIdInput";

  const cartIdInputLabel = createLabelElement({
    id: cartIdInputId,
    label: "Cart ID:",
    labelStyle: "margin-right: 5px",
  });

  const cartIdInput = createInputElement({
    id: cartIdInputId,
    value: "Submit",
  });

  const createSessionButton = createInputElement({
    id: submitCreateCustomerId,
    type: "submit",
    value: "Create Session",
  });

  createSessionButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const cartId = (document.getElementById(cartIdInputId) as HTMLInputElement)
      ?.value;
    if (!cartId) {
      window.alert("Cart Id missing");
      return;
    }

    createSession(cartId)
      .then((sessionId) => {
        window.alert(`Session created, ID: ${sessionId}`);
        const sessionContainer = document.getElementById(sessionContainerId);
        if (sessionContainer) {
          sessionContainer.innerHTML = "";
        }
        createCreateCustomerForm();
      })
      .catch((error) => {
        window.alert(`There was an error creating the session: ${error}`);
      });
  });

  sessionContainer.appendChild(cartIdInputLabel);
  sessionContainer.appendChild(cartIdInput);
  sessionContainer.appendChild(document.createElement("br"));
  sessionContainer.appendChild(createSessionButton);
  customerPage?.appendChild(sessionContainer);
};

const createCreateCustomerForm = function () {
  const customerPage = document.getElementById(customerPageId);
  const createCustomerForm = document.createElement("form");
  createCustomerForm.setAttribute("id", createCustomerFormId);

  customerFormElementsData.forEach((inputData) => {
    createCustomerForm.appendChild(createLabelElement(inputData));
    createCustomerForm.appendChild(createInputElement(inputData));
    createCustomerForm.appendChild(document.createElement("br"));
  });

  const submitButton = createInputElement({
    id: submitCreateCustomerId,
    type: "submit",
    value: "Submit",
  });

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    let createCustomerBody = {};
    let missingRequiredParams: string[] = [];
    customerFormElementsData.forEach((elementData) => {
      const element = document.getElementById(
        elementData.id
      ) as HTMLInputElement;
      if (!element) {
        console.error(
          `Element with id ${elementData.id} not found when creating cusetomer`
        );
        return;
      }
      if (!element.value) {
        if (!elementData.isOptional) {
          missingRequiredParams.push(elementData.id);
        }
        return;
      }
      createCustomerBody[elementData.parameterName ?? elementData.id] =
        element.value;
    });

    if (missingRequiredParams.length > 0) {
      console.error(
        `Cannot submit, missing required params ${missingRequiredParams.join(
          ", "
        )}`
      );
      return;
    }

    const sessionId = cocoSessionStore.getSnapshot()?.id;
    if (!sessionId) {
      window.alert("Session not active");
      return;
    }

    let response!: Response;
    try {
      response = await fetch(`${getConfig().PROCESSOR_URL}/customer/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId,
        },
        body: JSON.stringify(createCustomerBody),
      });

      const customer = await response.json();
      console.log("response: ", customer);
      window.alert(`Customer created, ID: ${customer.id}`);
    } catch (error) {
      console.log("error: ", error);
      console.log("response: ", response);
      return;
    }
  });

  createCustomerForm.appendChild(submitButton);
  customerPage?.appendChild(createCustomerForm);
};

// TODO refactor into project-level reusable methods
const createInputElement = function ({
  id,
  type = "text",
  inputStyle,
}: SubsetInputData): HTMLInputElement {
  const inputElement = document.createElement("input");
  if (id) {
    inputElement.setAttribute("id", id);
  }
  inputElement.setAttribute("type", type);
  if (inputStyle) {
    inputElement.setAttribute("style", inputStyle);
  }

  return inputElement;
};

// TODO refactor into project-level reusable methods
const createLabelElement = function ({
  id,
  label,
  labelStyle,
}: SubsetInputData): HTMLLabelElement {
  const labelElement = document.createElement("label");
  if (id) {
    labelElement.setAttribute("for", id);
  }
  if (labelStyle) {
    labelElement.setAttribute("style", labelStyle);
  }
  if (label) {
    labelElement.appendChild(document.createTextNode(label));
  }

  return labelElement;
};
