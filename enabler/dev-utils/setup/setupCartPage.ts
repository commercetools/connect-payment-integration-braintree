import { cartPageId } from "../../src/constants";
import { createHeaderElement } from "../../src/helpers/elements";
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

const createCartPage = function () {
	const cartPage = document.getElementById(cartPageId);
	cartPage?.appendChild(createHeaderElement({ type: "h4", text: "Cart page" }));
};
