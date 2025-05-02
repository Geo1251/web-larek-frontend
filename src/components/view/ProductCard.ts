import { IActions, IProductItem } from '../../types';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

export interface IProductCard {
	render(data: IProductItem): HTMLElement;
	id: string;
}

export class ProductCard implements IProductCard {
	protected cardElement: HTMLElement;
	protected categoryElement: HTMLElement;
	protected titleElement: HTMLElement;
	protected imageElement: HTMLImageElement;
	protected priceElement: HTMLElement;
	protected descriptionElement?: HTMLElement;

	readonly id: string;

	protected categoryStyles: Record<string, string> = {
		дополнительное: 'additional',
		'софт-скил': 'soft',
		кнопка: 'button',
		'хард-скил': 'hard',
		другое: 'other',
	};
	protected baseCategoryClass = 'card__category';
	protected currentCategoryModifier: string | null = null;

	constructor(
		template: HTMLTemplateElement,
		protected eventBus: IEvents,
		actions?: IActions
	) {
		this.cardElement = template.content
			.querySelector('.card')
			.cloneNode(true) as HTMLElement;
		this.categoryElement = ensureElement<HTMLElement>(
			'.card__category',
			this.cardElement
		);
		this.titleElement = ensureElement<HTMLElement>(
			'.card__title',
			this.cardElement
		);
		this.imageElement = ensureElement<HTMLImageElement>(
			'.card__image',
			this.cardElement
		);
		this.priceElement = ensureElement<HTMLElement>(
			'.card__price',
			this.cardElement
		);
		this.descriptionElement =
			this.cardElement.querySelector('.card__text') ?? undefined;
		this.id = '';

		if (actions?.handleClick) {
			this.cardElement.addEventListener('click', actions.handleClick);
		}
	}

	protected updateTextContent(
		element: HTMLElement | undefined,
		value: unknown
	): void {
		if (element) {
			element.textContent = String(value);
		}
	}

	protected setCategory(value: string): void {
		this.updateTextContent(this.categoryElement, value);
		const newModifier = this.categoryStyles[value];

		if (this.currentCategoryModifier) {
			this.categoryElement.classList.remove(
				`${this.baseCategoryClass}_${this.currentCategoryModifier}`
			);
		}

		if (newModifier) {
			this.categoryElement.classList.add(
				`${this.baseCategoryClass}_${newModifier}`
			);
			this.currentCategoryModifier = newModifier;
		} else {
			this.currentCategoryModifier = null;
		}
	}

	protected formatPrice(value: number | null): string {
		return value === null ? 'Бесценно' : `${value} синапсов`;
	}

	render(data: IProductItem): HTMLElement {
		(this as { id: string }).id = data.id;
		this.cardElement.dataset.id = data.id;

		this.setCategory(data.category);
		this.updateTextContent(this.titleElement, data.title);
		this.imageElement.src = data.image;
		this.imageElement.alt = data.title;
		this.updateTextContent(this.priceElement, this.formatPrice(data.price));
		if (this.descriptionElement) {
			this.updateTextContent(this.descriptionElement, data.description);
		}
		return this.cardElement;
	}
}
