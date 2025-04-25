import { getConfig } from "../../../dev-utils/getConfig";

const config = getConfig();

export function createToken() {
  return fetch(`${config.CTP_AUTH_URL}/oauth/token`, {
    method: "POST",
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    headers: {
      authorization: `Basic ${btoa(
        `${import.meta.env.VITE_CTP_CLIENT_ID}:${
          import.meta.env.VITE_CTP_CLIENT_SECRET
        }`
      )}`,
    },
  }).then((res) => res.json());
}

export async function createSession(cartId: string) {
  const token = await createToken();
  return fetch(`${config.CTP_SESSION_URL}/${config.CTP_PROJECT_KEY}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify({
      cart: {
        cartRef: {
          id: cartId,
        },
      },
    }),
  }).then((r) => r.json());
}

export async function removeSession(sessionId: string) {
  const token = await createToken();
  return fetch(
    `${config.CTP_SESSION_URL}/${config.CTP_PROJECT_KEY}/sessions/${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token.access_token}`,
      },
      body: JSON.stringify({ actions: [{ action: "revoke" }] }),
    }
  ).then((r) => r.json());
}
