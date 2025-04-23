import { ApiListResponse, Api } from '../components/base/api';
import { IOrderLot, IOrderResult, IProductItem } from '../types';

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
	submitOrder(order: IOrderLot): Promise<IOrderResult>;
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

	submitOrder(order: IOrderLot): Promise<IOrderResult> {
		let apiPaymentMethod = '';
		if (order.paymentMethod === 'card') {
			apiPaymentMethod = 'online';
		} else if (order.paymentMethod === 'cash') {
			apiPaymentMethod = 'cash';
		} else {
			return Promise.reject(new Error('Не указан способ оплаты'));
		}

		const orderDataForApi = {
			payment: apiPaymentMethod,
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
