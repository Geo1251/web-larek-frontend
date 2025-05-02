# Проектная работа "Веб-ларек"

Простой интернет-магазин, демонстрирующий работу с товарами, корзиной и оформлением заказа.

---

## Используемый стек

- **HTML** — разметка страниц.
- **SCSS** — стилизация приложения.
- **TypeScript** — типизированный JavaScript для разработки.
- **Webpack** — сборка проекта.
- **MVP (Model-View-Presenter)** — архитектурный паттерн, разделяющий логику приложения на три слоя: модель, представление и посредник.

---

## Структура проекта:

- `src/` — исходные файлы проекта
- `src/components/` — папка с JS компонентами
- `src/components/base/` — папка с базовым кодом (Api, EventEmitter)
- `src/model/` — папка с моделями данных (DataModel, CartModel, FormModel)
- `src/view/` — папка с компонентами представления (ProductCard, ProductPreview, ShoppingCart, OrderForm, ContactForm, OrderSuccess, ModalWindow, CartItem)
- `src/types/` — папка с типами TypeScript
- `src/utils/` — папка с утилитами и константами

### Важные файлы:

- `src/pages/index.html` — HTML-файл главной страницы
- `src/types/index.ts` — файл с типами
- `src/index.ts` — точка входа приложения (выполняет роль Presenter)
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — файл с константами
- `src/utils/utils.ts` — файл с утилитами

## Инструкция по сборке и запуску

### Установка зависимостей:

```bash
npm install
```

### Запуск проекта в режиме разработки:

```bash
npm run start
```

### Сборка проекта для продакшена:

```bash
npm run build
```

---

## Архитектура проекта

Проект реализован с использованием архитектурного паттерна **MVP (Model-View-Presenter)**. Логика приложения разделена на три основных слоя:

1. **Model** — отвечает за управление данными и бизнес-логику приложения. Включает состояние продуктов, корзины, форм заказа, а также взаимодействие с API. Модели не взаимодействуют напрямую с View. Модели генерируют события при изменении данных.
2. **View** — отвечает за отображение данных пользователю и обработку пользовательского ввода (интерфейс). View компоненты генерируют события при взаимодействии пользователя, но не содержат сложной логики и не хранят данные состояния.
3. **Presenter (Посредник)** — содержит логику приложения и связывает Model и View. В данном проекте роль посредника выполняет основной скрипт `index.ts`, который подписывается на события от View и Model, запрашивает/обновляет данные в Model и вызывает методы View для отображения изменений. Использует событийную модель (`EventEmitter`) для слабой связанности компонентов. Обрабатывает ошибки и решает, как их представить пользователю. Собирает данные из разных моделей для отправки через слой коммуникации.

### Основные компоненты архитектуры:

- **Данные (Model)**:
  - Управляют состоянием приложения.
  - Реализованы в классах: `DataModel` (продукты), `CartModel` (корзина), `FormModel` (данные форм заказа и валидация).
  - Генерируют события при изменении своих данных.
- **Представления (View)**:
  - Отвечают за отображение данных и генерацию событий пользовательского интерфейса.
  - Реализованы в классах: `ProductCard`, `ProductPreview`, `ShoppingCart`, `CartItem`, `OrderForm`, `ContactForm`, `OrderSuccess`, `ModalWindow`.
  - Не хранят данные состояния, получают их для отображения от Presenter.
  - Предоставляют методы для обновления своего отображения.
- **Посредник (Presenter)**:
  - Содержит основную логику приложения (`index.ts`).
  - Использует событийную модель (`EventEmitter`) для связи между Model и View. Подписывается на события, обрабатывает их, взаимодействует с моделями и обновляет представления.
  - Управляет счетчиком товаров в хедере.
- **Слой коммуникации**:
  - Отвечает за взаимодействие с внешними системами.
  - Реализован в классе `ApiModel`, который использует базовый `Api` для выполнения запросов. Не хранит состояние приложения.

---

## Описание базовых классов

### `EventEmitter`

- **Назначение:** Обеспечивает работу событийной модели. Позволяет компонентам подписываться на события и реагировать на них, не зная друг о друге напрямую.
- **Функции:**
  - Установка (`on`) и снятие (`off`) слушателей событий.
  - Вызов (`emit`) всех слушателей при возникновении события.
  - Возможность слушать все события (`onAll`).
  - Создание триггера (`trigger`) — функции, которая при вызове генерирует определенное событие.

### `Api`

- **Назначение:** Базовый класс для работы с HTTP API.
- **Функции:**
  - Отправка GET (`get`) и POST/PUT/DELETE (`post`) запросов.
  - Базовая обработка ответа (`handleResponse`), преобразование в JSON или отклонение Promise при ошибке.
  - Настройка базового URL и заголовков по умолчанию.

---

## Описание слоя коммуникации

### `ApiModel` (наследуется от `Api`)

- **Назначение:** Взаимодействие с API интернет-магазина. Не хранит данные приложения, а отвечает за их отправку и получение.
- **Поля:**
  - `cdnUrl: string` — базовый URL для изображений товаров.
- **Методы:**
  - `fetchProductCards(): Promise<IProductItem[]>` — получает список продуктов с сервера.
  - `submitOrder(order: IOrder): Promise<IOrderResult>` — отправляет данные заказа на сервер (ожидает объект типа `IOrder` с полями `paymentMethod`, `email`, `phone`, `address`, `totalAmount`, `productIds`).

---

## Описание моделей данных

### `DataModel`

- **Назначение:** Управление данными о продуктах.
- **Конструктор:**
  - `eventBus: IEvents` — объект для работы с событиями.
- **Поля:**
  - `_products: IProductItem[]` — приватный массив продуктов.
  - `activeProduct: IProductItem` — текущий выбранный продукт для детального просмотра.
- **Методы:**
  - `set products(data: IProductItem[])` — сохраняет список продуктов и генерирует событие `products:loaded`.
  - `get products()` — возвращает список продуктов.
  - `setActiveProduct(item: IProductItem)` — устанавливает активный продукт и генерирует событие `product:preview`.

### `CartModel`

- **Назначение:** Управление состоянием корзины покупок.
- **Конструктор:**
  - `eventBus: IEvents` — объект для работы с событиями.
- **Поля:**
  - `products: IProductItem[]` — массив продуктов в корзине.
- **Методы:**
  - `getProducts(): IProductItem[]` — возвращает _копию_ списка продуктов в корзине.
  - `getTotalCount(): number` — возвращает общее количество товаров (уникальных позиций).
  - `calculateTotalPrice(): number` — возвращает общую стоимость товаров.
  - `addProduct(product: IProductItem): void` — добавляет продукт в корзину (если его еще нет) и генерирует событие `cart:changed`.
  - `removeProduct(product: IProductItem): void` — удаляет продукт из корзины и генерирует событие `cart:changed`.
  - `clearCart(): void` — очищает корзину и генерирует событие `cart:changed`.

### `FormModel`

- **Назначение:** Управление состоянием и валидация данных форм заказа (адрес/оплата и контакты). Хранит только данные, вводимые пользователем в формы.
- **Конструктор:**
  - `eventBus: IEvents` — объект для работы с событиями.
- **Поля:**
  - `paymentMethod: string` — выбранный способ оплаты.
  - `contactEmail: string` — email пользователя.
  - `contactPhone: string` — телефон пользователя.
  - `deliveryAddress: string` — адрес доставки.
  - `validationErrors: FormValidationErrors` — объект с ошибками валидации.
- **Методы:**
  - `updateAddress(field: string, value: string): void` — обновляет поле адреса доставки, вызывает валидацию и генерирует `form:changed`.
  - `setPaymentMethod(method: string): void` — устанавливает способ оплаты, вызывает валидацию, генерирует `form:paymentChanged` и `form:changed`.
  - `validateAddress(): boolean` — проверяет валидность адреса и способа оплаты, _генерирует событие_ `validationErrors:address`. Возвращает `true`, если валидация прошла успешно, иначе `false`.
  - `updateContactInfo(field: string, value: string): void` — обновляет контактные данные, вызывает валидацию и генерирует `form:changed`.
  - `validateContactInfo(): boolean` — проверяет валидность контактных данных, _генерирует событие_ `validationErrors:contact`. Возвращает `true`, если валидация прошла успешно, иначе `false`.
  - `validateForms(): boolean` - вызывает валидацию обеих частей формы и возвращает `true` только если обе валидны. Генерирует `validationErrors:changed`.
  - `getValidationErrors(): FormValidationErrors` — возвращает текущие ошибки валидации.
  - `clearErrors(): void` — очищает все ошибки валидации.
  - `resetAddressForm(): void` - сбрасывает поля и ошибки формы адреса/оплаты.
  - `resetContactForm(): void` - сбрасывает поля и ошибки формы контактов.
  - `generateOrderBase(): Omit<IOrder, 'totalAmount' | 'productIds'>` — возвращает объект с текущими данными формы (без `totalAmount` и `productIds`).

---

## Описание компонентов представления (View)

(Все компоненты View принимают HTML-шаблон и `EventEmitter` в конструкторе)

### `ProductCard`

- **Назначение:** Отображение краткой информации о продукте на главной странице.
- **Конструктор:** Добавляет обработчик клика на корневой элемент, который генерирует событие `product:selected`.
- **Методы:** `render(data: IProductItem): HTMLElement` — заполняет шаблон данными.

### `ProductPreview` (наследуется от `ProductCard`)

- **Назначение:** Отображение подробной информации о выбранном продукте в модальном окне.
- **Конструктор:** Добавляет обработчик на кнопку действия, генерирующий событие `product:addToCart` только если кнопка активна.
- **Методы:**
  - `render(data: IProductItem): HTMLElement` — заполняет шаблон, включая описание. Управляет состоянием кнопки.
  - `setInCart(inCart: boolean): void` - устанавливает внутренний флаг и обновляет состояние кнопки.

### `ShoppingCart`

- **Назначение:** Отображение содержимого корзины покупок в модальном окне.
- **Конструктор:** Добавляет обработчик на кнопку "Оформить", генерирующий событие `order:open`.
- **Методы:**
  - `set items(items: HTMLElement[])` — обновляет список товаров в корзине. Отображает сообщение о пустой корзине. Управляет активностью кнопки "Оформить".
  - `updateTotalPrice(total: number): void` — обновляет отображение общей стоимости.
  - `set checkoutDisabled(isDisabled: boolean)` - управляет активностью кнопки "Оформить".
  - `render(): HTMLElement` — возвращает корневой элемент корзины.

### `CartItem`

- **Назначение:** Отображение одного товара в списке корзины.
- **Конструктор:** Добавляет обработчик на кнопку удаления, генерирующий событие `cart:removeItem`.
- **Методы:** `render(data: IProductItem, index: number): HTMLElement` — заполняет шаблон данными товара.

### `OrderForm`

- **Назначение:** Отображение формы выбора способа оплаты и ввода адреса доставки.
- **Конструктор:** Добавляет обработчики: на кнопки оплаты (`order:paymentMethodSelected`), на ввод адреса (`order:updateAddress`), на отправку формы (`submit`), которая генерирует событие `contact:open`.
- **Методы:**
  - `set selectedPaymentMethod(paymentMethod: string | null)` — визуально выделяет выбранный способ оплаты.
  - `set isValid(value: boolean)` — управляет активностью кнопки "Далее".
  - `displayErrors(errors: string[]): void` - отображает ошибки валидации.
  - `render(): HTMLElement` — сбрасывает форму, очищает ошибки и возвращает корневой элемент формы.

### `ContactForm`

- **Назначение:** Отображение формы ввода контактной информации.
- **Конструктор:** Добавляет обработчики: на ввод в поля (`contactForm:inputChange`), на отправку формы (`submit`), которая генерирует событие `order:complete`.
- **Методы:**
  - `set isValid(value: boolean)` — управляет активностью кнопки "Оплатить".
  - `displayErrors(errors: string[]): void` - отображает ошибки валидации.
  - `render(): HTMLElement` — сбрасывает форму, очищает ошибки и возвращает корневой элемент формы.

### `OrderSuccess`

- **Назначение:** Отображение сообщения об успешном оформлении заказа.
- **Конструктор:** Добавляет обработчик на кнопку закрытия, генерирующий событие `orderSuccess:close`.
- **Методы:**
  - `set total(total: number)` - устанавливает текст списания.
  - `render(totalAmount: number): HTMLElement` — заполняет шаблон суммой списания.

### `ModalWindow`

- **Назначение:** Управление отображением модальных окон.
- **Методы:**
  - `open(): void` — открывает модальное окно, генерирует событие `modal:open`.
  - `close(): void` — закрывает модальное окно, очищает контент, генерирует событие `modal:close`.
  - `set content(value: HTMLElement | null)` — устанавливает содержимое модального окна.
  - `render(): HTMLElement` — возвращает корневой элемент модального окна.

---

## Взаимодействие компонентов (Основные сценарии через Presenter - `index.ts`)

1. **Загрузка данных:** `index.ts` -> `ApiModel.fetchProductCards` -> `DataModel.products` -> `products:loaded` -> `index.ts` рендерит `ProductCard`.

2. **Выбор продукта:** Клик на `ProductCard` -> `product:selected` -> `index.ts` -> `DataModel.setActiveProduct` -> `index.ts` проверяет `cartModel`, вызывает `preview.setInCart`, рендерит `ProductPreview`, помещает в `ModalWindow`, вызывает `modal.open`.

3. **Добавление в корзину:** Клик на активную кнопку в `ProductPreview` -> `product:addToCart` -> `index.ts` проверяет `!isInCart`, вызывает `CartModel.addProduct` -> `modal.close`.

4. **Изменение корзины:** `CartModel` генерирует `cart:changed` -> `index.ts` ловит событие, обновляет счетчик в хедере, вызывает `cartView.items = ...`, `cartView.updateTotalPrice`, `cartView.checkoutDisabled`, обновляет кнопку в открытом `ProductPreview`.

5. **Открытие корзины:** Клик на `headerCartButton` -> `cart:open` -> `index.ts` вызывает `cartView.render`, помещает в `ModalWindow`, вызывает `modal.open`.

6. **Удаление из корзины:** Клик на кнопку в `CartItem` -> `cart:removeItem` -> `index.ts` вызывает `CartModel.removeProduct`.

7. **Начало оформления заказа:** Клик на "Оформить" в `ShoppingCart` -> `order:open` -> `index.ts` вызывает `formModel.resetAddressForm`, `formModel.clearErrors`, рендерит `OrderForm`, помещает в `ModalWindow`, вызывает `modal.open`.

8. **Заполнение формы заказа (Адрес и Оплата):**

   - Ввод/выбор -> События View (`order:paymentMethodSelected`, `order:updateAddress`) -> `index.ts` обновляет `FormModel` -> `FormModel` валидирует и генерирует `validationErrors:address` и `form:changed`.
   - `index.ts` ловит `validationErrors:address` -> обновляет ошибки и `isValid` в `OrderForm`.
   - `index.ts` ловит `form:changed` -> перепроверяет валидность и обновляет `isValid` в `OrderForm` и `ContactForm`.

9. **Переход к форме контактов:** Клик на "Далее" в `OrderForm` -> `contact:open` -> `index.ts` проверяет `formModel.validateAddress()`. Если валидно: вызывает `formModel.resetContactForm`, рендерит `ContactForm`, помещает в `ModalWindow`.

10. **Заполнение формы контактов:**

    - Ввод -> Событие View (`contactForm:inputChange`) -> `index.ts` обновляет `FormModel` -> `FormModel` валидирует и генерирует `validationErrors:contact` и `form:changed`.
    - `index.ts` ловит `validationErrors:contact` -> обновляет ошибки в `ContactForm`.
    - `index.ts` ловит `form:changed` -> перепроверяет валидность и обновляет `isValid` в `OrderForm` и `ContactForm`.

11. **Отправка заказа:**

    - Клик на "Оплатить" в `ContactForm` -> `order:complete` -> `index.ts` вызывает `formModel.validateForms()`. Если валидно:
    - `index.ts` получает данные из `FormModel`, `CartModel`, формирует `IOrder` (с `productIds` и `totalAmount`).
    - `index.ts` вызывает `ApiModel.submitOrder`.
    - **При успехе:** `index.ts` получает `IOrderResult`, рендерит `OrderSuccess`, помещает в `ModalWindow`, вызывает `CartModel.clearCart()`, `formModel.resetAddressForm()`, `formModel.resetContactForm()`.
    - **При ошибке:** `index.ts` ловит ошибку, отображает через `contactFormView.displayErrors`.

12. **Закрытие окна успеха:** Клик на кнопку в `OrderSuccess` -> `orderSuccess:close` -> `index.ts` вызывает `modal.close()`.

13. **Блокировка страницы:** `modal:open` -> `index.ts` добавляет класс `page__wrapper_locked` к `pageWrapper`. `modal:close` -> `index.ts` удаляет класс.

---

## Типы данных (`src/types/index.ts`)

### `IProductItem`

```typescript
interface IProductItem {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
}
```

### `IOrderForm` (Данные, управляемые `FormModel`)

```typescript
interface IOrderForm {
	paymentMethod?: string;
	deliveryAddress?: string;
	contactPhone?: string;
	contactEmail?: string;
}
```

### `IOrder` (Полные данные для отправки в API)

```typescript
interface IOrder {
	paymentMethod: string;
	deliveryAddress: string;
	contactPhone: string;
	contactEmail: string;
	productIds: string[];
	totalAmount: number;
}
```

### `IOrderResult` (Результат успешного заказа от API)

```typescript
interface IOrderResult {
	orderId: string;
	totalAmount: number;
}
```

### `FormValidationErrors` (Ошибки валидации)

```typescript
type FormValidationErrors = Partial<Record<keyof IOrder, string>>;
```

### `IActions` (Для передачи обработчиков в View)

```typescript
interface IActions {
	handleClick?: (event: MouseEvent) => void;
}
```
