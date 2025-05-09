import { CookieHelpers } from "../src/helpers/CookieHelpers";
import { cocoSessionStore } from "../src/store";
import { createSession } from "./createSession";

export const tryUpdateSessionFromLocalStorage = async function () {
  const session = CookieHelpers.getSession();
  console.log(
    "tryUpdateSessionFromLocalStorage running, cache session: ",
    session
  );

  if (!session?.activeCart.cartRef.id) {
    return;
  }

  // if session expires within 5 minutes
  if (session.expires - Date.now() < 1000 * 60 * 5) {
    await createSession(session.activeCart.cartRef.id);
    return;
  }

  cocoSessionStore.dispatch({ type: "SET_SESSION", session });
  window.alert(
    `Session expires in ${(session.expires - Date.now()) / 1000} seconds.`
  );
};
