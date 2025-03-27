import { getConfig } from "./getConfig";

const config = getConfig();

const fetchAdminToken = async () => {
  const myHeaders = new Headers();

  myHeaders.append(
    "Authorization",
    `Basic ${btoa(
      `${config.VITE_CTP_CLIENT_ID}:${config.VITE_CTP_CLIENT_SECRET}`
    )}`
  );
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  var urlencoded = new URLSearchParams();
  urlencoded.append("grant_type", "client_credentials");
  //urlencoded.append('scope', __VITE_ADMIN_SCOPE__);

  const response = await fetch(`${config.VITE_CTP_AUTH_URL}/oauth/token`, {
    body: urlencoded,
    headers: myHeaders,
    method: "POST",
    redirect: "follow",
  });

  const token = await response.json();

  if (response.status !== 200) {
    console.log({
      title: "Token fetch failed",
      message: `Error ${response.status} while fetching token`,
    });
    return;
  } else {
    console.log({
      title: "Token fetched",
      message: `Token fetched: ${token.access_token}`,
    });
  }
  console.log("Token fetched:", token);
  return token.access_token;
};

export const getSessionId = async (cartId: string) => {
  const accessToken = await fetchAdminToken();

  const sessionMetadata = {
    processorUrl: config.VITE_PROCESSOR_URL,
    allowedPaymentMethods: ["card", "invoice", "purchaseorder"], // add here your allowed methods for development purposes
  };

  const url = `${config.VITE_CTP_SESSION_URL}/${config.VITE_CTP_PROJECT_KEY}/sessions`;

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
