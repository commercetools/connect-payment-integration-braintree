import { getConfig } from "../dev-utils/getConfig";
import { customerFormElementsData } from "./customerFormElements";
import {
  createCustomerFormId,
  customerPageId,
  submitCreateCustomerId,
} from "../src/constants";
import { cocoSessionStore } from "../src/store";
import { createSession } from "../dev-utils/createSession";
import {
  addLabelledInputToParent,
  createButtonElement,
} from "../src/helpers/elements";

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
    sessionContainer
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
    },
  });

  sessionContainer.appendChild(createSessionButton);
  customerPage?.appendChild(sessionContainer);
};

const createCreateCustomerForm = function () {
  const customerPage = document.getElementById(customerPageId);
  let createCustomerForm = document.createElement("form");
  createCustomerForm.setAttribute("id", createCustomerFormId);

  customerFormElementsData.forEach((inputData) => {
    createCustomerForm = addLabelledInputToParent(
      inputData,
      createCustomerForm
    );
  });

  const submitButton = createButtonElement({
    id: submitCreateCustomerId,
    value: "Create Customer",
    onClick: async (event: MouseEvent) => {
      event.preventDefault();

      let createCustomerBody = {};
      let missingRequiredParams: string[] = [];
      customerFormElementsData.forEach((elementData) => {
        const element = document.getElementById(
          elementData.id
        ) as HTMLInputElement;
        if (!element) {
          console.error(
            `Element with id ${elementData.id} not found when creating customer`
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
    },
  });

  createCustomerForm.appendChild(submitButton);
  customerPage?.appendChild(createCustomerForm);
};
