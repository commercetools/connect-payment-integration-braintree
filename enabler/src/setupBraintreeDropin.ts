import { create } from "braintree-web-drop-in";
import { getConfig } from "../dev-utils/getConfig";

const config = getConfig();

export const setupBraintreeDropin = async function (
  accessToken: string,
  customerId: string
): Promise<void> {
  const submitButton = document.querySelector("#braintree-submit-button");

  if (!submitButton) {
    console.error();
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
      body: JSON.stringify({
        customerId,
      }),
    });
  } catch (error) {
    console.log("error: ", error);
    console.log("response: ", response);
  }

  const token: { clientToken: string } = await response.json();

  create(
    {
      authorization: token.clientToken,
      container: "#braintree-dropin-container",
    },
    function (error, dropinInstance) {
      if (error) {
        // Handle any errors that might've occurred when creating Drop-in
        console.error(error);
        return;
      }
      submitButton.addEventListener("click", function () {
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
