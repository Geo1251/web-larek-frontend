import { ProductCard } from './ProductCard';
import { IActions, IProductItem } from '../types';
import { IEvents } from '../components/base/events';

export interface IProductPreview {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;
	render(data: IProductItem): HTMLElement;
}

export class ProductPreview extends ProductCard implements IProductPreview {
	descriptionElement: HTMLElement;
	actionButton: HTMLElement;

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		super(template, eventBus, actions);
		this.descriptionElement = this.cardElement.querySelector('.card__text');
		this.actionButton = this.cardElement.querySelector('.card__button');
		this.actionButton.addEventListener('click', () => {
			this.eventBus.emit('product:addToCart');
		});
	}

	private determineButtonState(data: IProductItem): string {
		if (data.price) {
			return 'Купить';
		} else {
			this.actionButton.setAttribute('disabled', 'true');
			return 'Не продается';
		}
	}

	render(data: IProductItem): HTMLElement {
		this.setCategory(data.category);
		this.updateTextContent(this.titleElement, data.title);
		this.imageElement.src = data.image;
		this.imageElement.alt = data.title;
		this.priceElement.textContent = this.formatPrice(data.price);
		this.descriptionElement.textContent = data.description;
		this.actionButton.textContent = this.determineButtonState(data);
		return this.cardElement;
	}
}
