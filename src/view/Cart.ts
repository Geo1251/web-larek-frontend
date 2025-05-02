import { createElement, ensureElement } from '../utils/utils';
import { IEvents } from '../components/base/events';

export interface IShoppingCart {
	set items(items: HTMLElement[]);
	updateTotalPrice(total: number): void;
	set checkoutDisabled(isDisabled: boolean);
	render(): HTMLElement;
}

export class ShoppingCart implements IShoppingCart {
	protected cartContainer: HTMLElement;
	protected cartItemsList: HTMLElement;
	protected checkoutButton: HTMLButtonElement;
	protected totalPriceElement: HTMLElement;

	constructor(template: HTMLTemplateElement, protected eventBus: IEvents) {
		this.cartContainer = template.content
			.querySelector('.basket')
			.cloneNode(true) as HTMLElement;
		this.cartItemsList = ensureElement<HTMLElement>(
			'.basket__list',
			this.cartContainer
		);
		this.checkoutButton = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.cartContainer
		);
		this.totalPriceElement = ensureElement<HTMLElement>(
			'.basket__price',
			this.cartContainer
		);

		this.checkoutButton.addEventListener('click', () => {
			this.eventBus.emit('order:open');
		});
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.cartItemsList.replaceChildren(...items);
			this.checkoutDisabled = false;
		} else {
			this.checkoutDisabled = true;
			this.cartItemsList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Ваша корзина пуста',
				})
			);
		}
	}

	set checkoutDisabled(isDisabled: boolean) {
		if (this.checkoutButton) {
			this.checkoutButton.disabled = isDisabled;
		}
	}

	updateTotalPrice(total: number) {
		this.totalPriceElement.textContent = `${total} синапсов`;
	}

	render(): HTMLElement {
		return this.cartContainer;
	}
}
