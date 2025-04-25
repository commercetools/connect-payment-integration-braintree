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

export const __setup = function () {
  createCustomerPage();
};

const createCustomerPage = function () {
  createCreateCustomerForm();
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

    let response!: Response;
    try {
      response = await fetch(`${getConfig().PROCESSOR_URL}/customer/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCustomerBody),
      });
    } catch (error) {
      console.log("error: ", error);
      console.log("response: ", response);
    }
    console.log("response: ", response);
  });

  createCustomerForm.appendChild(submitButton);
  customerPage?.appendChild(createCustomerForm);
};

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
