// Утилиты для платформы интервью

// Генерация уникального ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Форматирование времени
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Оценка сложности задачи
export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return '#4caf50';
    case 'medium':
      return '#ff9800';
    case 'hard':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
}

// Оценка severity бага
export function getSeverityColor(severity: 'critical' | 'major' | 'minor' | 'trivial'): string {
  switch (severity) {
    case 'critical':
      return '#d32f2f';
    case 'major':
      return '#f57c00';
    case 'minor':
      return '#fbc02d';
    case 'trivial':
      return '#9e9e9e';
    default:
      return '#9e9e9e';
  }
}

// Простая подсветка синтаксиса для отображения кода
export function highlightCode(code: string): string {
  // Ключевые слова JavaScript
  const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'export', 'import', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'true', 'false', 'null', 'undefined'];

  let highlighted = code
    // Экранирование HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Подсветка строк
  highlighted = highlighted.replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="string">$&</span>');

  // Подсветка комментариев
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');

  // Подсветка ключевых слов
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
  });

  // Подсветка чисел
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="number">$1</span>');

  return highlighted;
}

// Валидация email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Получение иконки роли
export function getRoleIcon(role: 'developer' | 'tester' | 'analyst'): string {
  switch (role) {
    case 'developer':
      return '💻';
    case 'tester':
      return '🔍';
    case 'analyst':
      return '📊';
    default:
      return '👤';
  }
}

// Получение названия роли
export function getRoleName(role: 'developer' | 'tester' | 'analyst'): string {
  switch (role) {
    case 'developer':
      return 'Разработчик';
    case 'tester':
      return 'Тестировщик';
    case 'analyst':
      return 'Аналитик';
    default:
      return 'Неизвестно';
  }
}
