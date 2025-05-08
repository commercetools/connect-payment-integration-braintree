import {
  createSession,
  getConfig,
  tryUpdateSessionFromLocalStorage,
} from "../dev-utils";
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
          createCustomerPage();
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
  customerPage?.appendChild(
    createHeaderElement({ type: "h4", text: "Create Customer" })
  );
  let createCustomerForm = document.createElement("form");
  createCustomerForm.setAttribute("id", createCustomerFormId);

  createCustomerFormElements.forEach((inputData) => {
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
      createCustomerFormElements.forEach((elementData) => {
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
        console.log("Create customer error: ", error);
        console.log("Create customer response: ", response);
        return;
      }
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
    createHeaderElement({ type: "h4", text: "Find Customer" })
  );

  const findCustomerInputId = "findCustomerInputId";

  findCustomerContainer = addLabelledInputToParent(
    {
      id: findCustomerInputId,
      label: "Customer ID:",
      labelStyle: "margin-right: 5px",
    },
    findCustomerContainer
  );

  findCustomerContainer.appendChild(
    createButtonElement({
      id: submitCreateCustomerId,
      value: "Find Customer",
      onClick: async (event: MouseEvent) => {
        event.preventDefault();

        const customerId = (
          document.getElementById(findCustomerInputId) as HTMLInputElement
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

        let response!: Response;
        try {
          response = await fetch(`${getConfig().PROCESSOR_URL}/customer/find`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-Id": sessionId,
            },
            body: JSON.stringify({ customerId: customerId }),
          });

          const customer = await response.json();
          console.log("response: ", customer);
          window.alert(`Customer found, ID: ${customer.id}`);
        } catch (error) {
          console.log("Find customer error: ", error);
          console.log("Find customer response: ", response);
          return;
        }
      },
    })
  );

  customerPage?.appendChild(findCustomerContainer);
  customerPage?.appendChild(document.createElement("br"));
};

const createDeleteCustomerFields = function () {
  const customerPage = document.getElementById(customerPageId);
  let deleteCustomerContainer = document.createElement("div");
  deleteCustomerContainer?.appendChild(
    createHeaderElement({ type: "h4", text: "Delete Customer" })
  );

  const deleteCustomerInputId = "deleteCustomerInputId";

  deleteCustomerContainer = addLabelledInputToParent(
    {
      id: deleteCustomerInputId,
      label: "Customer ID:",
      labelStyle: "margin-right: 5px",
    },
    deleteCustomerContainer
  );

  deleteCustomerContainer.appendChild(
    createButtonElement({
      id: submitCreateCustomerId,
      value: "Delete Customer",
      onClick: async (event: MouseEvent) => {
        event.preventDefault();

        const customerId = (
          document.getElementById(deleteCustomerInputId) as HTMLInputElement
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

        let response!: Response;
        try {
          response = await fetch(
            `${getConfig().PROCESSOR_URL}/customer/delete`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Session-Id": sessionId,
              },
              body: JSON.stringify({ customerId: customerId }),
            }
          );
          if (response.ok) {
            window.alert(`Customer deleted, ID: ${customerId}`);
          } else {
            console.log("Delete customer response: ", response);
            window.alert(`Error deleting customer, ID: ${customerId}`);
          }
        } catch (error) {
          console.log("Delete customer error: ", error);
          console.log("Delete customer response: ", response);
          return;
        }
      },
    })
  );

  customerPage?.appendChild(deleteCustomerContainer);
  customerPage?.appendChild(document.createElement("br"));
};
