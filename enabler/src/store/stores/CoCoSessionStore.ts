import { createSession, removeSession } from "../actions/CoCoSessionActions";
import cartStore from "./CartStore";
import { Store } from "../Store";

type Session =
  | {
      id: string;
      activeCart: {
        cartRef: {
          id: string;
        };
      };
    }
  | undefined;

type Action = { type: "SET_SESSION"; session?: Session };

const cocoSession: string = localStorage.getItem("cocoSession") || "";
const initialState = cocoSession ? JSON.parse(cocoSession) : undefined;

const cocoSessionStore = new Store<Session, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_SESSION") {
      setState(action.session);
    }
  },
  initialState
);

cartStore.subscribe(() => {
  const cartId = cartStore.getSnapshot();
  if (cocoSessionStore.getSnapshot()?.activeCart?.cartRef?.id !== cartId) {
    if (!cartId && cocoSessionStore.getSnapshot()) {
      removeSession(cocoSessionStore.getSnapshot()!.id)
        .catch((e) => console.error(e))
        .finally(() => {
          localStorage.removeItem("cocoSession");
          cocoSessionStore.dispatch({
            type: "SET_SESSION",
            session: undefined,
          });
        });
    } else {
      createSession(cartId as string).then((session) => {
        localStorage.setItem("cocoSession", JSON.stringify(session));
        cocoSessionStore.dispatch({ type: "SET_SESSION", session: session });
      });
    }
  }
});

export default cocoSessionStore;
