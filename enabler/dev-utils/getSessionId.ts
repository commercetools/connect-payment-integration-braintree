import { getConfig } from "./getConfig";
import { fetchAdminToken } from "./fetchAdminToken";

const config = getConfig();

export const getSessionId = async (cartId: string) => {
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

  console.log("Session created:", data);
  return data.id;
};
