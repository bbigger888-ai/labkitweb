import { Role } from '../types';
import { getRoleIcon, getRoleName } from '../utils/calculations';

interface RoleSelectionProps {
  onSelectRole: (role: Role) => void;
  candidateName: string;
  onCandidateNameChange: (name: string) => void;
}

export function RoleSelection({
  onSelectRole,
  candidateName,
  onCandidateNameChange,
}: RoleSelectionProps) {
  const roles: { role: Role; description: string }[] = [
    {
      role: 'developer',
      description: 'Решение алгоритмических задач, написание кода, работа с тестами',
    },
    {
      role: 'tester',
      description: 'Тестирование приложений, поиск багов, написание тест-кейсов',
    },
    {
      role: 'analyst',
      description: 'Анализ требований, моделирование процессов, работа с данными',
    },
  ];

  return (
    <div className="role-selection">
      <div className="role-selection-header">
        <h1>Платформа технического интервью</h1>
        <p>Выберите роль для прохождения интервью</p>
      </div>

      <div className="candidate-name-input">
        <label htmlFor="candidateName">Ваше имя:</label>
        <input
          id="candidateName"
          type="text"
          value={candidateName}
          onChange={(e) => onCandidateNameChange(e.target.value)}
          placeholder="Введите ваше имя"
        />
      </div>

      <div className="roles-grid">
        {roles.map(({ role, description }) => (
          <button
            key={role}
            className="role-card"
            onClick={() => onSelectRole(role)}
          >
            <span className="role-icon">{getRoleIcon(role)}</span>
            <h2 className="role-title">{getRoleName(role)}</h2>
            <p className="role-description">{description}</p>
            <span className="role-arrow">→</span>
          </button>
        ))}
      </div>

      <div className="platform-features">
        <h3>Возможности платформы:</h3>
        <ul>
          <li>Интерактивные задачи для каждой роли</li>
          <li>Встроенный редактор кода с подсветкой синтаксиса</li>
          <li>Таймер для контроля времени</li>
          <li>Автоматическое сохранение прогресса</li>
          <li>Инструменты для создания документации</li>
        </ul>
      </div>
    </div>
  );
}
