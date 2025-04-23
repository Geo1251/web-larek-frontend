import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ApiModel } from './model/ApiModel';
import { DataModel } from './model/DataModel';
import { ProductCard } from './view/ProductCard';
import { ProductPreview } from './view/ProductPreview';
import { IProductItem, FormValidationErrors, IOrderResult } from './types';
import { ModalWindow } from './view/ModalWindow';
import { ensureElement } from './utils/utils';
import { CartModel } from './model/CartModel';
import { ShoppingCart } from './view/Cart';
import { CartItem } from './view/CartItem';
import { FormModel } from './model/FormModel';
import { OrderForm } from './view/OrderForm';
import { ContactForm } from './view/ContactForm';
import { OrderSuccess } from './view/OrderSuccess';

const templates = {
	productCard: ensureElement<HTMLTemplateElement>('#card-catalog'),
	productPreview: ensureElement<HTMLTemplateElement>('#card-preview'),
	cart: ensureElement<HTMLTemplateElement>('#basket'),
	cartItem: ensureElement<HTMLTemplateElement>('#card-basket'),
	orderForm: ensureElement<HTMLTemplateElement>('#order'),
	contactForm: ensureElement<HTMLTemplateElement>('#contacts'),
	orderComplete: ensureElement<HTMLTemplateElement>('#success'),
};

const api = new ApiModel(CDN_URL, API_URL);
const eventBus = new EventEmitter();
const dataModel = new DataModel(eventBus);
const modal = new ModalWindow(
	ensureElement<HTMLElement>('#modal-container'),
	eventBus
);
const cart = new ShoppingCart(templates.cart, eventBus);
const cartModel = new CartModel();
const formModel = new FormModel(eventBus);
const orderForm = new OrderForm(templates.orderForm, eventBus);
const contactForm = new ContactForm(templates.contactForm, eventBus);

eventBus.on('products:loaded', () => {
	const gallery = ensureElement<HTMLElement>('.gallery');
	gallery.innerHTML = '';
	dataModel.products.forEach((product) => {
		const card = new ProductCard(templates.productCard, eventBus, {
			handleClick: () => eventBus.emit('product:selected', product),
		});
		gallery.append(card.render(product));
	});
});

eventBus.on('product:selected', (product: IProductItem) => {
	dataModel.setActiveProduct(product);
	const preview = new ProductPreview(templates.productPreview, eventBus);
	modal.content = preview.render(product);
	modal.open();
});

eventBus.on('product:addToCart', () => {
	const activeProduct = dataModel.activeProduct;
	if (activeProduct && activeProduct.price !== null) {
		cartModel.addProduct(activeProduct);
		cart.updateCartCounter(cartModel.getTotalCount());
		modal.close();
	}
});

eventBus.on('cart:open', () => {
	cart.updateTotalPrice(cartModel.calculateTotalPrice());
	let index = 0;
	cart.cartItems = cartModel.getProducts().map((product) => {
		const cartItem = new CartItem(templates.cartItem, eventBus, {
			handleClick: () => eventBus.emit('cart:removeItem', product),
		});
		index++;
		return cartItem.render(product, index);
	});
	modal.content = cart.render();
	cart.checkoutButton.disabled = cartModel.getTotalCount() === 0;
	modal.open();
});

eventBus.on('cart:removeItem', (product: IProductItem) => {
	cartModel.removeProduct(product);
	cart.updateCartCounter(cartModel.getTotalCount());
	const newTotal = cartModel.calculateTotalPrice();
	cart.updateTotalPrice(newTotal);
	let index = 0;
	cart.cartItems = cartModel.getProducts().map((p) => {
		const cartItem = new CartItem(templates.cartItem, eventBus, {
			handleClick: () => eventBus.emit('cart:removeItem', p),
		});
		index++;
		return cartItem.render(p, index);
	});
	cart.checkoutButton.disabled = cartModel.getTotalCount() === 0;
});

eventBus.on('order:open', () => {
	formModel.clearErrors();
	formModel.productIds = cartModel.getProducts().map((product) => product.id);
	const initialErrors = formModel.getValidationErrors();
	orderForm.isValid = Object.keys(initialErrors).length === 0;
	if (orderForm.errorContainer) {
		orderForm.errorContainer.textContent = '';
	}
	modal.content = orderForm.render();
	modal.open();
});

eventBus.on('order:paymentMethodSelected', (button: HTMLButtonElement) => {
	formModel.setPaymentMethod(button.name);
	orderForm.selectedPaymentMethod = button.name;
});

eventBus.on(
	'order:updateAddress',
	(data: { fieldName: string; fieldValue: string }) => {
		formModel.updateAddress(data.fieldName, data.fieldValue);
	}
);

eventBus.on('validationErrors:address', (errors: FormValidationErrors) => {
	const isValid = Object.keys(errors).length === 0;
	orderForm.isValid = isValid;
	orderForm.errorContainer.textContent = Object.values(errors)
		.filter(Boolean)
		.join('; ');
});

eventBus.on('contact:open', () => {
	if (!formModel.validateAddress()) {
		return;
	}
	formModel.clearErrors();
	formModel.totalAmount = cartModel.calculateTotalPrice();
	const initialErrors = formModel.getValidationErrors();
	contactForm.isValid = Object.keys(initialErrors).length === 0;
	if (contactForm.errorContainer) {
		contactForm.errorContainer.textContent = '';
	}
	modal.content = contactForm.render();
});

eventBus.on(
	'contactForm:inputChange',
	(data: { fieldName: string; fieldValue: string }) => {
		formModel.updateContactInfo(data.fieldName, data.fieldValue);
	}
);

eventBus.on('validationErrors:contact', (errors: FormValidationErrors) => {
	const isValid = Object.keys(errors).length === 0;
	contactForm.isValid = isValid;
	contactForm.errorContainer.textContent = Object.values(errors)
		.filter(Boolean)
		.join('; ');
});

eventBus.on('order:complete', () => {
	if (!formModel.validateContactInfo()) {
		return;
	}
	const orderData = formModel.generateOrder();
	api
		.submitOrder(orderData)
		.then((response: IOrderResult) => {
			const success = new OrderSuccess(templates.orderComplete, eventBus);
			modal.content = success.render(response.totalAmount);
			cartModel.clearCart();
			cart.updateCartCounter(cartModel.getTotalCount());
		})
		.catch((error) => {
			let errorMessage = 'Произошла ошибка при оформлении заказа.';
			if (error instanceof Error) {
				errorMessage = `Ошибка заказа: ${error.message}`;
			} else if (typeof error === 'string') {
				errorMessage = `Ошибка заказа: ${error}`;
			} else if (
				typeof error === 'object' &&
				error !== null &&
				'error' in error &&
				typeof error.error === 'string'
			) {
				errorMessage = `Ошибка заказа: ${error.error}`;
			} else {
				console.error('Unknown error structure:', error);
			}

			if (contactForm.errorContainer) {
				contactForm.errorContainer.textContent = errorMessage;
			} else {
				console.error(
					'Fallback error display (contactForm.errorContainer not found):',
					errorMessage
				);
			}
		});
});

eventBus.on('orderSuccess:close', () => modal.close());

eventBus.on('modal:open', () => {
	modal.locked = true;
});

eventBus.on('modal:close', () => {
	modal.locked = false;
});

api
	.fetchProductCards()
	.then((data: IProductItem[]) => {
		dataModel.products = data;
	})
	.catch((error) => {
		console.error('Failed to fetch products:', error);
	});
