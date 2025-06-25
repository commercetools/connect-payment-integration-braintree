import { cartPageId } from "../../src/constants";
import { cocoSessionStore } from "../../src/store";
import { tryUpdateSessionFromLocalStorage } from "../tryUpdateSessionFromLocalStorage";
import { setupCreateSessionIdFields } from "./setupCreateSessionFields";

export const setupCartPage = function () {
	tryUpdateSessionFromLocalStorage().then(() => {
		if (!cocoSessionStore.getSnapshot()?.id) {
			setupCreateSessionIdFields(cartPageId, createCartPage);
		} else {
			createCartPage();
		}
	});
};

const createCartPage = function () {};
