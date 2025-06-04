/**
 * Represents the payment drop-in types.
 */
export enum DropinType {
	/*
	 * The embedded drop-in type which is rendered within the page.
	 */
	embedded = "embedded",
	/*
	 * The hosted payment page (HPP) drop-in type which redirects the user to a hosted payment page.
	 */
	hpp = "hpp",
}
