import { IEvents } from '../components/base/events';

export interface IOrderForm {
	orderFormElement: HTMLFormElement;
	paymentButtons: HTMLButtonElement[];
	selectedPaymentMethod: string;
	errorContainer: HTMLElement;
	render(): HTMLElement;
}

export class OrderForm implements IOrderForm {
	orderFormElement: HTMLFormElement;
	paymentButtons: HTMLButtonElement[];
	submitButton: HTMLButtonElement;
	errorContainer: HTMLElement;
	protected _selectedPaymentMethod: string;

	constructor(template: HTMLTemplateElement, protected eventBus: IEvents) {
		this.orderFormElement = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this.paymentButtons = Array.from(
			this.orderFormElement.querySelectorAll('.button_alt')
		);
		this.submitButton = this.orderFormElement.querySelector('.order__button');
		this.errorContainer = this.orderFormElement.querySelector('.form__errors');

		if (!this.submitButton)
			console.error(
				"Submit button '.order__button' not found in OrderForm template!"
			);
		if (!this.errorContainer)
			console.error(
				"Error container '.form__errors' not found in OrderForm template!"
			);

		this.paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				eventBus.emit('order:paymentMethodSelected', button);
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

	set selectedPaymentMethod(paymentMethod: string) {
		this._selectedPaymentMethod = paymentMethod;
		this.paymentButtons.forEach((button) => {
			button.classList.toggle(
				'button_alt-active',
				button.name === paymentMethod
			);
		});
	}

	get selectedPaymentMethod(): string {
		return this._selectedPaymentMethod;
	}

	set isValid(value: boolean) {
		if (this.submitButton) {
			this.submitButton.disabled = !value;
		}
	}

	render(): HTMLElement {
		this.isValid = false;
		if (this.errorContainer) {
			this.errorContainer.textContent = '';
		}
		this.selectedPaymentMethod = '';
		return this.orderFormElement;
	}
}
