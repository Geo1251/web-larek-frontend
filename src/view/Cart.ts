import { createElement } from '../utils/utils';
import { IEvents } from '../components/base/events';

export interface IShoppingCart {
	cartContainer: HTMLElement;
	cartTitle: HTMLElement;
	cartItemsList: HTMLElement;
	checkoutButton: HTMLButtonElement;
	totalPriceElement: HTMLElement;
	headerCartButton: HTMLButtonElement;
	headerCartCounter: HTMLElement;
	updateCartCounter(value: number): void;
	updateTotalPrice(total: number): void;
	render(): HTMLElement;
}

export class ShoppingCart implements IShoppingCart {
	cartContainer: HTMLElement;
	cartTitle: HTMLElement;
	cartItemsList: HTMLElement;
	checkoutButton: HTMLButtonElement;
	totalPriceElement: HTMLElement;
	headerCartButton: HTMLButtonElement;
	headerCartCounter: HTMLElement;

	constructor(template: HTMLTemplateElement, protected eventBus: IEvents) {
		this.cartContainer = template.content
			.querySelector('.basket')
			.cloneNode(true) as HTMLElement;
		this.cartTitle = this.cartContainer.querySelector('.modal__title');
		this.cartItemsList = this.cartContainer.querySelector('.basket__list');
		this.checkoutButton = this.cartContainer.querySelector('.basket__button');
		this.totalPriceElement = this.cartContainer.querySelector('.basket__price');
		this.headerCartButton = document.querySelector('.header__basket');
		this.headerCartCounter = document.querySelector('.header__basket-counter');

		this.checkoutButton.addEventListener('click', () => {
			this.eventBus.emit('order:open');
		});
		this.headerCartButton.addEventListener('click', () => {
			this.eventBus.emit('cart:open');
		});

		this.cartItems = [];
	}

	set cartItems(items: HTMLElement[]) {
		if (items.length) {
			this.cartItemsList.replaceChildren(...items);
			this.checkoutButton.removeAttribute('disabled');
		} else {
			this.checkoutButton.setAttribute('disabled', 'disabled');
			this.cartItemsList.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Ваша корзина пуста',
				})
			);
		}
	}

	updateCartCounter(value: number) {
		this.headerCartCounter.textContent = String(value);
	}

	updateTotalPrice(total: number) {
		this.totalPriceElement.textContent = `${total} синапсов`;
	}

	render() {
		this.cartTitle.textContent = 'Корзина покупок';
		return this.cartContainer;
	}
}
