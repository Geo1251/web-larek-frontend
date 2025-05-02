import { IActions, IProductItem } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export interface ICartItem {
	render(data: IProductItem, index: number): HTMLElement;
	id: string;
}

export class CartItem implements ICartItem {
	protected cartItemElement: HTMLElement;
	protected itemIndex: HTMLElement;
	protected itemTitle: HTMLElement;
	protected itemPrice: HTMLElement;
	protected deleteButton: HTMLButtonElement;
	readonly id: string;

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		this.cartItemElement = template.content
			.querySelector('.basket__item')
			.cloneNode(true) as HTMLElement;
		this.itemIndex = ensureElement<HTMLElement>(
			'.basket__item-index',
			this.cartItemElement
		);
		this.itemTitle = ensureElement<HTMLElement>(
			'.card__title',
			this.cartItemElement
		);
		this.itemPrice = ensureElement<HTMLElement>(
			'.card__price',
			this.cartItemElement
		);
		this.deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			this.cartItemElement
		);
		this.id = '';

		if (actions?.handleClick) {
			this.deleteButton.addEventListener('click', (evt) => {
				actions.handleClick(evt);
			});
		} else {
			this.deleteButton.style.display = 'none';
		}
	}

	protected formatPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProductItem, index: number): HTMLElement {
		(this as { id: string }).id = data.id;
		this.cartItemElement.dataset.id = data.id;

		this.itemIndex.textContent = String(index + 1);
		this.itemTitle.textContent = data.title;
		this.itemPrice.textContent = this.formatPrice(data.price);
		return this.cartItemElement;
	}
}
