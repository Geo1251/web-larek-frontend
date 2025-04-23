import { IEvents } from '../components/base/events';

export interface IModalWindow {
	open(): void;
	close(): void;
	render(): HTMLElement;
}

export class ModalWindow implements IModalWindow {
	private modalElement: HTMLElement;
	private closeButton: HTMLButtonElement;
	private modalContent: HTMLElement;
	private pageWrapper: HTMLElement;

	constructor(modalElement: HTMLElement, private eventBus: IEvents) {
		this.modalElement = modalElement;
		this.closeButton = modalElement.querySelector('.modal__close');
		this.modalContent = modalElement.querySelector('.modal__content');
		this.pageWrapper = document.querySelector('.page__wrapper');

		this.closeButton.addEventListener('click', this.close.bind(this));
		this.modalElement.addEventListener('click', this.close.bind(this));
		this.modalElement
			.querySelector('.modal__container')
			.addEventListener('click', (event) => event.stopPropagation());
	}

	set content(value: HTMLElement | null) {
		if (value) {
			this.modalContent.replaceChildren(value);
		} else {
			this.modalContent.innerHTML = '';
		}
	}

	open(): void {
		this.modalElement.classList.add('modal_active');
		this.eventBus.emit('modal:open');
	}

	close(): void {
		this.modalElement.classList.remove('modal_active');
		this.content = null;
		this.eventBus.emit('modal:close');
	}

	set locked(value: boolean) {
		if (value) {
			this.pageWrapper.classList.add('page__wrapper_locked');
		} else {
			this.pageWrapper.classList.remove('page__wrapper_locked');
		}
	}

	render(): HTMLElement {
		this.open();
		return this.modalElement;
	}
}
