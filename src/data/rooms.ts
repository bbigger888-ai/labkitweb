import { TestScenario } from '../types';

// Сценарии тестирования для QA
export const testScenarios: TestScenario[] = [
  {
    id: 'scenario-1',
    title: 'Форма регистрации пользователя',
    description: `Протестируйте форму регистрации нового пользователя.

Форма содержит следующие поля:
- Email (обязательное)
- Пароль (обязательное, минимум 8 символов)
- Подтверждение пароля
- Имя пользователя
- Чекбокс согласия с условиями

Найдите и задокументируйте все ошибки в работе формы.`,
    applicationUrl: '/demo/registration-form',
    expectedBugs: [
      {
        id: 'bug-1',
        title: 'Email валидация принимает некорректные адреса',
        severity: 'major',
        stepsToReproduce: '1. Ввести "test@" в поле email\n2. Заполнить остальные поля\n3. Нажать "Зарегистрироваться"',
        expectedResult: 'Ошибка валидации email',
        actualResult: 'Форма отправляется',
        isHidden: false,
      },
      {
        id: 'bug-2',
        title: 'Пароли не сравниваются',
        severity: 'critical',
        stepsToReproduce: '1. Ввести разные пароли в поля "Пароль" и "Подтверждение"\n2. Заполнить остальные поля\n3. Нажать "Зарегистрироваться"',
        expectedResult: 'Ошибка несовпадения паролей',
        actualResult: 'Регистрация проходит успешно',
        isHidden: false,
      },
      {
        id: 'bug-3',
        title: 'Можно отправить форму без согласия',
        severity: 'major',
        stepsToReproduce: '1. Заполнить все поля\n2. Оставить чекбокс согласия пустым\n3. Нажать "Зарегистрироваться"',
        expectedResult: 'Ошибка: необходимо согласие',
        actualResult: 'Форма отправляется',
        isHidden: true,
      },
    ],
    timeLimit: 30,
  },
  {
    id: 'scenario-2',
    title: 'Корзина интернет-магазина',
    description: `Протестируйте функциональность корзины покупок.

Доступные действия:
- Добавление товаров в корзину
- Изменение количества
- Удаление товаров
- Применение промокода
- Расчёт итоговой стоимости

Найдите все дефекты в работе корзины.`,
    applicationUrl: '/demo/shopping-cart',
    expectedBugs: [
      {
        id: 'bug-1',
        title: 'Отрицательное количество товара',
        severity: 'critical',
        stepsToReproduce: '1. Добавить товар в корзину\n2. Уменьшить количество ниже 0\n3. Проверить итоговую сумму',
        expectedResult: 'Минимальное количество = 1 или удаление товара',
        actualResult: 'Количество становится отрицательным, сумма уменьшается',
        isHidden: false,
      },
      {
        id: 'bug-2',
        title: 'Промокод применяется несколько раз',
        severity: 'major',
        stepsToReproduce: '1. Добавить товары в корзину\n2. Применить промокод "SALE10"\n3. Применить тот же промокод ещё раз',
        expectedResult: 'Промокод применяется только один раз',
        actualResult: 'Скидка удваивается',
        isHidden: false,
      },
      {
        id: 'bug-3',
        title: 'Неверный расчёт скидки',
        severity: 'major',
        stepsToReproduce: '1. Добавить товар за 1000 руб.\n2. Применить промокод на 15%\n3. Проверить итоговую сумму',
        expectedResult: 'Сумма = 850 руб.',
        actualResult: 'Сумма = 855 руб. (ошибка округления)',
        isHidden: true,
      },
    ],
    timeLimit: 30,
  },
  {
    id: 'scenario-3',
    title: 'Авторизация пользователей',
    description: `Протестируйте систему авторизации.

Функции для проверки:
- Вход по email и паролю
- Восстановление пароля
- Блокировка после неудачных попыток
- "Запомнить меня"
- Выход из системы

Определите уязвимости и дефекты.`,
    applicationUrl: '/demo/login',
    expectedBugs: [
      {
        id: 'bug-1',
        title: 'Нет ограничения на количество попыток входа',
        severity: 'critical',
        stepsToReproduce: '1. Ввести неверный пароль 10+ раз\n2. Продолжать попытки',
        expectedResult: 'Блокировка аккаунта или CAPTCHA',
        actualResult: 'Можно пробовать бесконечно',
        isHidden: false,
      },
      {
        id: 'bug-2',
        title: 'Сессия не истекает',
        severity: 'major',
        stepsToReproduce: '1. Войти в систему\n2. Оставить браузер открытым на 24+ часа\n3. Попробовать выполнить действие',
        expectedResult: 'Перенаправление на страницу входа',
        actualResult: 'Сессия остаётся активной',
        isHidden: true,
      },
    ],
    timeLimit: 25,
  },
];

// Шаблоны тест-кейсов
export const testCaseTemplates = {
  functional: {
    title: 'Функциональный тест-кейс',
    fields: ['ID', 'Название', 'Предусловия', 'Шаги', 'Ожидаемый результат', 'Приоритет'],
  },
  regression: {
    title: 'Регрессионный тест-кейс',
    fields: ['ID', 'Название', 'Связанный дефект', 'Шаги проверки', 'Ожидаемый результат'],
  },
  smoke: {
    title: 'Smoke тест-кейс',
    fields: ['ID', 'Критичная функция', 'Быстрая проверка', 'Результат'],
  },
};

export const severityLabels = {
  critical: 'Критический',
  major: 'Значительный',
  minor: 'Незначительный',
  trivial: 'Тривиальный',
};

export const priorityLabels = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};
