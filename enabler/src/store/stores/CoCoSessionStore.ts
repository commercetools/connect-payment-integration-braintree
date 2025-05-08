import { Store } from "../Store";

export type Session =
  | {
      id: string;
      expires: number;
      activeCart: {
        cartRef: {
          id: string;
        };
      };
    }
  | undefined;

type Action = { type: "SET_SESSION"; session?: Session };

const cocoSessionStore = new Store<Session, Action>(
  (action, _state, setState) => {
    if (action.type === "SET_SESSION") {
      setState(action.session);
    }
  },
  undefined
);

export default cocoSessionStore;
