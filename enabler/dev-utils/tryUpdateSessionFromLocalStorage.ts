import { cocoSessionStore } from "../src/store";
import type { Session } from "../src/store/stores/CoCoSessionStore";
import {
  cookieHandler,
  ACTIVE_CART_COOKIE_KEY,
  COCO_SESSION_COOKIE_KEY,
} from "./cookieHandling";
import { createSession } from "./createSession";

export const tryUpdateSessionFromLocalStorage = async function () {
  const activeCartId = cookieHandler.getCookie(
    ACTIVE_CART_COOKIE_KEY
  ) as string;

  if (!activeCartId) {
    return;
  }

  let sessionCookieString = cookieHandler.getCookie(
    COCO_SESSION_COOKIE_KEY
  ) as string;

  const session: Session = sessionCookieString
    ? JSON.parse(sessionCookieString)
    : undefined;

  // if session doesn't exist or expires within 5 minutes
  if (!session || session.expires - Date.now() > 1000 * 60 * 5) {
    await createSession(activeCartId);
    return;
  }

  cocoSessionStore.dispatch({ type: "SET_SESSION", session });
};
