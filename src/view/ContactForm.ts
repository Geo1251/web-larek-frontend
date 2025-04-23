import { IEvents } from '../components/base/events';

export interface IContactForm {
	contactFormElement: HTMLFormElement;
	inputFields: HTMLInputElement[];
	submitButton: HTMLButtonElement;
	errorContainer: HTMLElement;
	render(): HTMLElement;
}

export class ContactForm implements IContactForm {
	contactFormElement: HTMLFormElement;
	inputFields: HTMLInputElement[];
	submitButton: HTMLButtonElement;
	errorContainer: HTMLElement;

	constructor(template: HTMLTemplateElement, private eventBus: IEvents) {
		this.contactFormElement = template.content
			.querySelector('.form')
			.cloneNode(true) as HTMLFormElement;
		this.inputFields = Array.from(
			this.contactFormElement.querySelectorAll('.form__input')
		);
		this.submitButton = this.contactFormElement.querySelector('.button');
		this.errorContainer =
			this.contactFormElement.querySelector('.form__errors');

		if (!this.submitButton)
			console.error(
				"Submit button '.button' not found in ContactForm template!"
			);
		if (!this.errorContainer)
			console.error(
				"Error container '.form__errors' not found in ContactForm template!"
			);

		this.inputFields.forEach((input) => {
			input.addEventListener('input', (event) => {
				const target = event.target as HTMLInputElement;
				if (target.name === 'email' || target.name === 'phone') {
					const fieldName = target.name;
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
		if (this.submitButton) {
			this.submitButton.disabled = !value;
		}
	}

	render(): HTMLElement {
		this.isValid = false;
		if (this.errorContainer) {
			this.errorContainer.textContent = '';
		}
		return this.contactFormElement;
	}
}
