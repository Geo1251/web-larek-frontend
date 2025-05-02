import { IEvents } from '../components/base/events';
import { FormValidationErrors, IOrder } from '../types';

export interface IFormModel {
	paymentMethod: string;
	contactEmail: string;
	contactPhone: string;
	deliveryAddress: string;
	updateAddress(field: string, value: string): void;
	setPaymentMethod(method: string): void;
	validateAddress(): boolean;
	updateContactInfo(field: string, value: string): void;
	validateContactInfo(): boolean;
	generateOrderBase(): Omit<IOrder, 'totalAmount' | 'productIds'>;
	getValidationErrors(): FormValidationErrors;
	clearErrors(): void;
	validateForms(): boolean;
	resetAddressForm(): void;
	resetContactForm(): void;
}

export class FormModel implements IFormModel {
	paymentMethod: string = '';
	contactEmail: string = '';
	contactPhone: string = '';
	deliveryAddress: string = '';
	validationErrors: FormValidationErrors = {};

	constructor(protected eventBus: IEvents) {}

	resetAddressForm() {
		this.paymentMethod = '';
		this.deliveryAddress = '';
		delete this.validationErrors.paymentMethod;
		delete this.validationErrors.deliveryAddress;
	}

	resetContactForm() {
		this.contactEmail = '';
		this.contactPhone = '';
		delete this.validationErrors.contactEmail;
		delete this.validationErrors.contactPhone;
	}

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
		this.eventBus.emit('form:changed');
	}

	setPaymentMethod(method: string) {
		this.paymentMethod = method;
		this.validateAddress();
		this.eventBus.emit('form:paymentChanged', {
			paymentMethod: this.paymentMethod,
		});
		this.eventBus.emit('form:changed');
	}

	validateAddress(): boolean {
		const addressRegex = /^[a-zA-Zа-яА-ЯёЁ0-9\s.,\-/]+$/;
		const errors: FormValidationErrors = {};

		if (!this.deliveryAddress) {
			errors.deliveryAddress = 'Адрес доставки обязателен';
		} else if (
			this.deliveryAddress.trim() === '' ||
			!addressRegex.test(this.deliveryAddress.trim())
		) {
			errors.deliveryAddress = 'Адрес содержит недопустимые символы';
		}
		if (!this.paymentMethod) {
			errors.paymentMethod = 'Выберите способ оплаты';
		}

		this.validationErrors = {
			...this.validationErrors,
			paymentMethod: errors.paymentMethod,
			deliveryAddress: errors.deliveryAddress,
		};
		if (!errors.paymentMethod) delete this.validationErrors.paymentMethod;
		if (!errors.deliveryAddress) delete this.validationErrors.deliveryAddress;

		this.eventBus.emit('validationErrors:address', errors);
		return Object.keys(errors).length === 0;
	}

	updateContactInfo(field: string, value: string) {
		if (field === 'email') {
			this.contactEmail = value;
		} else if (field === 'phone') {
			this.contactPhone = value;
		}
		this.validateContactInfo();
		this.eventBus.emit('form:changed');
	}

	validateContactInfo(): boolean {
		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		const phoneRegex = /^\+7\d+$/;
		const errors: FormValidationErrors = {};

		if (!this.contactEmail) {
			errors.contactEmail = 'Email обязателен';
		} else if (!emailRegex.test(this.contactEmail)) {
			errors.contactEmail = 'Некорректный email';
		}

		if (!this.contactPhone) {
			errors.contactPhone = 'Телефон обязателен';
		} else if (!phoneRegex.test(this.contactPhone)) {
			errors.contactPhone = 'Некорректный телефон';
		}

		this.validationErrors = {
			...this.validationErrors,
			contactEmail: errors.contactEmail,
			contactPhone: errors.contactPhone,
		};
		if (!errors.contactEmail) delete this.validationErrors.contactEmail;
		if (!errors.contactPhone) delete this.validationErrors.contactPhone;

		this.eventBus.emit('validationErrors:contact', errors);
		return Object.keys(errors).length === 0;
	}

	validateForms(): boolean {
		const addressValid = this.validateAddress();
		const contactValid = this.validateContactInfo();
		this.eventBus.emit('validationErrors:changed', this.validationErrors);
		return addressValid && contactValid;
	}

	generateOrderBase(): Omit<IOrder, 'totalAmount' | 'productIds'> {
		return {
			paymentMethod: this.paymentMethod,
			contactEmail: this.contactEmail,
			contactPhone: this.contactPhone,
			deliveryAddress: this.deliveryAddress,
		};
	}
}
