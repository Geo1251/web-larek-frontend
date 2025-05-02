import { IProductItem } from '../types';
import { IEvents } from '../components/base/events';

export interface ICartModel {
	getProducts(): IProductItem[];
	getTotalCount(): number;
	calculateTotalPrice(): number;
	addProduct(product: IProductItem): void;
	removeProduct(product: IProductItem): void;
	clearCart(): void;
}

export class CartModel implements ICartModel {
	private products: IProductItem[];

	constructor(protected eventBus: IEvents) {
		this.products = [];
	}

	getProducts(): IProductItem[] {
		return [...this.products];
	}

	getTotalCount(): number {
		return this.products.length;
	}

	calculateTotalPrice(): number {
		return this.products.reduce(
			(total, product) => total + (product.price || 0),
			0
		);
	}

	addProduct(product: IProductItem): void {
		if (!this.products.some((p) => p.id === product.id)) {
			this.products.push(product);
			this.eventBus.emit('cart:changed');
		}
	}

	removeProduct(product: IProductItem): void {
		const initialLength = this.products.length;
		this.products = this.products.filter((p) => p.id !== product.id);
		if (this.products.length < initialLength) {
			this.eventBus.emit('cart:changed');
		}
	}

	clearCart(): void {
		this.products = [];
		this.eventBus.emit('cart:changed');
	}
}
