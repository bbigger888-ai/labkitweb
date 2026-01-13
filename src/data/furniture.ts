import { CodingTask } from '../types';

// Задачи для разработчиков
export const codingTasks: CodingTask[] = [
  {
    id: 'task-1',
    title: 'Переворот строки',
    description: `Напишите функцию reverseString, которая принимает строку и возвращает её в перевёрнутом виде.

Примеры:
- reverseString("hello") → "olleh"
- reverseString("JavaScript") → "tpircSavaJ"
- reverseString("") → ""`,
    difficulty: 'easy',
    language: 'javascript',
    starterCode: `function reverseString(str) {
  // Ваш код здесь

}

// Не изменяйте код ниже
module.exports = { reverseString };`,
    testCases: [
      { id: 't1', input: 'hello', expectedOutput: 'olleh', isHidden: false },
      { id: 't2', input: 'JavaScript', expectedOutput: 'tpircSavaJ', isHidden: false },
      { id: 't3', input: '', expectedOutput: '', isHidden: false },
      { id: 't4', input: 'a', expectedOutput: 'a', isHidden: true },
      { id: 't5', input: '12345', expectedOutput: '54321', isHidden: true },
    ],
    timeLimit: 15,
  },
  {
    id: 'task-2',
    title: 'Поиск дубликатов',
    description: `Напишите функцию findDuplicates, которая принимает массив чисел и возвращает массив дубликатов (элементы, встречающиеся более одного раза).

Результат должен содержать только уникальные дубликаты в порядке их первого появления.

Примеры:
- findDuplicates([1, 2, 3, 2, 4, 3]) → [2, 3]
- findDuplicates([1, 1, 1, 1]) → [1]
- findDuplicates([1, 2, 3]) → []`,
    difficulty: 'medium',
    language: 'javascript',
    starterCode: `function findDuplicates(arr) {
  // Ваш код здесь

}

// Не изменяйте код ниже
module.exports = { findDuplicates };`,
    testCases: [
      { id: 't1', input: '[1, 2, 3, 2, 4, 3]', expectedOutput: '[2, 3]', isHidden: false },
      { id: 't2', input: '[1, 1, 1, 1]', expectedOutput: '[1]', isHidden: false },
      { id: 't3', input: '[1, 2, 3]', expectedOutput: '[]', isHidden: false },
      { id: 't4', input: '[]', expectedOutput: '[]', isHidden: true },
      { id: 't5', input: '[5, 5, 5, 3, 3, 1]', expectedOutput: '[5, 3]', isHidden: true },
    ],
    timeLimit: 20,
  },
  {
    id: 'task-3',
    title: 'Сбалансированные скобки',
    description: `Напишите функцию isBalanced, которая проверяет, сбалансированы ли скобки в строке.

Поддерживаемые типы скобок: (), [], {}

Примеры:
- isBalanced("()") → true
- isBalanced("([{}])") → true
- isBalanced("([)]") → false
- isBalanced("((") → false`,
    difficulty: 'medium',
    language: 'javascript',
    starterCode: `function isBalanced(str) {
  // Ваш код здесь

}

// Не изменяйте код ниже
module.exports = { isBalanced };`,
    testCases: [
      { id: 't1', input: '()', expectedOutput: 'true', isHidden: false },
      { id: 't2', input: '([{}])', expectedOutput: 'true', isHidden: false },
      { id: 't3', input: '([)]', expectedOutput: 'false', isHidden: false },
      { id: 't4', input: '((', expectedOutput: 'false', isHidden: false },
      { id: 't5', input: '', expectedOutput: 'true', isHidden: true },
      { id: 't6', input: '{[()]}[]', expectedOutput: 'true', isHidden: true },
    ],
    timeLimit: 25,
  },
  {
    id: 'task-4',
    title: 'Плоский массив',
    description: `Напишите функцию flattenArray, которая преобразует вложенный массив в одномерный.

Функция должна работать с любым уровнем вложенности.

Примеры:
- flattenArray([1, [2, 3], [4, [5, 6]]]) → [1, 2, 3, 4, 5, 6]
- flattenArray([[1], [[2]], [[[3]]]]) → [1, 2, 3]
- flattenArray([]) → []`,
    difficulty: 'hard',
    language: 'javascript',
    starterCode: `function flattenArray(arr) {
  // Ваш код здесь

}

// Не изменяйте код ниже
module.exports = { flattenArray };`,
    testCases: [
      { id: 't1', input: '[1, [2, 3], [4, [5, 6]]]', expectedOutput: '[1, 2, 3, 4, 5, 6]', isHidden: false },
      { id: 't2', input: '[[1], [[2]], [[[3]]]]', expectedOutput: '[1, 2, 3]', isHidden: false },
      { id: 't3', input: '[]', expectedOutput: '[]', isHidden: false },
      { id: 't4', input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]', isHidden: true },
      { id: 't5', input: '[[[[[[1]]]]]]', expectedOutput: '[1]', isHidden: true },
    ],
    timeLimit: 30,
  },
  {
    id: 'task-5',
    title: 'Debounce функция',
    description: `Реализуйте функцию debounce, которая ограничивает частоту вызова переданной функции.

Debounce откладывает выполнение функции до тех пор, пока не пройдёт указанное время с момента последнего вызова.

Примеры использования:
const debouncedFn = debounce(console.log, 1000);
debouncedFn("a"); // ничего
debouncedFn("b"); // ничего
// через 1 секунду выведет "b"`,
    difficulty: 'hard',
    language: 'javascript',
    starterCode: `function debounce(fn, delay) {
  // Ваш код здесь

}

// Не изменяйте код ниже
module.exports = { debounce };`,
    testCases: [
      { id: 't1', input: 'basic', expectedOutput: 'delayed call', isHidden: false },
      { id: 't2', input: 'multiple', expectedOutput: 'last call only', isHidden: false },
      { id: 't3', input: 'args', expectedOutput: 'preserves arguments', isHidden: true },
    ],
    timeLimit: 30,
  },
];

export const difficultyLabels = {
  easy: 'Легко',
  medium: 'Средне',
  hard: 'Сложно',
};

export const languageLabels = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
};
