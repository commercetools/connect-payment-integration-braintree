import { create } from "braintree-web-drop-in";
import { getConfig } from "../dev-utils/getConfig";

const config = getConfig();

const braintreeContainerId = "braintree-container";
const dropinContainerId = "braintree-dropin-container";
const purchaseButtonId = "braintree-submit-button";

export const setupBraintreeDropin = async function (
  accessToken: string
): Promise<void> {
  const dropinContainer = createDropinContainer();
  if (!dropinContainer) {
    console.error(
      "Error setting up Braintree dropin, couldn't create dropin container."
    );
    return;
  }

  let response!: Response;
  try {
    response = await fetch(`${config.PROCESSOR_URL}/init`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });
  } catch (error) {
    console.log("error: ", error);
    console.log("response: ", response);
  }

  const token: { clientToken: string } = await response.json();

  if (!token.clientToken) {
    console.error(
      "Couldn't create Braintree dropin container, client token is undefined"
    );
    return;
  }

  create(
    {
      authorization: token.clientToken,
      container: `#${dropinContainerId}`,
    },
    function (error, dropinInstance) {
      if (error) {
        // Handle any errors that might've occurred when creating Drop-in
        console.error(error);
        return;
      }

      const purchaseButton = createPurchaseButton();
      purchaseButton.addEventListener("click", function () {
        dropinInstance!.requestPaymentMethod(function (error, payload) {
          if (error) {
            console.error(error);
            // Handle errors in requesting payment method
          }
          console.log("success: ", payload);
          // Send payload.nonce to your server
        });
      });
    }
  );
};

const createDropinContainer = function (): Element | null {
  const braintreeContainer = document.getElementById(braintreeContainerId);
  if (!braintreeContainer) {
    console.error(
      `Couldn't find Braintree container with ID ${braintreeContainerId}.`
    );
    return null;
  }

  const dropinContainer = document.createElement("div");
  dropinContainer.setAttribute("id", dropinContainerId);
  braintreeContainer.appendChild(dropinContainer);

  return dropinContainer;
};

const createPurchaseButton = function (): Element {
  const braintreeContainer = document.getElementById(braintreeContainerId);
  const submitButton = document.createElement("button");

  submitButton.setAttribute("id", purchaseButtonId);
  submitButton.appendChild(document.createTextNode("Purchase"));
  braintreeContainer!.appendChild(submitButton);

  return submitButton;
};
