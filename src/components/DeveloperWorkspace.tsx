import { useState, useEffect } from 'react';
import { codingTasks, difficultyLabels } from '../data/furniture';
import { getDifficultyColor } from '../utils/calculations';

interface DeveloperWorkspaceProps {
  code: string;
  onCodeChange: (code: string) => void;
  currentTaskIndex: number;
  onNextTask: () => void;
  onPrevTask: () => void;
  completedTasks: string[];
  onCompleteTask: (taskId: string) => void;
}

export function DeveloperWorkspace({
  code,
  onCodeChange,
  currentTaskIndex,
  onNextTask,
  onPrevTask,
  completedTasks,
  onCompleteTask,
}: DeveloperWorkspaceProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'tests'>('task');

  const currentTask = codingTasks[currentTaskIndex];
  const isCompleted = completedTasks.includes(currentTask?.id || '');

  // Инициализация кода при смене задачи
  useEffect(() => {
    if (currentTask && !code) {
      onCodeChange(currentTask.starterCode);
    }
  }, [currentTask]);

  // При смене задачи загружаем стартовый код
  useEffect(() => {
    if (currentTask) {
      onCodeChange(currentTask.starterCode);
      setOutput('');
    }
  }, [currentTaskIndex]);

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Выполнение кода...\n');

    // Симуляция выполнения кода
    setTimeout(() => {
      try {
        // Простая симуляция - в реальном приложении здесь был бы sandbox
        const results: string[] = [];
        const visibleTests = currentTask?.testCases.filter(t => !t.isHidden) || [];

        visibleTests.forEach((test, index) => {
          // Симулируем прохождение тестов случайным образом
          const passed = Math.random() > 0.3;
          results.push(
            `Тест ${index + 1}: ${passed ? '✓ Пройден' : '✗ Не пройден'}\n` +
            `  Вход: ${test.input}\n` +
            `  Ожидалось: ${test.expectedOutput}\n`
          );
        });

        setOutput(results.join('\n') + '\n\nВыполнение завершено.');
      } catch (error) {
        setOutput(`Ошибка: ${error}`);
      }
      setIsRunning(false);
    }, 1500);
  };

  const handleSubmit = () => {
    if (window.confirm('Отправить решение? После отправки вы перейдёте к следующей задаче.')) {
      onCompleteTask(currentTask.id);
      setOutput('Решение отправлено!');
      if (currentTaskIndex < codingTasks.length - 1) {
        setTimeout(() => onNextTask(), 1000);
      }
    }
  };

  if (!currentTask) {
    return (
      <div className="workspace developer-workspace">
        <div className="completion-screen">
          <h2>Все задачи выполнены!</h2>
          <p>Вы завершили {completedTasks.length} из {codingTasks.length} задач.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace developer-workspace">
      {/* Левая панель - описание задачи */}
      <div className="task-panel">
        <div className="task-tabs">
          <button
            className={`tab ${activeTab === 'task' ? 'active' : ''}`}
            onClick={() => setActiveTab('task')}
          >
            Задача
          </button>
          <button
            className={`tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('tests')}
          >
            Тесты
          </button>
        </div>

        {activeTab === 'task' ? (
          <div className="task-content">
            <div className="task-header">
              <h2>{currentTask.title}</h2>
              <div className="task-meta">
                <span
                  className="difficulty-badge"
                  style={{ backgroundColor: getDifficultyColor(currentTask.difficulty) }}
                >
                  {difficultyLabels[currentTask.difficulty]}
                </span>
                <span className="time-limit">⏱️ {currentTask.timeLimit} мин</span>
              </div>
            </div>
            <div className="task-description">
              <pre>{currentTask.description}</pre>
            </div>
          </div>
        ) : (
          <div className="tests-content">
            <h3>Примеры тестов</h3>
            <div className="test-cases">
              {currentTask.testCases
                .filter(t => !t.isHidden)
                .map((test, index) => (
                  <div key={test.id} className="test-case">
                    <div className="test-header">Тест {index + 1}</div>
                    <div className="test-row">
                      <span className="test-label">Вход:</span>
                      <code>{test.input}</code>
                    </div>
                    <div className="test-row">
                      <span className="test-label">Выход:</span>
                      <code>{test.expectedOutput}</code>
                    </div>
                  </div>
                ))}
            </div>
            <p className="hidden-tests-note">
              + {currentTask.testCases.filter(t => t.isHidden).length} скрытых тестов
            </p>
          </div>
        )}

        <div className="task-navigation">
          <button
            onClick={onPrevTask}
            disabled={currentTaskIndex === 0}
          >
            ← Предыдущая
          </button>
          <span className="task-counter">
            {currentTaskIndex + 1} / {codingTasks.length}
          </span>
          <button
            onClick={onNextTask}
            disabled={currentTaskIndex === codingTasks.length - 1}
          >
            Следующая →
          </button>
        </div>
      </div>

      {/* Правая панель - редактор кода */}
      <div className="code-panel">
        <div className="code-header">
          <span className="language-badge">{currentTask.language.toUpperCase()}</span>
          {isCompleted && <span className="completed-badge">✓ Выполнено</span>}
        </div>
        <div className="code-editor-container">
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
            placeholder="Напишите ваш код здесь..."
          />
        </div>
        <div className="code-actions">
          <button
            className="run-btn"
            onClick={handleRunCode}
            disabled={isRunning}
          >
            {isRunning ? 'Выполняется...' : '▶ Запустить'}
          </button>
          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isCompleted}
          >
            Отправить решение
          </button>
        </div>
        <div className="output-panel">
          <div className="output-header">Вывод</div>
          <pre className="output-content">{output || 'Нажмите "Запустить" для проверки кода'}</pre>
        </div>
      </div>
    </div>
  );
}
