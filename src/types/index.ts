export interface IProductItem {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
}

export interface IActions {
	handleClick: (event: MouseEvent) => void;
}

export interface IOrderForm {
	paymentMethod?: string;
	deliveryAddress?: string;
	contactPhone?: string;
	contactEmail?: string;
	totalAmount?: string | number;
}

export interface IOrder extends IOrderForm {
	productIds: string[];
}

export interface IOrderLot {
	paymentMethod: string;
	contactEmail: string;
	contactPhone: string;
	deliveryAddress: string;
	totalAmount: number;
	productIds: string[];
}

export interface IOrderResult {
	orderId: string;
	totalAmount: number;
}

export type FormValidationErrors = Partial<Record<keyof IOrder, string>>;
