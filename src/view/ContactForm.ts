import { IEvents } from '../components/base/events';
import { ensureElement } from '../utils/utils';

export interface IContactForm {
	render(): HTMLElement;
	set isValid(value: boolean);
	displayErrors(errors: string[]): void;
	email: string;
	phone: string;
}

export class ContactForm implements IContactForm {
	protected contactFormElement: HTMLFormElement;
	protected inputFields: HTMLInputElement[];
	protected submitButton: HTMLButtonElement;
	protected errorContainer: HTMLElement;

	constructor(template: HTMLTemplateElement, private eventBus: IEvents) {
		this.contactFormElement = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this.inputFields = Array.from(
			this.contactFormElement.querySelectorAll('.form__input')
		);
		this.submitButton = ensureElement<HTMLButtonElement>(
			'.button',
			this.contactFormElement
		);
		this.errorContainer = ensureElement<HTMLElement>(
			'.form__errors',
			this.contactFormElement
		);

		this.inputFields.forEach((input) => {
			input.addEventListener('input', (event) => {
				const target = event.target as HTMLInputElement;
				const fieldName = target.name as 'email' | 'phone';
				if (fieldName === 'email' || fieldName === 'phone') {
					const fieldValue = target.value;
					this.eventBus.emit('contactForm:inputChange', {
						fieldName,
						fieldValue,
					});
				}
			});
		});

		this.contactFormElement.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.eventBus.emit('order:complete');
		});
	}

	set isValid(value: boolean) {
		this.submitButton.disabled = !value;
	}

	get email(): string {
		return (
			this.inputFields.find((input) => input.name === 'email')?.value || ''
		);
	}

	get phone(): string {
		return (
			this.inputFields.find((input) => input.name === 'phone')?.value || ''
		);
	}

	displayErrors(errors: string[]): void {
		this.errorContainer.textContent = errors.join('; ');
	}

	render(): HTMLElement {
		this.isValid = false;
		this.displayErrors([]);
		this.contactFormElement.reset();
		return this.contactFormElement;
	}
}
