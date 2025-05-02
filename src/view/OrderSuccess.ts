import { IEvents } from '../components/base/events';
import { ensureElement } from '../utils/utils';

export interface IOrderSuccess {
	render(totalAmount: number): HTMLElement;
	set total(total: number);
}

export class OrderSuccess implements IOrderSuccess {
	protected successElement: HTMLElement;
	protected descriptionElement: HTMLElement;
	protected closeButton: HTMLButtonElement;

	constructor(template: HTMLTemplateElement, private eventBus: IEvents) {
		this.successElement = template.content
			.querySelector('.order-success')
			.cloneNode(true) as HTMLElement;
		this.descriptionElement = ensureElement<HTMLElement>(
			'.order-success__description',
			this.successElement
		);
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.successElement
		);

		this.closeButton.addEventListener('click', () => {
			this.eventBus.emit('orderSuccess:close');
		});
	}

	set total(total: number) {
		this.descriptionElement.textContent = `Списано ${total} синапсов`;
	}

	render(totalAmount: number): HTMLElement {
		this.total = totalAmount;
		return this.successElement;
	}
}
