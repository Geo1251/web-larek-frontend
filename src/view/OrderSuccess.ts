import { IEvents } from '../components/base/events';

export interface IOrderSuccess {
	successElement: HTMLElement;
	descriptionElement: HTMLElement;
	closeButton: HTMLButtonElement;
	render(totalAmount: number): HTMLElement;
}

export class OrderSuccess implements IOrderSuccess {
	successElement: HTMLElement;
	descriptionElement: HTMLElement;
	closeButton: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, private eventBus: IEvents) {
		this.successElement = template.content
			.querySelector('.order-success')
			.cloneNode(true) as HTMLElement;
		this.descriptionElement = this.successElement.querySelector(
			'.order-success__description'
		);
		this.closeButton = this.successElement.querySelector(
			'.order-success__close'
		);

		this.closeButton.addEventListener('click', () => {
			this.eventBus.emit('orderSuccess:close');
		});
	}

	render(totalAmount: number): HTMLElement {
		this.descriptionElement.textContent = `Списано ${totalAmount} синапсов`;
		return this.successElement;
	}
}
