import { devPageId } from "../../src/constants";
import { createHeaderElement } from "../../src/helpers/elements";
import { cocoSessionStore } from "../../src/store";
import { tryUpdateSessionFromLocalStorage } from "../tryUpdateSessionFromLocalStorage";
import { setupCreateSessionIdFields } from "./setupCreateSessionFields";

export const setupDevPage = function () {
	tryUpdateSessionFromLocalStorage().then(() => {
		if (!cocoSessionStore.getSnapshot()?.id) {
			setupCreateSessionIdFields(devPageId, createDevPage);
		} else {
			createDevPage();
		}
	});
};

const createDevPage = function () {
	const cartPage = document.getElementById(devPageId);
	cartPage?.appendChild(createHeaderElement({ type: "h4", text: "Dev page" }));
};
