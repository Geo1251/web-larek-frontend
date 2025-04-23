import { IProductItem } from '../types';

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

	constructor() {
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
		this.products.push(product);
	}

	removeProduct(product: IProductItem): void {
		this.products = this.products.filter((p) => p !== product);
	}

	clearCart(): void {
		this.products = [];
	}
}
