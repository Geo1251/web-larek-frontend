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
- `src/components/base/` — папка с базовым кодом (Api, EventEmitter, Component)
- `src/model/` — папка с моделями данных (DataModel, CartModel, FormModel, ApiModel)
- `src/view/` — папка с компонентами представления (ProductCard, ProductPreview, ShoppingCart, OrderForm, ContactForm, OrderSuccess, ModalWindow, CartItem)
- `src/types/` — папка с типами TypeScript
- `src/utils/` — папка с утилитами и константами

### Важные файлы:

- `src/pages/index.html` — HTML-файл главной страницы
- `src/types/index.ts` — файл с типами
- `src/index.ts` — точка входа приложения (выполняет роль Presenter)
- `src/scss/styles.scss` — корневой файл стилей
- `src/utils/constants.ts` — файл с константами (URL API, CDN)
- `src/utils/utils.ts` — файл с утилитами (например, `ensureElement`)

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

1.  **Model** — отвечает за управление данными и бизнес-логику приложения. Включает состояние продуктов, корзины, форм заказа, а также взаимодействие с API. Модели не взаимодействуют напрямую с View.
2.  **View** — отвечает за отображение данных пользователю и обработку пользовательского ввода (интерфейс). View компоненты генерируют события при взаимодействии пользователя, но не содержат сложной логики.
3.  **Presenter (Посредник)** — содержит логику приложения и связывает Model и View. В данном проекте роль посредника выполняет основной скрипт `index.ts`, который подписывается на события от View и Model, запрашивает/обновляет данные в Model и вызывает методы View для отображения изменений. Использует событийную модель (`EventEmitter`) для слабой связанности компонентов. Обрабатывает ошибки (например, от API) и решает, как их представить пользователю.

### Основные компоненты архитектуры:

- **Данные (Model):**
  - Управляют состоянием приложения и взаимодействуют с внешним API.
  - Реализованы в классах: `ApiModel` (запросы к API), `DataModel` (продукты), `CartModel` (корзина), `FormModel` (формы заказа и валидация).
- **Представления (View):**
  - Отвечают за отображение данных и генерацию событий пользовательского интерфейса.
  - Реализованы в классах: `ProductCard`, `ProductPreview`, `ShoppingCart`, `CartItem`, `OrderForm`, `ContactForm`, `OrderSuccess`, `ModalWindow`. Наследуются от базового `Component` для удобства работы с DOM.
- **Посредник (Presenter):**
  - Содержит основную логику приложения (`index.ts`).
  - Использует событийную модель (`EventEmitter`) для связи между Model и View. Подписывается на события, обрабатывает их, взаимодействует с моделями и обновляет представления.

---

## Описание базовых классов

### `EventEmitter`

- **Назначение:** Обеспечивает работу событийной модели (шаблон Observer). Позволяет компонентам подписываться на события и реагировать на них, не зная друг о друге напрямую.
- **Функции:**
  - Установка (`on`) и снятие (`off`) слушателей событий.
  - Вызов (`emit`) всех слушателей при возникновении события.
  - Возможность слушать все события (`onAll`) или по шаблону (RegExp).
  - Создание триггера (`trigger`) — функции, которая при вызове генерирует определенное событие.

### `Api`

- **Назначение:** Базовый класс для работы с HTTP API.
- **Функции:**
  - Отправка GET (`get`) и POST/PUT/DELETE (`post`) запросов.
  - Базовая обработка ответа (`handleResponse`), преобразование в JSON или отклонение Promise при ошибке.
  - Настройка базового URL и заголовков по умолчанию.

### `Component` (не описан в оригинале, но часто используется как база для View)

- **Назначение:** Базовый класс для компонентов представления (View).
- **Функции:**
  - Инкапсулирует работу с корневым DOM-элементом компонента.
  - Предоставляет общие методы для рендеринга, обновления текстового содержимого, управления классами, установки атрибутов и т.д. (например, `setText`, `toggleClass`, `setImage`).

---

## Описание моделей данных

### `ApiModel` (наследуется от `Api`)

- **Назначение:** Взаимодействие с API интернет-магазина.
- **Поля:**
  - `cdnUrl: string` — базовый URL для изображений товаров.
- **Методы:**
  - `fetchProductCards(): Promise<IProductItem[]>` — получает список продуктов с сервера.
  - `submitOrder(order: IOrder): Promise<IOrderResult>` — отправляет данные заказа на сервер.

### `DataModel`

- **Назначение:** Управление данными о продуктах.
- **Конструктор:**
  - `eventBus: IEvents` — объект для работы с событиями.
- **Поля:**
  - `_products: IProductItem[]` — приватный массив продуктов.
  - `activeProduct: IProductItem` — текущий выбранный продукт для детального просмотра.
- **Методы:**
  - `set products(data: IProductItem[])` — сохраняет список продуктов и генерирует событие `products:loaded`.
  - `get products()` — возвращает *копию* списка продуктов.
  - `setActiveProduct(item: IProductItem)` — устанавливает активный продукт и генерирует событие `product:preview`.

### `CartModel`

- **Назначение:** Управление состоянием корзины покупок.
- **Поля:**
  - `products: IProductItem[]` — массив продуктов в корзине.
- **Методы:**
  - `getProducts(): IProductItem[]` — возвращает *копию* списка продуктов в корзине.
  - `getTotalCount(): number` — возвращает общее количество товаров (уникальных позиций).
  - `calculateTotalPrice(): number` — возвращает общую стоимость товаров.
  - `addProduct(product: IProductItem): void` — добавляет продукт в корзину (если его еще нет).
  - `removeProduct(product: IProductItem): void` — удаляет продукт из корзины.
  - `clearCart(): void` — очищает корзину.
  - `isProductInCart(product: IProductItem): boolean` — проверяет, есть ли товар в корзине.

### `FormModel`

- **Назначение:** Управление состоянием и валидация данных форм заказа (адрес/оплата и контакты).
- **Поля:**
  - `paymentMethod: string` — выбранный способ оплаты.
  - `contactEmail: string` — email пользователя.
  - `contactPhone: string` — телефон пользователя.
  - `deliveryAddress: string` — адрес доставки.
  - `totalAmount: number` — общая сумма заказа (устанавливается извне).
  - `productIds: string[]` — массив ID продуктов (устанавливается извне).
  - `validationErrors: FormValidationErrors` — объект с ошибками валидации.
- **Методы:**
  - `updateAddress(field: string, value: string): void` — обновляет адрес доставки, запускает валидацию адреса.
  - `setPaymentMethod(method: string): void` — устанавливает способ оплаты, запускает валидацию адреса.
  - `validateAddress(): boolean` — проверяет валидность адреса и способа оплаты, *генерирует событие* `validationErrors:address`.
  - `updateContactInfo(field: string, value: string): void` — обновляет контактные данные, запускает валидацию контактов.
  - `validateContactInfo(): boolean` — проверяет валидность контактных данных, *генерирует событие* `validationErrors:contact`.
  - `generateOrder(): IOrder` — собирает все данные для формирования объекта заказа.
  - `getValidationErrors(): FormValidationErrors` — возвращает текущие ошибки валидации.
  - `clearErrors(): void` — очищает ошибки валидации.

---

## Описание компонентов представления (View)

(Все компоненты View принимают шаблон и `EventEmitter` в конструкторе)

### `ProductCard`

- **Назначение:** Отображение краткой информации о продукте на главной странице.
- **Поля:** Элементы разметки для категории, названия, изображения, цены.
- **Методы:** `render(data: IProductItem): HTMLElement` — заполняет шаблон данными и возвращает готовый DOM-элемент. Добавляет обработчик клика, генерирующий событие `product:selected`.

### `ProductPreview` (наследуется от `ProductCard`)

- **Назначение:** Отображение подробной информации о выбранном продукте в модальном окне.
- **Поля:** Добавляются элементы для описания и кнопки действия ("В корзину" / "Не продается").
- **Методы:** `render(data: IProductItem): HTMLElement` — заполняет шаблон, включая описание. Управляет состоянием кнопки (активна/неактивна, текст). Добавляет обработчик на кнопку, генерирующий событие `product:addToCart`.

### `ShoppingCart`

- **Назначение:** Отображение содержимого корзины покупок в модальном окне.
- **Поля:** Элементы для списка товаров (`basket__list`), общей цены (`basket__price`), кнопки оформления заказа (`basket__button`), счетчика в хедере (`header__basket-counter`).
- **Методы:**
  - `set cartItems(items: HTMLElement[])` — обновляет список товаров в корзине. Отображает сообщение о пустой корзине, если товаров нет. Управляет активностью кнопки "Оформить".
  - `updateCartCounter(value: number): void` — обновляет счётчик товаров в хедере.
  - `updateTotalPrice(total: number): void` — обновляет отображение общей стоимости.
  - `render(): HTMLElement` — возвращает корневой элемент корзины для модального окна. Добавляет обработчики на кнопки "Оформить" (`order:open`) и иконку корзины в хедере (`cart:open`).

### `CartItem`

- **Назначение:** Отображение одного товара в списке корзины.
- **Поля:** Элементы для индекса, названия, цены, кнопки удаления (`basket__item-delete`).
- **Методы:** `render(data: IProductItem, index: number): HTMLElement` — заполняет шаблон данными товара. Добавляет обработчик на кнопку удаления, генерирующий событие `cart:removeItem`.

### `OrderForm`

- **Назначение:** Отображение формы выбора способа оплаты и ввода адреса доставки.
- **Поля:** Элементы формы (`.form`), кнопок оплаты (`.button_alt`), поля адреса, кнопки "Далее" (`.order__button`), контейнера ошибок (`.form__errors`).
- **Методы:**
  - `set selectedPaymentMethod(paymentMethod: string)` — визуально выделяет выбранный способ оплаты.
  - `set isValid(value: boolean)` — управляет активностью кнопки "Далее".
  - `render(): HTMLElement` — возвращает корневой элемент формы. Добавляет обработчики: на кнопки оплаты (`order:paymentMethodSelected`), на ввод адреса (`order:updateAddress`), на отправку формы (`contact:open`).

### `ContactForm`

- **Назначение:** Отображение формы ввода контактной информации (email, телефон).
- **Поля:** Элементы формы (`.form`), полей ввода email и телефона (`.form__input`), кнопки "Оплатить" (`.button`), контейнера ошибок (`.form__errors`).
- **Методы:**
  - `set isValid(value: boolean)` — управляет активностью кнопки "Оплатить".
  - `render(): HTMLElement` — возвращает корневой элемент формы. Добавляет обработчики: на ввод в поля (`contactForm:inputChange`), на отправку формы (`order:complete`).

### `OrderSuccess`

- **Назначение:** Отображение сообщения об успешном оформлении заказа.
- **Поля:** Элементы для текста списания (`.order-success__description`) и кнопки закрытия (`.order-success__close`).
- **Методы:** `render(totalAmount: number): HTMLElement` — заполняет шаблон суммой списания. Добавляет обработчик на кнопку закрытия (`orderSuccess:close`).

### `ModalWindow`

- **Назначение:** Управление отображением модальных окон.
- **Поля:** Элементы модального окна (`.modal`), контентной области (`.modal__content`), кнопки закрытия (`.modal__close`).
- **Методы:**
  - `open(): void` — открывает модальное окно, генерирует событие `modal:open`.
  - `close(): void` — закрывает модальное окно, очищает контент, генерирует событие `modal:close`.
  - `set content(value: HTMLElement | null)` — устанавливает содержимое модального окна.
  - `set locked(value: boolean)` — блокирует/разблокирует прокрутку основной страницы.
  - `render(): HTMLElement` — рендерит и открывает модальное окно (используется для инициализации).

---

## Взаимодействие компонентов (Основные сценарии через Presenter - `index.ts`)

1.  **Загрузка данных:**
    - `index.ts` вызывает `fetchProductCards` у `ApiModel`.
    - При успехе, передаёт полученные данные в `DataModel` (`dataModel.products = ...`).
    - `DataModel` генерирует событие `products:loaded`.
    - `index.ts` ловит `products:loaded`, получает данные из `DataModel`, создает экземпляры `ProductCard` для каждого товара и рендерит их в галерею.

2.  **Выбор продукта:**
    - Пользователь кликает на `ProductCard`.
    - `ProductCard` генерирует событие `product:selected` с данными товара.
    - `index.ts` ловит `product:selected`, вызывает `setActiveProduct` у `DataModel`.
    - `index.ts` создает `ProductPreview`, рендерит его с данными активного товара и помещает в `ModalWindow` (`modal.content = ...`), затем открывает модальное окно (`modal.open()`).

3.  **Добавление в корзину:**
    - Пользователь нажимает кнопку "В корзину" в `ProductPreview`.
    - `ProductPreview` генерирует событие `product:addToCart`.
    - `index.ts` ловит `product:addToCart`, получает активный товар из `DataModel`, вызывает `addProduct` у `CartModel`.
    - `index.ts` обновляет счетчик в хедере (`shoppingCart.updateCartCounter(...)`), закрывает модальное окно (`modal.close()`).

4.  **Открытие корзины:**
    - Пользователь кликает на иконку корзины в хедере.
    - `ShoppingCart` генерирует событие `cart:open`.
    - `index.ts` ловит `cart:open`, получает товары из `CartModel`, создает и рендерит `CartItem` для каждого.
    - `index.ts` устанавливает отрендеренные элементы в `ShoppingCart` (`shoppingCart.cartItems = ...`), обновляет общую сумму (`shoppingCart.updateTotalPrice(...)`).
    - `index.ts` помещает `ShoppingCart` в `ModalWindow` и открывает его.

5.  **Удаление из корзины:**
    - Пользователь кликает на кнопку удаления в `CartItem`.
    - `CartItem` генерирует событие `cart:removeItem` с данными товара.
    - `index.ts` ловит `cart:removeItem`, вызывает `removeProduct` у `CartModel`.
    - `index.ts` обновляет счетчик, общую сумму и перерисовывает список товаров в `ShoppingCart` (аналогично п.4).

6.  **Начало оформления заказа:**
    - Пользователь нажимает "Оформить" в `ShoppingCart`.
    - `ShoppingCart` генерирует событие `order:open`.
    - `index.ts` ловит `order:open`, очищает ошибки в `FormModel`, устанавливает ID товаров и общую сумму.
    - `index.ts` создает `OrderForm`, рендерит его, помещает в `ModalWindow` и открывает.

7.  **Заполнение формы заказа (Адрес и Оплата):**
    - Пользователь выбирает способ оплаты (клик по кнопке).
    - `OrderForm` генерирует `order:paymentMethodSelected`.
    - `index.ts` ловит событие, вызывает `setPaymentMethod` у `FormModel`, обновляет `selectedPaymentMethod` у `OrderForm`.
    - Пользователь вводит адрес.
    - `OrderForm` генерирует `order:updateAddress`.
    - `index.ts` ловит событие, вызывает `updateAddress` у `FormModel`.
    - `FormModel` валидирует данные и генерирует `validationErrors:address`.
    - `index.ts` ловит `validationErrors:address`, обновляет состояние `isValid` и текст ошибок в `OrderForm`.

8.  **Переход к форме контактов:**
    - Пользователь нажимает "Далее" в `OrderForm`.
    - `OrderForm` генерирует событие `contact:open` (если форма валидна).
    - `index.ts` ловит `contact:open`, проверяет валидность адреса в `FormModel`.
    - `index.ts` создает `ContactForm`, рендерит его, помещает в `ModalWindow`.

9.  **Заполнение формы контактов:**
    - Пользователь вводит email и телефон.
    - `ContactForm` генерирует `contactForm:inputChange`.
    - `index.ts` ловит событие, вызывает `updateContactInfo` у `FormModel`.
    - `FormModel` валидирует данные и генерирует `validationErrors:contact`.
    - `index.ts` ловит `validationErrors:contact`, обновляет состояние `isValid` и текст ошибок в `ContactForm`.

10. **Отправка заказа:**
    - Пользователь нажимает "Оплатить" в `ContactForm`.
    - `ContactForm` генерирует `order:complete` (если форма валидна).
    - `index.ts` ловит `order:complete`, проверяет валидность контактов в `FormModel`.
    - `index.ts` вызывает `generateOrder` у `FormModel` и `submitOrder` у `ApiModel`.
    - **При успехе:** `index.ts` создает `OrderSuccess`, рендерит его с суммой из ответа API, помещает в `ModalWindow`. Очищает корзину (`CartModel.clearCart()`) и обновляет счетчик.
    - **При ошибке:** `index.ts` ловит ошибку, может отобразить ее в `ContactForm.errorContainer` или в отдельном сообщении в модальном окне.

11. **Закрытие окна успеха:**
    - Пользователь нажимает кнопку в `OrderSuccess`.
    - `OrderSuccess` генерирует `orderSuccess:close`.
    - `index.ts` ловит событие и закрывает модальное окно (`modal.close()`).

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

### `IOrderForm` (Данные форм)

```typescript
interface IOrderForm {
    paymentMethod?: string; 
    deliveryAddress?: string;
    contactPhone?: string;
    contactEmail?: string;
}
```

### `IOrder` (Полные данные для API)

```typescript
interface IOrder extends IOrderForm {
    productIds: string[];
    totalAmount: number;
    paymentMethod: string;
    deliveryAddress: string;
    contactPhone: string;
    contactEmail: string;
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