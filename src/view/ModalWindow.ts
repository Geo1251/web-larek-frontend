import { IEvents } from '../components/base/events';
import { ensureElement } from '../utils/utils';

export interface IModalWindow {
	content: HTMLElement | null;
	open(): void;
	close(): void;
	render(): HTMLElement;
}

export class ModalWindow implements IModalWindow {
	protected modalElement: HTMLElement;
	protected closeButton: HTMLButtonElement;
	protected modalContent: HTMLElement;

	constructor(modalElement: HTMLElement, private eventBus: IEvents) {
		this.modalElement = modalElement;
		this.closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.modalElement
		);
		this.modalContent = ensureElement<HTMLElement>(
			'.modal__content',
			this.modalElement
		);

		this.closeButton.addEventListener('click', this.close.bind(this));
		this.modalElement.addEventListener(
			'click',
			this.handleOverlayClick.bind(this)
		);
		ensureElement<HTMLElement>(
			'.modal__container',
			this.modalElement
		).addEventListener('click', (event) => event.stopPropagation());
	}

	protected handleOverlayClick(event: MouseEvent) {
		if (event.target === this.modalElement) {
			this.close();
		}
	}

	set content(value: HTMLElement | null) {
		if (value) {
			this.modalContent.replaceChildren(value);
		} else {
			this.modalContent.innerHTML = '';
		}
	}

	get content(): HTMLElement | null {
		return this.modalContent.firstElementChild as HTMLElement | null;
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

	render(): HTMLElement {
		return this.modalElement;
	}
}
