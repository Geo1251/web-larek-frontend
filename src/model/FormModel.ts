import { IEvents } from '../components/base/events';
import { FormValidationErrors, IOrder } from '../types';

export interface IFormModel {
	paymentMethod: string;
	contactEmail: string;
	contactPhone: string;
	deliveryAddress: string;
	totalAmount: number;
	productIds: string[];
	updateAddress(field: string, value: string): void;
	setPaymentMethod(method: string): void;
	validateAddress(): boolean;
	updateContactInfo(field: string, value: string): void;
	validateContactInfo(): boolean;
	generateOrder(): IOrder;
	getValidationErrors(): FormValidationErrors;
	clearErrors(): void;
}

export class FormModel implements IFormModel {
	paymentMethod: string = '';
	contactEmail: string = '';
	contactPhone: string = '';
	deliveryAddress: string = '';
	totalAmount: number = 0;
	productIds: string[] = [];
	validationErrors: FormValidationErrors = {};

	constructor(protected eventBus: IEvents) {}

	clearErrors(): void {
		this.validationErrors = {};
	}

	getValidationErrors(): FormValidationErrors {
		return this.validationErrors;
	}

	updateAddress(field: string, value: string) {
		if (field === 'address') {
			this.deliveryAddress = value;
		}
		this.validateAddress();
	}

	setPaymentMethod(method: string) {
		this.paymentMethod = method;
		this.validateAddress();
	}

	validateAddress(): boolean {
		const addressRegex = /^[а-яА-ЯёЁa-zA-Z0-9\s\/.,-]{7,}$/;
		const errors: FormValidationErrors = {};

		if (!this.deliveryAddress) {
			errors.deliveryAddress = 'Адрес доставки обязателен';
		} else if (!addressRegex.test(this.deliveryAddress)) {
			errors.deliveryAddress = 'Введите корректный адрес (минимум 7 символов)';
		}
		if (!this.paymentMethod) {
			errors.paymentMethod = 'Выберите способ оплаты';
		}

		this.validationErrors = errors;
		this.eventBus.emit('validationErrors:address', this.validationErrors);
		return Object.keys(errors).length === 0;
	}

	updateContactInfo(field: string, value: string) {
		if (field === 'email') {
			this.contactEmail = value;
		} else if (field === 'phone') {
			this.contactPhone = value;
		}
		this.validateContactInfo();
	}

	validateContactInfo(): boolean {
		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		const phoneRegex = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{10}$/;
		const errors: FormValidationErrors = {};

		if (!this.contactEmail) {
			errors.contactEmail = 'Email обязателен';
		} else if (!emailRegex.test(this.contactEmail)) {
			errors.contactEmail = 'Некорректный email';
		}

		let normalizedPhone = this.contactPhone.replace(/[^0-9+]/g, '');
		if (normalizedPhone.startsWith('8')) {
			normalizedPhone = '+7' + normalizedPhone.slice(1);
		}

		if (!this.contactPhone) {
			errors.contactPhone = 'Телефон обязателен';
		} else if (!phoneRegex.test(normalizedPhone)) {
			errors.contactPhone =
				'Некорректный номер телефона (требуется 10 цифр после +7 или 8)';
		}

		this.validationErrors = errors;
		this.eventBus.emit('validationErrors:contact', this.validationErrors);
		return Object.keys(errors).length === 0;
	}

	generateOrder(): IOrder {
		return {
			paymentMethod: this.paymentMethod,
			contactEmail: this.contactEmail,
			contactPhone: this.contactPhone,
			deliveryAddress: this.deliveryAddress,
			totalAmount: this.totalAmount,
			productIds: this.productIds,
		};
	}
}
