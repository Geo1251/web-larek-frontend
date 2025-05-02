import { IProductItem } from '../../types';
import { IEvents } from '../base/events';

export interface IDataModel {
	products: IProductItem[];
	activeProduct: IProductItem;
	setActiveProduct(item: IProductItem): void;
}

export class DataModel implements IDataModel {
	private _products: IProductItem[];
	activeProduct: IProductItem;

	constructor(private eventBus: IEvents) {
		this._products = [];
	}

	set products(data: IProductItem[]) {
		this._products = data;
		this.eventBus.emit('products:loaded');
	}

	get products() {
		return this._products;
	}

	setActiveProduct(item: IProductItem) {
		this.activeProduct = item;
		this.eventBus.emit('product:preview', item);
	}
}
