import './scss/styles.scss';

import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { ApiModel } from './components/model/ApiModel';
import { DataModel } from './components/model/DataModel';
import { ProductCard } from './components/view/ProductCard';
import { ProductPreview } from './components/view/ProductPreview';
import {
	IProductItem,
	FormValidationErrors,
	IOrderResult,
	IOrder,
} from './types';
import { ModalWindow } from './components/view/ModalWindow';
import { ensureElement } from './utils/utils';
import { CartModel } from './components/model/CartModel';
import { ShoppingCart } from './components/view/Cart';
import { CartItem } from './components/view/CartItem';
import { FormModel } from './components/model/FormModel';
import { OrderForm } from './components/view/OrderForm';
import { ContactForm } from './components/view/ContactForm';
import { OrderSuccess } from './components/view/OrderSuccess';

const pageWrapper = ensureElement<HTMLElement>('.page__wrapper');
const galleryContainer = ensureElement<HTMLElement>('.gallery');
const headerCartButton = ensureElement<HTMLButtonElement>('.header__basket');
const headerCartCounter = ensureElement<HTMLElement>('.header__basket-counter');

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
const cartModel = new CartModel(eventBus);
const formModel = new FormModel(eventBus);

const modal = new ModalWindow(
	ensureElement<HTMLElement>('#modal-container'),
	eventBus
);

const cartView = new ShoppingCart(templates.cart, eventBus);
const orderFormView = new OrderForm(templates.orderForm, eventBus);
const contactFormView = new ContactForm(templates.contactForm, eventBus);
const orderSuccessView = new OrderSuccess(templates.orderComplete, eventBus);

eventBus.on('products:loaded', () => {
	galleryContainer.replaceChildren(
		...dataModel.products.map((product) => {
			const card = new ProductCard(templates.productCard, eventBus, {
				handleClick: () => eventBus.emit('product:selected', product),
			});
			return card.render(product);
		})
	);
});

eventBus.on('product:selected', (product: IProductItem) => {
	dataModel.setActiveProduct(product);
	const preview = new ProductPreview(templates.productPreview, eventBus);
	const isInCart = cartModel.getProducts().some((p) => p.id === product.id);
	preview.setInCart(isInCart);

	modal.content = preview.render(product);
	modal.open();
});

eventBus.on('product:addToCart', () => {
	const activeProduct = dataModel.activeProduct;
	const isInCart = activeProduct
		? cartModel.getProducts().some((p) => p.id === activeProduct.id)
		: true;

	if (activeProduct && activeProduct.price !== null && !isInCart) {
		cartModel.addProduct(activeProduct);
		modal.close();
	}
});

eventBus.on('cart:changed', () => {
	const productsInCart = cartModel.getProducts();
	const totalCount = cartModel.getTotalCount();
	const totalPrice = cartModel.calculateTotalPrice();

	headerCartCounter.textContent = String(totalCount);

	cartView.items = productsInCart.map((product, index) => {
		const cartItem = new CartItem(templates.cartItem, eventBus, {
			handleClick: () => eventBus.emit('cart:removeItem', product),
		});
		return cartItem.render(product, index);
	});
	cartView.updateTotalPrice(totalPrice);
	cartView.checkoutDisabled = totalCount === 0;

	const currentModalContent = modal.content;
	const activeProduct = dataModel.activeProduct;
	if (
		activeProduct &&
		currentModalContent?.classList.contains('card_full') &&
		currentModalContent.querySelector(`[data-id="${activeProduct.id}"]`)
	) {
		const isInCartNow = productsInCart.some((p) => p.id === activeProduct.id);
		const button = currentModalContent.querySelector(
			'.card__button'
		) as HTMLButtonElement;
		if (button) {
			if (isInCartNow) {
				button.textContent = 'Уже в корзине';
				button.disabled = true;
			} else if (activeProduct.price !== null) {
				button.textContent = 'Купить';
				button.disabled = false;
			} else {
				button.textContent = 'Недоступно';
				button.disabled = true;
			}
		}
	}
});

headerCartButton.addEventListener('click', () => {
	eventBus.emit('cart:open');
});
eventBus.on('cart:open', () => {
	modal.content = cartView.render();
	modal.open();
});

eventBus.on('cart:removeItem', (product: IProductItem) => {
	cartModel.removeProduct(product);
});

eventBus.on('order:open', () => {
	formModel.resetAddressForm();
	formModel.clearErrors();

	orderFormView.isValid = false;
	modal.content = orderFormView.render();
	modal.open();
});

eventBus.on(
	'order:paymentMethodSelected',
	(data: { paymentMethod: string }) => {
		formModel.setPaymentMethod(data.paymentMethod);
	}
);

eventBus.on('form:paymentChanged', (data: { paymentMethod: string }) => {
	orderFormView.selectedPaymentMethod = data.paymentMethod;
});

eventBus.on(
	'order:updateAddress',
	(data: { fieldName: string; fieldValue: string }) => {
		formModel.updateAddress(data.fieldName, data.fieldValue);
	}
);

eventBus.on('validationErrors:address', (errors: FormValidationErrors) => {
	orderFormView.displayErrors(Object.values(errors).filter(Boolean));
	const isOrderFormPartValid = !errors.deliveryAddress && !errors.paymentMethod;
	orderFormView.isValid = isOrderFormPartValid;
});

eventBus.on('contact:open', () => {
	if (!formModel.validateAddress()) {
		return;
	}
	formModel.resetContactForm();

	contactFormView.isValid = false;
	modal.content = contactFormView.render();
});

eventBus.on(
	'contactForm:inputChange',
	(data: { fieldName: string; fieldValue: string }) => {
		formModel.updateContactInfo(data.fieldName, data.fieldValue);
	}
);

eventBus.on('validationErrors:contact', (errors: FormValidationErrors) => {
	contactFormView.displayErrors(Object.values(errors).filter(Boolean));
	const isContactFormPartValid = !errors.contactEmail && !errors.contactPhone;
	contactFormView.isValid =
		formModel.validateAddress() && isContactFormPartValid;
});

eventBus.on('form:changed', () => {
	const isOrderFormValid = formModel.validateAddress();
	const isContactFormValid = formModel.validateContactInfo();
	orderFormView.isValid = isOrderFormValid;
	contactFormView.isValid = isOrderFormValid && isContactFormValid;
});

eventBus.on('order:complete', () => {
	if (!formModel.validateForms()) {
		contactFormView.displayErrors(
			Object.entries(formModel.getValidationErrors())
				.filter(([key]) => key === 'contactEmail' || key === 'contactPhone')
				.map(([, value]) => value)
				.filter(Boolean)
		);
		orderFormView.displayErrors(
			Object.entries(formModel.getValidationErrors())
				.filter(([key]) => key === 'deliveryAddress' || key === 'paymentMethod')
				.map(([, value]) => value)
				.filter(Boolean)
		);
		return;
	}

	const orderBase = formModel.generateOrderBase();
	const orderData: IOrder = {
		...orderBase,
		productIds: cartModel.getProducts().map((p) => p.id),
		totalAmount: cartModel.calculateTotalPrice(),
	};

	api
		.submitOrder(orderData)
		.then((response: IOrderResult) => {
			modal.content = orderSuccessView.render(response.totalAmount);
			cartModel.clearCart();

			formModel.resetAddressForm();
			formModel.resetContactForm();
			formModel.clearErrors();
		})
		.catch((error) => {
			let errorMessage = 'Произошла ошибка при оформлении заказа.';
			if (error && typeof error.error === 'string') {
				errorMessage = error.error;
			} else if (error instanceof Error) {
				errorMessage = error.message;
			}
			contactFormView.displayErrors([errorMessage]);
		});
});

eventBus.on('orderSuccess:close', () => modal.close());

eventBus.on('modal:open', () => {
	pageWrapper.classList.add('page__wrapper_locked');
});

eventBus.on('modal:close', () => {
	pageWrapper.classList.remove('page__wrapper_locked');
});

api
	.fetchProductCards()
	.then((data: IProductItem[]) => {
		dataModel.products = data;
	})
	.catch((error) => {
		console.error('Failed to fetch products:', error);
	});
