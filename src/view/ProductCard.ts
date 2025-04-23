import { IActions, IProductItem } from '../types';
import { IEvents } from '../components/base/events';

export interface IProductCard {
	render(data: IProductItem): HTMLElement;
}

export class ProductCard implements IProductCard {
	protected cardElement: HTMLElement;
	protected categoryElement: HTMLElement;
	protected titleElement: HTMLElement;
	protected imageElement: HTMLImageElement;
	protected priceElement: HTMLElement;
	protected categoryStyles: Record<string, string> = {
		дополнительное: 'additional',
		'софт-скил': 'soft',
		кнопка: 'button',
		'хард-скил': 'hard',
		другое: 'other',
	};

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		this.cardElement = template.content
			.querySelector('.card')
			.cloneNode(true) as HTMLElement;
		this.categoryElement = this.cardElement.querySelector('.card__category');
		this.titleElement = this.cardElement.querySelector('.card__title');
		this.imageElement = this.cardElement.querySelector('.card__image');
		this.priceElement = this.cardElement.querySelector('.card__price');

		if (actions?.handleClick) {
			this.cardElement.addEventListener('click', actions.handleClick);
		}
	}

	protected updateTextContent(element: HTMLElement, value: unknown): void {
		if (element) {
			element.textContent = String(value);
		}
	}

	protected setCategory(value: string): void {
		this.updateTextContent(this.categoryElement, value);
		this.categoryElement.className = `card__category card__category_${this.categoryStyles[value]}`;
	}

	protected formatPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProductItem): HTMLElement {
		this.setCategory(data.category);
		this.updateTextContent(this.titleElement, data.title);
		this.imageElement.src = data.image;
		this.imageElement.alt = data.title;
		this.priceElement.textContent = this.formatPrice(data.price);
		return this.cardElement;
	}
}
