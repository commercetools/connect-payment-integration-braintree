/**
 * Represents the interface for a drop-in component.
 */
export interface DropinComponent {
	/**
	 * Submits the drop-in component.
	 */
	submit(): void;

	/**
	 * Mounts the drop-in component to the specified selector.
	 * @param selector - The selector where the drop-in component will be mounted.
	 */
	mount(selector: string): void;
}
