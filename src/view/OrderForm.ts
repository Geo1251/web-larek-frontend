import { IEvents } from '../components/base/events';
import { ensureElement } from '../utils/utils';

export interface IOrderFormView {
	render(): HTMLElement;
	set isValid(value: boolean);
	set selectedPaymentMethod(paymentMethod: string | null);
	displayErrors(errors: string[]): void;
	address: string;
}

export class OrderForm implements IOrderFormView {
	protected orderFormElement: HTMLFormElement;
	protected paymentButtons: HTMLButtonElement[];
	protected submitButton: HTMLButtonElement;
	protected errorContainer: HTMLElement;
	protected addressInput: HTMLInputElement;

	constructor(template: HTMLTemplateElement, protected eventBus: IEvents) {
		this.orderFormElement = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this.paymentButtons = Array.from(
			this.orderFormElement.querySelectorAll('.button_alt')
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'.order__button',
			this.orderFormElement
		);
		this.errorContainer = ensureElement<HTMLElement>(
			'.form__errors',
			this.orderFormElement
		);
		this.addressInput = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			this.orderFormElement
		);

		this.paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				eventBus.emit('order:paymentMethodSelected', {
					paymentMethod: button.name,
				});
			});
		});

		this.orderFormElement.addEventListener('input', (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (target.name === 'address') {
				const fieldName = target.name;
				const fieldValue = target.value;
				this.eventBus.emit('order:updateAddress', { fieldName, fieldValue });
			}
		});

		this.orderFormElement.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.eventBus.emit('contact:open');
		});
	}

	set selectedPaymentMethod(paymentMethod: string | null) {
		this.paymentButtons.forEach((button) => {
			button.classList.toggle(
				'button_alt-active',
				button.name === paymentMethod
			);
		});
	}

	get address(): string {
		return this.addressInput.value;
	}

	set isValid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	displayErrors(errors: string[]): void {
		this.errorContainer.textContent = errors.join('; ');
	}

	render(): HTMLElement {
		this.isValid = false;
		this.displayErrors([]);
		this.selectedPaymentMethod = null;
		this.orderFormElement.reset();
		return this.orderFormElement;
	}
}
