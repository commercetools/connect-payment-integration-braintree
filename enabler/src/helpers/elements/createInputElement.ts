export type InputElementData = {
	id?: string;
	type?: string;
	style?: string;
};

export const createInputElement = function ({ id, type = "text", style }: InputElementData): HTMLInputElement {
	const inputElement = document.createElement("input");
	if (id) {
		inputElement.setAttribute("id", id);
	}
	inputElement.setAttribute("type", type);
	if (style) {
		inputElement.setAttribute("style", style);
	}

	return inputElement;
};
