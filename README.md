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

1. **Model** — отвечает за управление данными и бизнес-логику приложения. Включает состояние продуктов, корзины, форм заказа, а также взаимодействие с API. Модели не взаимодействуют напрямую с View.
2. **View** — отвечает за отображение данных пользователю и обработку пользовательского ввода (интерфейс). View компоненты генерируют события при взаимодействии пользователя, но не содержат сложной логики.
3. **Presenter (Посредник)** — содержит логику приложения и связывает Model и View. В данном проекте роль посредника выполняет основной скрипт `index.ts`, который подписывается на события от View и Model, запрашивает/обновляет данные в Model и вызывает методы View для отображения изменений. Использует событийную модель (`EventEmitter`) для слабой связанности компонентов. Обрабатывает ошибки (например, от API) и решает, как их представить пользователю. Собирает данные из разных моделей (например, `FormModel` и `CartModel`) для отправки через слой коммуникации (например, `ApiModel`).

### Основные компоненты архитектуры:

- **Данные (Model)**:
  - Управляют состоянием приложения.
  - Реализованы в классах: `DataModel` (продукты), `CartModel` (корзина), `FormModel` (данные форм заказа и валидация).
- **Представления (View)**:
  - Отвечают за отображение данных и генерацию событий пользовательского интерфейса.
  - Реализованы в классах: `ProductCard`, `ProductPreview`, `ShoppingCart`, `CartItem`, `OrderForm`, `ContactForm`, `OrderSuccess`, `ModalWindow`. Могут наследоваться от базового `Component` (если он реализован в проекте) для удобства работы с DOM.
- **Посредник (Presenter)**:
  - Содержит основную логику приложения (`index.ts`).
  - Использует событийную модель (`EventEmitter`) для связи между Model и View. Подписывается на события, обрабатывает их, взаимодействует с моделями и обновляет представления.
- **Слой коммуникации**:
  - Отвечает за взаимодействие с внешними системами (в данном случае - HTTP API).
  - Реализован в классе `ApiModel`, который использует базовый `Api` для выполнения запросов. Не хранит состояние приложения.

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

---

## Описание слоя коммуникации

### `ApiModel` (наследуется от `Api`)

- **Назначение:** Взаимодействие с API интернет-магазина. Не хранит данные приложения, а отвечает за их отправку и получение.
- **Поля:**
  - `cdnUrl: string` — базовый URL для изображений товаров.
- **Методы:**
  - `fetchProductCards(): Promise<IProductItem[]>` — получает список продуктов с сервера.
  - `submitOrder(order: IOrder): Promise<IOrderResult>` — отправляет данные заказа на сервер.

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
  - `get products()` — возвращает _копию_ списка продуктов.
  - `setActiveProduct(item: IProductItem)` — устанавливает активный продукт и генерирует событие `product:preview`.
  - `getProductById(id: string): IProductItem | undefined` — возвращает данные одного товара по его ID.

### `CartModel`

- **Назначение:** Управление состоянием корзины покупок.
- **Поля:**
  - `products: IProductItem[]` — массив продуктов в корзине.
- **Методы:**
  - `getProducts(): IProductItem[]` — возвращает _копию_ списка продуктов в корзине.
  - `getTotalCount(): number` — возвращает общее количество товаров (уникальных позиций).
  - `calculateTotalPrice(): number` — возвращает общую стоимость товаров.
  - `addProduct(product: IProductItem): void` — добавляет продукт в корзину (если его еще нет).
  - `removeProduct(product: IProductItem): void` — удаляет продукт из корзины.
  - `clearCart(): void` — очищает корзину.
  - `isProductInCart(product: IProductItem): boolean` — проверяет, есть ли товар в корзине.

### `FormModel`

- **Назначение:** Управление состоянием и валидация данных форм заказа (адрес/оплата и контакты). Хранит только данные, вводимые пользователем в формы.
- **Поля:**
  - `paymentMethod: string` — выбранный способ оплаты.
  - `contactEmail: string` — email пользователя.
  - `contactPhone: string` — телефон пользователя.
  - `deliveryAddress: string` — адрес доставки.
  - `validationErrors: FormValidationErrors` — объект с ошибками валидации.
- **Методы:**
  - `updateAddress(field: string, value: string): void` — обновляет поле адреса доставки.
  - `setPaymentMethod(method: string): void` — устанавливает способ оплаты.
  - `validateAddress(): boolean` — проверяет валидность адреса и способа оплаты, _генерирует событие_ `validationErrors:address`. Возвращает `true`, если валидация прошла успешно, иначе `false`.
  - `updateContactInfo(field: string, value: string): void` — обновляет контактные данные.
  - `validateContactInfo(): boolean` — проверяет валидность контактных данных, _генерирует событие_ `validationErrors:contact`. Возвращает `true`, если валидация прошла успешно, иначе `false`.
  - `getValidationErrors(): FormValidationErrors` — возвращает текущие ошибки валидации.
  - `clearErrors(): void` — очищает ошибки валидации.
  - `getOrderFormData(): IOrderForm` — возвращает объект с текущими данными формы.

---

## Описание компонентов представления (View)

(Все компоненты View принимают шаблон и `EventEmitter` в конструкторе)

### `ProductCard`

- **Назначение:** Отображение краткой информации о продукте на главной странице.
- **Поля:** Элементы разметки для категории, названия, изображения, цены.
- **Конструктор:** Принимает шаблон и обработчики событий. Добавляет обработчик клика на корневой элемент, который генерирует событие `product:selected` с данными товара.
- **Методы:** `render(data: IProductItem): HTMLElement` — заполняет шаблон данными и возвращает готовый DOM-элемент.

### `ProductPreview` (наследуется от `ProductCard`)

- **Назначение:** Отображение подробной информации о выбранном продукте в модальном окне.
- **Поля:** Добавляются элементы для описания и кнопки действия ("В корзину" / "Не продается").
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчик на кнопку действия, генерирующий событие `product:addToCart`.
- **Методы:** `render(data: IProductItem): HTMLElement` — переопределяет родительский метод. Заполняет шаблон, включая описание. Управляет состоянием кнопки (активна/неактивна, текст).

### `ShoppingCart`

- **Назначение:** Отображение содержимого корзины покупок в модальном окне.
- **Поля:** Элементы для списка товаров (`basket__list`), общей цены (`basket__price`), кнопки оформления заказа (`basket__button`).
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчик на кнопку "Оформить", генерирующий событие `order:open`.
- **Методы:**
  - `set cartItems(items: HTMLElement[])` — обновляет список товаров в корзине. Отображает сообщение о пустой корзине, если товаров нет. Управляет активностью кнопки "Оформить".
  - `updateTotalPrice(total: number): void` — обновляет отображение общей стоимости.
  - `render(): HTMLElement` — возвращает корневой элемент корзины для модального окна.

### `CartItem`

- **Назначение:** Отображение одного товара в списке корзины. (Примечание: `CartItem` имеет схожий функционал с `ProductCard`. Для улучшения кода можно рассмотреть вынесение общей логики рендеринга базовых данных товара в общий родительский класс).
- **Поля:** Элементы для индекса, названия, цены, кнопки удаления (`basket__item-delete`).
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчик на кнопку удаления, генерирующий событие `cart:removeItem` с данными товара.
- **Методы:** `render(data: IProductItem, index: number): HTMLElement` — заполняет шаблон данными товара.

### `OrderForm`

- **Назначение:** Отображение формы выбора способа оплаты и ввода адреса доставки. (Примечание: Общую логику для форм, такую как управление валидностью кнопки отправки и отображение ошибок, можно вынести в базовый класс Form).
- **Поля:** Элементы формы (`.form`), кнопок оплаты (`.button_alt`), поля адреса, кнопки "Далее" (`.order__button`), контейнера ошибок (`.form__errors`).
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчики: на кнопки оплаты (`order:paymentMethodSelected`), на ввод адреса (`order:updateAddress`), на отправку формы (`submit`), которая генерирует событие `contact:open`.
- **Методы:**
  - `set selectedPaymentMethod(paymentMethod: string)` — визуально выделяет выбранный способ оплаты.
  - `set isValid(value: boolean)` — управляет активностью кнопки "Далее".
  - `render(): HTMLElement` — возвращает корневой элемент формы.

### `ContactForm`

- **Назначение:** Отображение формы ввода контактной информации (email, телефон). (Примечание: Общую логику для форм можно вынести в базовый класс Form).
- **Поля:** Элементы формы (`.form`), полей ввода email и телефона (`.form__input`), кнопки "Оплатить" (`.button`), контейнера ошибок (`.form__errors`).
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчики: на ввод в поля (`contactForm:inputChange`), на отправку формы (`submit`), которая генерирует событие `order:complete`.
- **Методы:**
  - `set isValid(value: boolean)` — управляет активностью кнопки "Оплатить".
  - `render(): HTMLElement` — возвращает корневой элемент формы.

### `OrderSuccess`

- **Назначение:** Отображение сообщения об успешном оформлении заказа.
- **Поля:** Элементы для текста списания (`.order-success__description`) и кнопки закрытия (`.order-success__close`).
- **Конструктор:** Принимает шаблон и обработчики. Добавляет обработчик на кнопку закрытия, генерирующий событие `orderSuccess:close`.
- **Методы:** `render(totalAmount: number): HTMLElement` — заполняет шаблон суммой списания.

### `ModalWindow`

- **Назначение:** Управление отображением модальных окон.
- **Поля:** Элементы модального окна (`.modal`), контентной области (`.modal__content`), кнопки закрытия (`.modal__close`).
- **Методы:**
  - `open(): void` — открывает модальное окно, генерирует событие `modal:open`.
  - `close(): void` — закрывает модальное окно, очищает контент, генерирует событие `modal:close`.
  - `set content(value: HTMLElement | null)` — устанавливает содержимое модального окна.
  - `set locked(value: boolean)` — блокирует/разблокирует прокрутку основной страницы (если реализовано).
  - `render(): HTMLElement` — возвращает корневой элемент модального окна (используется для инициализации и добавления в DOM).

---

## Взаимодействие компонентов (Основные сценарии через Presenter - `index.ts`)

1. **Загрузка данных:**

   - `index.ts` вызывает `fetchProductCards` у `ApiModel`.
   - При успехе, передаёт полученные данные в `DataModel` (`dataModel.products = ...`).
   - `DataModel` генерирует событие `products:loaded`.
   - `index.ts` ловит `products:loaded`, получает данные из `DataModel`, создает экземпляры `ProductCard` для каждого товара и рендерит их в галерею на странице.

2. **Выбор продукта:**

   - Пользователь кликает на `ProductCard`.
   - `ProductCard` генерирует событие `product:selected` с данными товара.
   - `index.ts` ловит `product:selected`, вызывает `setActiveProduct` у `DataModel`.
   - `index.ts` создает `ProductPreview`, рендерит его с данными активного товара из `DataModel`.
   - `index.ts` помещает отрендеренный `ProductPreview` в `ModalWindow` (`modal.content = ...`), затем открывает модальное окно (`modal.open()`).

3. **Добавление в корзину:**

   - Пользователь нажимает кнопку "В корзину" в `ProductPreview`.
   - `ProductPreview` генерирует событие `product:addToCart`.
   - `index.ts` ловит `product:addToCart`, получает активный товар из `DataModel`, вызывает `addProduct` у `CartModel`.
   - `index.ts` обновляет счетчик товаров в хедере (например, через отдельный компонент `Page` или напрямую обновляя DOM-элемент счетчика), закрывает модальное окно (`modal.close()`).

4. **Открытие корзины:**

   - Пользователь кликает на иконку корзины в хедере (слушатель установлен в `index.ts`).
   - `index.ts` генерирует или обрабатывает событие `cart:open`.
   - `index.ts` получает товары из `CartModel.getProducts()`, создает и рендерит `CartItem` для каждого.
   - `index.ts` получает общую сумму из `CartModel.calculateTotalPrice()`.
   - `index.ts` создает экземпляр `ShoppingCart`, устанавливает в него отрендеренные `CartItem` (`shoppingCart.cartItems = ...`) и обновляет общую сумму (`shoppingCart.updateTotalPrice(...)`).
   - `index.ts` помещает отрендеренный `ShoppingCart` в `ModalWindow` и открывает его.

5. **Удаление из корзины:**

   - Пользователь кликает на кнопку удаления в `CartItem`.
   - `CartItem` генерирует событие `cart:removeItem` с данными товара.
   - `index.ts` ловит `cart:removeItem`, вызывает `removeProduct` у `CartModel`.
   - `index.ts` обновляет счетчик в хедере, перерисовывает содержимое корзины (аналогично п.4, обновляя список `CartItem` и сумму в `ShoppingCart`).

6. **Начало оформления заказа:**

   - Пользователь нажимает "Оформить" в `ShoppingCart`.
   - `ShoppingCart` генерирует событие `order:open`.
   - `index.ts` ловит `order:open`, очищает ошибки в `FormModel` (`formModel.clearErrors()`).
   - `index.ts` создает `OrderForm`, рендерит его, помещает в `ModalWindow` и открывает, заменяя корзину.

7. **Заполнение формы заказа (Адрес и Оплата):**

   - Пользователь выбирает способ оплаты (клик по кнопке).
   - `OrderForm` генерирует `order:paymentMethodSelected`.
   - `index.ts` ловит событие, вызывает `setPaymentMethod` у `FormModel`, обновляет `selectedPaymentMethod` у `OrderForm`.
   - Пользователь вводит адрес.
   - `OrderForm` генерирует `order:updateAddress` при изменении поля.
   - `index.ts` ловит событие, вызывает `updateAddress` у `FormModel`.
   - При каждом изменении или при попытке перехода `index.ts` может инициировать валидацию (`formModel.validateAddress()`).
   - `FormModel` генерирует `validationErrors:address`.
   - `index.ts` ловит `validationErrors:address`, получает ошибки (`formModel.getValidationErrors()`), обновляет текст ошибок в `OrderForm` и состояние `isValid`.

8. **Переход к форме контактов:**

   - Пользователь нажимает "Далее" в `OrderForm`.
   - `OrderForm` генерирует событие `contact:open` (обычно при `submit` формы).
   - `index.ts` ловит `contact:open`, вызывает `formModel.validateAddress()`. Если валидно:
   - `index.ts` создает `ContactForm`, рендерит его, помещает в `ModalWindow`, заменяя `OrderForm`.

9. **Заполнение формы контактов:**

   - Пользователь вводит email и телефон.
   - `ContactForm` генерирует `contactForm:inputChange`.
   - `index.ts` ловит событие, вызывает `updateContactInfo` у `FormModel`.
   - При каждом изменении или при попытке отправки `index.ts` может инициировать валидацию (`formModel.validateContactInfo()`).
   - `FormModel` генерирует `validationErrors:contact`.
   - `index.ts` ловит `validationErrors:contact`, получает ошибки, обновляет текст ошибок в `ContactForm` и состояние `isValid`.

10. **Отправка заказа:**

    - Пользователь нажимает "Оплатить" в `ContactForm`.
    - `ContactForm` генерирует `order:complete` (обычно при `submit` формы).
    - `index.ts` ловит `order:complete`, вызывает `formModel.validateContactInfo()`. Если валидно:
    - `index.ts` получает данные формы из `FormModel.getOrderFormData()`.
    - `index.ts` получает ID товаров и общую сумму из `CartModel`.
    - `index.ts` формирует полный объект заказа `IOrder`.
    - `index.ts` вызывает `submitOrder` у `ApiModel` с объектом заказа.
    - **При успехе:** `index.ts` получает результат `IOrderResult`. Создает `OrderSuccess`, рендерит его с суммой из ответа API (`result.totalAmount`), помещает в `ModalWindow`. Вызывает `CartModel.clearCart()` и обновляет счетчик корзины в хедере.
    - **При ошибке:** `index.ts` ловит ошибку от `ApiModel`, может отобразить ее в `ContactForm.errorContainer` или в отдельном сообщении в модальном окне.

11. **Закрытие окна успеха:**
    - Пользователь нажимает кнопку "За новыми покупками" в `OrderSuccess`.
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
	items: string[];
	total: number;
}
```

### `IOrderResult` (Результат успешного заказа от API)

```typescript
interface IOrderResult {
	id: string;
	total: number;
}
```

### `FormValidationErrors` (Ошибки валидации)

```typescript
type FormValidationErrors = Partial<
	Record<keyof IOrderForm | 'common', string>
>;
```

### `IActions` (Для передачи обработчиков в View)

```typescript
interface IActions {
	onClick?: (event: MouseEvent) => void;
}
```
