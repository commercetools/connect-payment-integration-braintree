import { getConfig } from "./getConfig";
import { fetchAdminToken } from "./fetchAdminToken";
import { cocoSessionStore } from "../src/store";
import {
  ACTIVE_CART_COOKIE_KEY,
  COCO_SESSION_COOKIE_KEY,
  cookieHandler,
} from "./cookieHandling";
import type { Session } from "../src/store/stores/CoCoSessionStore";

const config = getConfig();

export const createSession = async (cartId: string): Promise<string> => {
  const accessToken = await fetchAdminToken();

  const sessionMetadata = {
    processorUrl: config.PROCESSOR_URL,
    allowedPaymentMethods: ["card", "invoice", "purchaseorder"], // add here your allowed methods for development purposes
  };

  const url = `${config.CTP_SESSION_URL}/${config.CTP_PROJECT_KEY}/sessions`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      cart: {
        cartRef: {
          id: cartId,
        },
      },
      metadata: sessionMetadata,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Not able to create session:", url, data);
    throw new Error("Not able to create session");
  }

  const currentCartId = cookieHandler.getCookie(ACTIVE_CART_COOKIE_KEY);
  if (currentCartId !== cartId) {
    cookieHandler.setCookie(ACTIVE_CART_COOKIE_KEY, cartId);
  }

  const session: Session = {
    id: data.id,
    expires: Date.now() + 1000 * 60 * 60,
    activeCart: {
      cartRef: {
        id: cartId,
      },
    },
  };

  console.log("Session created:", session);

  cookieHandler.setCookie(COCO_SESSION_COOKIE_KEY, JSON.stringify(session));

  cocoSessionStore.dispatch({
    type: "SET_SESSION",
    session,
  });

  return data.id;
};
