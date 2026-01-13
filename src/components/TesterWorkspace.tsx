import { useState } from 'react';
import { BugReport, TestCaseDoc } from '../types';
import { testScenarios, severityLabels, priorityLabels } from '../data/rooms';
import { getSeverityColor } from '../utils/calculations';

interface TesterWorkspaceProps {
  currentTaskIndex: number;
  onNextTask: () => void;
  onPrevTask: () => void;
  bugReports: BugReport[];
  testCases: TestCaseDoc[];
  onAddBugReport: (report: Omit<BugReport, 'id' | 'reportedAt'>) => BugReport;
  onRemoveBugReport: (id: string) => void;
  onAddTestCase: (testCase: Omit<TestCaseDoc, 'id'>) => TestCaseDoc;
  onRemoveTestCase: (id: string) => void;
}

export function TesterWorkspace({
  currentTaskIndex,
  onNextTask,
  onPrevTask,
  bugReports,
  testCases,
  onAddBugReport,
  onRemoveBugReport,
  onAddTestCase,
  onRemoveTestCase,
}: TesterWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'scenario' | 'bugs' | 'testcases'>('scenario');
  const [showBugForm, setShowBugForm] = useState(false);
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);

  // Состояние формы баг-репорта
  const [bugForm, setBugForm] = useState({
    title: '',
    severity: 'major' as BugReport['severity'],
    stepsToReproduce: '',
    expectedResult: '',
    actualResult: '',
  });

  // Состояние формы тест-кейса
  const [testCaseForm, setTestCaseForm] = useState({
    title: '',
    preconditions: '',
    steps: '',
    expectedResult: '',
    priority: 'medium' as TestCaseDoc['priority'],
  });

  const currentScenario = testScenarios[currentTaskIndex];

  const handleAddBug = () => {
    if (!bugForm.title || !bugForm.stepsToReproduce) {
      alert('Заполните обязательные поля');
      return;
    }

    onAddBugReport(bugForm);
    setBugForm({
      title: '',
      severity: 'major',
      stepsToReproduce: '',
      expectedResult: '',
      actualResult: '',
    });
    setShowBugForm(false);
  };

  const handleAddTestCase = () => {
    if (!testCaseForm.title || !testCaseForm.steps) {
      alert('Заполните обязательные поля');
      return;
    }

    onAddTestCase({
      ...testCaseForm,
      steps: testCaseForm.steps.split('\n').filter(s => s.trim()),
    });
    setTestCaseForm({
      title: '',
      preconditions: '',
      steps: '',
      expectedResult: '',
      priority: 'medium',
    });
    setShowTestCaseForm(false);
  };

  if (!currentScenario) {
    return (
      <div className="workspace tester-workspace">
        <div className="completion-screen">
          <h2>Все сценарии рассмотрены!</h2>
          <p>Вы создали {bugReports.length} баг-репортов и {testCases.length} тест-кейсов.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace tester-workspace">
      {/* Левая панель - сценарий тестирования */}
      <div className="scenario-panel">
        <div className="task-tabs">
          <button
            className={`tab ${activeTab === 'scenario' ? 'active' : ''}`}
            onClick={() => setActiveTab('scenario')}
          >
            Сценарий
          </button>
          <button
            className={`tab ${activeTab === 'bugs' ? 'active' : ''}`}
            onClick={() => setActiveTab('bugs')}
          >
            Баги ({bugReports.length})
          </button>
          <button
            className={`tab ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            Тест-кейсы ({testCases.length})
          </button>
        </div>

        {activeTab === 'scenario' && (
          <div className="scenario-content">
            <div className="scenario-header">
              <h2>{currentScenario.title}</h2>
              <span className="time-limit">⏱️ {currentScenario.timeLimit} мин</span>
            </div>
            <div className="scenario-description">
              <pre>{currentScenario.description}</pre>
            </div>
            <div className="demo-app-link">
              <h4>Тестируемое приложение:</h4>
              <div className="demo-placeholder">
                <p>Демо-приложение: {currentScenario.applicationUrl}</p>
                <div className="demo-form">
                  {currentScenario.id === 'scenario-1' && (
                    <div className="demo-registration">
                      <h5>Форма регистрации (демо)</h5>
                      <input type="text" placeholder="Email" />
                      <input type="password" placeholder="Пароль" />
                      <input type="password" placeholder="Подтверждение пароля" />
                      <input type="text" placeholder="Имя пользователя" />
                      <label>
                        <input type="checkbox" /> Согласен с условиями
                      </label>
                      <button>Зарегистрироваться</button>
                    </div>
                  )}
                  {currentScenario.id === 'scenario-2' && (
                    <div className="demo-cart">
                      <h5>Корзина покупок (демо)</h5>
                      <div className="cart-item">
                        <span>Товар 1</span>
                        <input type="number" defaultValue={1} min={-99} />
                        <span>1000 руб.</span>
                      </div>
                      <input type="text" placeholder="Промокод" />
                      <button>Применить</button>
                    </div>
                  )}
                  {currentScenario.id === 'scenario-3' && (
                    <div className="demo-login">
                      <h5>Авторизация (демо)</h5>
                      <input type="text" placeholder="Email" />
                      <input type="password" placeholder="Пароль" />
                      <label>
                        <input type="checkbox" /> Запомнить меня
                      </label>
                      <button>Войти</button>
                      <a href="#">Забыли пароль?</a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bugs' && (
          <div className="bugs-content">
            <div className="bugs-header">
              <h3>Найденные баги</h3>
              <button className="add-btn" onClick={() => setShowBugForm(true)}>
                + Добавить баг
              </button>
            </div>
            <div className="bugs-list">
              {bugReports.length === 0 ? (
                <p className="empty-message">Баги ещё не добавлены</p>
              ) : (
                bugReports.map((bug) => (
                  <div key={bug.id} className="bug-card">
                    <div className="bug-header">
                      <span
                        className="severity-badge"
                        style={{ backgroundColor: getSeverityColor(bug.severity) }}
                      >
                        {severityLabels[bug.severity]}
                      </span>
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveBugReport(bug.id)}
                      >
                        ×
                      </button>
                    </div>
                    <h4>{bug.title}</h4>
                    <div className="bug-details">
                      <p><strong>Шаги:</strong> {bug.stepsToReproduce}</p>
                      <p><strong>Ожидалось:</strong> {bug.expectedResult}</p>
                      <p><strong>Результат:</strong> {bug.actualResult}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="testcases-content">
            <div className="testcases-header">
              <h3>Тест-кейсы</h3>
              <button className="add-btn" onClick={() => setShowTestCaseForm(true)}>
                + Добавить тест-кейс
              </button>
            </div>
            <div className="testcases-list">
              {testCases.length === 0 ? (
                <p className="empty-message">Тест-кейсы ещё не добавлены</p>
              ) : (
                testCases.map((tc) => (
                  <div key={tc.id} className="testcase-card">
                    <div className="testcase-header">
                      <span className={`priority-badge priority-${tc.priority}`}>
                        {priorityLabels[tc.priority]}
                      </span>
                      <button
                        className="remove-btn"
                        onClick={() => onRemoveTestCase(tc.id)}
                      >
                        ×
                      </button>
                    </div>
                    <h4>{tc.title}</h4>
                    <div className="testcase-details">
                      {tc.preconditions && (
                        <p><strong>Предусловия:</strong> {tc.preconditions}</p>
                      )}
                      <div className="steps">
                        <strong>Шаги:</strong>
                        <ol>
                          {tc.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <p><strong>Ожидаемый результат:</strong> {tc.expectedResult}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="task-navigation">
          <button onClick={onPrevTask} disabled={currentTaskIndex === 0}>
            ← Предыдущий
          </button>
          <span className="task-counter">
            {currentTaskIndex + 1} / {testScenarios.length}
          </span>
          <button onClick={onNextTask} disabled={currentTaskIndex === testScenarios.length - 1}>
            Следующий →
          </button>
        </div>
      </div>

      {/* Модальное окно добавления бага */}
      {showBugForm && (
        <div className="modal-overlay" onClick={() => setShowBugForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Новый баг-репорт</h3>
            <div className="form-group">
              <label>Название *</label>
              <input
                type="text"
                value={bugForm.title}
                onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                placeholder="Краткое описание бага"
              />
            </div>
            <div className="form-group">
              <label>Критичность</label>
              <select
                value={bugForm.severity}
                onChange={(e) => setBugForm({ ...bugForm, severity: e.target.value as BugReport['severity'] })}
              >
                <option value="critical">Критический</option>
                <option value="major">Значительный</option>
                <option value="minor">Незначительный</option>
                <option value="trivial">Тривиальный</option>
              </select>
            </div>
            <div className="form-group">
              <label>Шаги воспроизведения *</label>
              <textarea
                value={bugForm.stepsToReproduce}
                onChange={(e) => setBugForm({ ...bugForm, stepsToReproduce: e.target.value })}
                placeholder="1. Открыть страницу&#10;2. Ввести данные&#10;3. Нажать кнопку"
              />
            </div>
            <div className="form-group">
              <label>Ожидаемый результат</label>
              <textarea
                value={bugForm.expectedResult}
                onChange={(e) => setBugForm({ ...bugForm, expectedResult: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Фактический результат</label>
              <textarea
                value={bugForm.actualResult}
                onChange={(e) => setBugForm({ ...bugForm, actualResult: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowBugForm(false)}>Отмена</button>
              <button className="primary" onClick={handleAddBug}>Добавить</button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно добавления тест-кейса */}
      {showTestCaseForm && (
        <div className="modal-overlay" onClick={() => setShowTestCaseForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Новый тест-кейс</h3>
            <div className="form-group">
              <label>Название *</label>
              <input
                type="text"
                value={testCaseForm.title}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, title: e.target.value })}
                placeholder="Название тест-кейса"
              />
            </div>
            <div className="form-group">
              <label>Приоритет</label>
              <select
                value={testCaseForm.priority}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, priority: e.target.value as TestCaseDoc['priority'] })}
              >
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
            </div>
            <div className="form-group">
              <label>Предусловия</label>
              <textarea
                value={testCaseForm.preconditions}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, preconditions: e.target.value })}
                placeholder="Условия перед началом теста"
              />
            </div>
            <div className="form-group">
              <label>Шаги (каждый шаг с новой строки) *</label>
              <textarea
                value={testCaseForm.steps}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, steps: e.target.value })}
                placeholder="Открыть страницу&#10;Ввести email&#10;Нажать кнопку"
              />
            </div>
            <div className="form-group">
              <label>Ожидаемый результат</label>
              <textarea
                value={testCaseForm.expectedResult}
                onChange={(e) => setTestCaseForm({ ...testCaseForm, expectedResult: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowTestCaseForm(false)}>Отмена</button>
              <button className="primary" onClick={handleAddTestCase}>Добавить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
