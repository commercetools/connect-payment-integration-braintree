import { exhaustiveMatchingGuard } from "../exhaustiveMatchingGuard";
import { Store } from "../Store";

type ACTION =
  | {
      type: "SET_CART_ID";
      cartId: string;
    }
  | {
      type: "REMOVE_CART_ID";
    };

const cartIdLocalStorageKey = "cartId";

const cartStore = new Store<string | undefined, ACTION>(
  (action, _, setState) => {
    switch (action.type) {
      case "SET_CART_ID":
        localStorage.setItem(cartIdLocalStorageKey, action.cartId);
        setState(action.cartId);
        break;
      case "REMOVE_CART_ID":
        localStorage.removeItem(cartIdLocalStorageKey);
        setState(undefined);
        break;
      default:
        exhaustiveMatchingGuard(action);
    }
  },
  localStorage.getItem(cartIdLocalStorageKey) ?? undefined
);

export default cartStore;
