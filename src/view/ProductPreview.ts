import { ProductCard, IProductCard } from './ProductCard';
import { IActions, IProductItem } from '../types';
import { IEvents } from '../components/base/events';
import { ensureElement } from '../utils/utils';

export interface IProductPreview extends IProductCard {
	set buttonText(text: string);
	disableButton(disabled: boolean): void;
	setInCart(inCart: boolean): void;
}

export class ProductPreview extends ProductCard implements IProductPreview {
	protected actionButton: HTMLButtonElement;
	protected _isInCart: boolean = false;

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		super(template, eventBus, actions);
		this.descriptionElement = ensureElement<HTMLElement>(
			'.card__text',
			this.cardElement
		);
		this.actionButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			this.cardElement
		);

		this.actionButton.addEventListener('click', (evt) => {
			evt.stopPropagation();
			if (!this.actionButton.disabled) {
				console.log(
					`Preview button clicked for product ${this.id}. Emitting product:addToCart.`
				);
				this.eventBus.emit('product:addToCart');
			} else {
				console.log(
					`Preview button click ignored for ${this.id} because button is disabled.`
				);
			}
		});
	}

	setInCart(inCart: boolean): void {
		this._isInCart = inCart;
		if (this.id) {
			const productData = {
				id: this.id,
				price: parseFloat(this.priceElement.textContent || '0') || null,
			} as IProductItem;
			this.determineButtonState(productData);
		}
	}

	set buttonText(text: string) {
		this.updateTextContent(this.actionButton, text);
	}

	disableButton(disabled: boolean): void {
		this.actionButton.disabled = disabled;
	}

	protected determineButtonState(data: IProductItem): void {
		if (this._isInCart) {
			this.buttonText = 'Уже в корзине';
			this.disableButton(true);
		} else if (data.price !== null) {
			this.buttonText = 'Купить';
			this.disableButton(false);
		} else {
			this.buttonText = 'Недоступно';
			this.disableButton(true);
		}
	}

	render(data: IProductItem): HTMLElement {
		super.render(data);
		this.updateTextContent(this.descriptionElement, data.description);
		this.determineButtonState(data);
		return this.cardElement;
	}
}
