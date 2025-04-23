import { IActions, IProductItem } from '../types';
import { IEvents } from '../components/base/events';

export interface ICartItem {
	cartItemElement: HTMLElement;
	itemIndex: HTMLElement;
	itemTitle: HTMLElement;
	itemPrice: HTMLElement;
	deleteButton: HTMLButtonElement;
	render(data: IProductItem, index: number): HTMLElement;
}

export class CartItem implements ICartItem {
	cartItemElement: HTMLElement;
	itemIndex: HTMLElement;
	itemTitle: HTMLElement;
	itemPrice: HTMLElement;
	deleteButton: HTMLButtonElement;

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		this.cartItemElement = template.content
			.querySelector('.basket__item')
			.cloneNode(true) as HTMLElement;
		this.itemIndex = this.cartItemElement.querySelector('.basket__item-index');
		this.itemTitle = this.cartItemElement.querySelector('.card__title');
		this.itemPrice = this.cartItemElement.querySelector('.card__price');
		this.deleteButton = this.cartItemElement.querySelector(
			'.basket__item-delete'
		);

		if (actions?.handleClick) {
			this.deleteButton.addEventListener('click', actions.handleClick);
		}
	}

	private formatPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProductItem, index: number): HTMLElement {
		this.itemIndex.textContent = String(index);
		this.itemTitle.textContent = data.title;
		this.itemPrice.textContent = this.formatPrice(data.price);
		return this.cartItemElement;
	}
}
