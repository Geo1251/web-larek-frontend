import { ApiListResponse, Api } from '../base/api';
import { IOrder, IOrderResult, IProductItem } from '../../types';

interface IApiProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

interface IApiOrderSuccessResponse {
	id: string;
	total: number;
}

export interface IApiModel {
	cdnUrl: string;
	fetchProductCards(): Promise<IProductItem[]>;
	submitOrder(order: IOrder): Promise<IOrderResult>;
}

export class ApiModel extends Api implements IApiModel {
	readonly cdnUrl: string;

	constructor(cdnUrl: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdnUrl = cdnUrl;
	}

	fetchProductCards(): Promise<IProductItem[]> {
		return this.get('/product').then(
			(response: ApiListResponse<IApiProductItem>) =>
				response.items.map(
					(product) =>
						({
							id: product.id,
							title: product.title,
							description: product.description,
							image: this.cdnUrl + product.image,
							category: product.category,
							price: product.price,
						} as IProductItem)
				)
		);
	}

	submitOrder(order: IOrder): Promise<IOrderResult> {
		const orderDataForApi = {
			payment: order.paymentMethod,
			email: order.contactEmail,
			phone: order.contactPhone,
			address: order.deliveryAddress,
			total: order.totalAmount,
			items: order.productIds,
		};

		return this.post('/order', orderDataForApi).then(
			(response: IApiOrderSuccessResponse) => ({
				orderId: response.id,
				totalAmount: response.total,
			})
		);
	}
}
