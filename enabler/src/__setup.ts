import { BraintreePaymentEnabler } from "./payment-enabler";
import {
  createSession,
  getConfig,
  tryUpdateSessionFromLocalStorage,
} from "../dev-utils";
import { braintreeContainerId, createCheckoutButtonId } from "./constants";
import { cocoSessionStore } from "./store";
import {
  ACTIVE_CART_COOKIE_KEY,
  cookieHandler,
} from "../dev-utils/cookieHandling";

const config = getConfig();

export const __setup = function async(): void {
  document.addEventListener("DOMContentLoaded", async () => {
    await tryUpdateSessionFromLocalStorage();
    const accessToken = await getAccessToken();

    await setupPaymentMethods(accessToken);
    await createCheckout();
  });
};

const getAccessToken = async function (): Promise<string> {
  const tokenResponse = await fetch("http://localhost:9000/jwt/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      iss: "https://issuer.com",
      sub: "test-sub",
      "https://issuer.com/claims/project_key": `${config.CTP_PROJECT_KEY}`,
    }),
  });

  const accessToken = await tokenResponse.json();
  return accessToken.token;
};

const setupPaymentMethods = async function (
  accessToken: string
): Promise<void> {
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
    console.error(
      'Cannot populate payment method selection, select with ID "paymentMethod" not found.'
    );
  }
};

// type of processor SupportedPaymentComponentsSchemaDTO
type SupportedPaymentComponents = {
  dropins: {
    type: "embedded" | "hpp";
  }[];
  components: {
    subtypes?: string[] | undefined;
    type: string;
  }[];
};

const getPaymentMethods = async function (
  accessToken: string
): Promise<SupportedPaymentComponents> {
  const paymentMethodsResponse = await fetch(
    `${config.PROCESSOR_URL}/operations/payment-components`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  // type of processor SupportedPaymentComponentsSchemaDTO
  const paymentMethods: {
    dropins: {
      type: "embedded" | "hpp";
    }[];
    components: {
      subtypes?: string[] | undefined;
      type: string;
    }[];
  } = await paymentMethodsResponse.json();

  return paymentMethods;
};

const createCheckout = async function () {
  const cartIdInputId = "cartId";
  const cartId = cookieHandler.getCookie(ACTIVE_CART_COOKIE_KEY) as string;
  if (cartId) {
    (document.getElementById(cartIdInputId) as HTMLInputElement)!.value =
      cartId;
  }

  const createCheckoutButton = document.getElementById(createCheckoutButtonId);
  if (createCheckoutButton) {
    createCheckoutButton.addEventListener("click", async (event) => {
      event.preventDefault();
      const cartIdInput = document.getElementById(
        cartIdInputId
      ) as HTMLInputElement | null;
      if (!cartIdInput) {
        console.error(
          `Cannot get cart Id, input element with ID ${cartIdInputId} not found.`
        );
        return;
      }
      const cartId = cartIdInput.value;
      if (!cartId) {
        console.error("Cart ID field is empty.");
        return;
      }

      const currentActiveCartId = cookieHandler.getCookie(
        ACTIVE_CART_COOKIE_KEY
      ) as string;
      if (currentActiveCartId !== cartId) {
        cookieHandler.setCookie(ACTIVE_CART_COOKIE_KEY, cartId);
        tryUpdateSessionFromLocalStorage();
      }

      const session = cocoSessionStore.getSnapshot();
      let sessionId = session?.id ?? "";
      if (session?.activeCart.cartRef.id !== cartId) {
        sessionId = await createSession(cartId);
      }

      const paymentMethodSelect = document.getElementById(
        "paymentMethod"
      ) as HTMLSelectElement | null;
      if (!paymentMethodSelect) {
        console.error(
          'Cannot get payment method selection, select with ID "paymentMethod" not found.'
        );
        return;
      }
      const selectedPaymentMethod = paymentMethodSelect.value;

      const braintreeEnabler = new BraintreePaymentEnabler({
        processorUrl: config.PROCESSOR_URL,
        sessionId,
        currency: "EUR",
        onComplete: (result) => {
          console.log("onComplete", result);
        },
        onError: (err) => {
          console.error("onError", err);
        },
      });

      const builder = await braintreeEnabler.createComponentBuilder(
        selectedPaymentMethod
      );
      const component = await builder.build({
        showPayButton: !builder.componentHasSubmit,
        ...(builder.componentHasSubmit
          ? {}
          : {
              onPayButtonClick: async () => {
                // to be used for validation
                const termsChecked = (
                  document.getElementById("termsCheckbox") as HTMLInputElement
                )?.checked;
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
    console.error(
      'Cannot create checkout component, element with ID "createCheckout" not found.'
    );
  }
};
